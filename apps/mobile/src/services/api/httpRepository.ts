import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseEventPage, type EventPage } from "../../domain/models";
import type { ScheduleQuery, ScheduleState } from "./fakeScheduleService";

export type AboutPage = { updatedAt: string; hero: string; stats: { label: string }[]; sections: unknown[] };
export type MobileApiRepository = {
  bootstrap: () => Promise<unknown>;
  menu: () => Promise<unknown>;
  states: () => Promise<ScheduleState[]>;
  events: (query?: ScheduleQuery, signal?: AbortSignal) => Promise<EventPage>;
  about: () => Promise<AboutPage>;
  lastUpdatedAt: (resource: ApiResource) => Promise<string | null>;
};

export type ApiResource = "bootstrap" | "menu" | "states" | "events" | "about";
type CachedResponse = { body: unknown; etag?: string; lastModified?: string; updatedAt: string };
type FetchLike = typeof fetch;
const cachePrefix = "oth.api-cache.v1.";
const refreshWindows: Record<ApiResource, number> = {
  bootstrap: 24 * 60 * 60_000,
  menu: 24 * 60 * 60_000,
  about: 24 * 60 * 60_000,
  states: 15 * 60_000,
  events: 15 * 60_000
};

function cacheKey(resource: ApiResource, query = ""): string {
  return `${cachePrefix}${resource}${query ? `?${query}` : ""}`;
}

function isSecureApiUrl(baseUrl: string): boolean {
  const url = new URL(baseUrl);
  return url.protocol === "https:" || (__DEV__ && (url.hostname === "localhost" || url.hostname === "127.0.0.1"));
}

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label} response.`);
  return value as Record<string, unknown>;
}

function parseStates(value: unknown): ScheduleState[] {
  const response = requireObject(value, "states");
  if (!Array.isArray(response.states)) throw new Error("Invalid states response.");
  return response.states.flatMap(state => {
    const item = requireObject(state, "state");
    return typeof item.code === "string" && typeof item.name === "string" ? [{ code: item.code, name: item.name }] : [];
  });
}

function parseAbout(value: unknown): AboutPage {
  const response = requireObject(value, "about");
  if (typeof response.updatedAt !== "string" || typeof response.hero !== "string")
    throw new Error("Invalid about response.");
  return {
    updatedAt: response.updatedAt,
    hero: response.hero,
    stats: Array.isArray(response.stats)
      ? response.stats.filter(
          (stat): stat is { label: string } =>
            !!stat && typeof stat === "object" && typeof (stat as { label?: unknown }).label === "string"
        )
      : [],
    sections: Array.isArray(response.sections) ? response.sections : []
  };
}

export function createMobileApiRepository(baseUrl: string, fetcher: FetchLike = fetch): MobileApiRepository {
  if (!isSecureApiUrl(baseUrl)) throw new Error("Mobile API must use HTTPS outside local development.");
  const root = baseUrl.replace(/\/$/, "");

  async function load<T>(
    resource: ApiResource,
    path: string,
    parse: (value: unknown) => T,
    signal?: AbortSignal
  ): Promise<T> {
    const key = cacheKey(resource, path.includes("?") ? path.slice(path.indexOf("?")) : "");
    const cachedRaw = await AsyncStorage.getItem(key);
    const cached: CachedResponse | null = cachedRaw ? (JSON.parse(cachedRaw) as CachedResponse) : null;
    if (cached && Date.now() - Date.parse(cached.updatedAt) < refreshWindows[resource]) return parse(cached.body);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (cached?.etag) headers["If-None-Match"] = cached.etag;
    if (cached?.lastModified) headers["If-Modified-Since"] = cached.lastModified;
    let response: Response;
    try {
      response = await fetcher(`${root}/public/mobile/v1/${path}`, { headers, signal });
    } catch (error) {
      if (cached) return parse(cached.body);
      throw error;
    }
    if (response.status === 304 && cached) {
      const refreshed = { ...cached, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(key, JSON.stringify(refreshed));
      return parse(cached.body);
    }
    if (!response.ok) {
      if (cached) return parse(cached.body);
      throw new Error(`Mobile API request failed (${response.status}).`);
    }
    const body: unknown = await response.json();
    const parsed = parse(body);
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        body,
        etag: response.headers.get("ETag") ?? undefined,
        lastModified: response.headers.get("Last-Modified") ?? undefined,
        updatedAt: new Date().toISOString()
      } satisfies CachedResponse)
    );
    return parsed;
  }

  return {
    bootstrap: () => load("bootstrap", "bootstrap", value => requireObject(value, "bootstrap")),
    menu: () => load("menu", "menu", value => requireObject(value, "menu")),
    states: () => load("states", "states", parseStates),
    events: (query = {}, signal) => {
      const params = new URLSearchParams();
      if (query.from) params.set("from", query.from);
      if (query.to) params.set("to", query.to);
      if (query.state) params.set("state", query.state);
      if (query.query) params.set("q", query.query);
      if (query.limit) params.set("limit", String(query.limit));
      const suffix = params.size ? `?${params}` : "";
      return load("events", `events${suffix}`, parseEventPage, signal);
    },
    about: () => load("about", "about", parseAbout),
    async lastUpdatedAt(resource) {
      const cached = await AsyncStorage.getItem(cacheKey(resource));
      return cached ? (JSON.parse(cached) as CachedResponse).updatedAt : null;
    }
  };
}
