import bootstrap from "../../content/bootstrap.json";
import menu from "../../content/menu.json";
import { type EventPage } from "../../domain/models";
import { type AboutPage, createMobileApiRepository, type MobileApiRepository } from "./httpRepository";
import { fakeScheduleService, type ScheduleQuery } from "./fakeScheduleService";

export type MobileRepository = MobileApiRepository & {
  bootstrap: () => Promise<typeof bootstrap>;
  menu: () => Promise<typeof menu>;
  events: (query?: ScheduleQuery, signal?: AbortSignal) => Promise<EventPage>;
};

const mockAbout: AboutPage = {
  updatedAt: "2026-08-13T12:00:00Z",
  hero: bootstrap.content.heroTitle,
  stats: [],
  sections: []
};

export const mockRepository: MobileRepository = {
  bootstrap: async () => bootstrap,
  menu: async () => menu,
  states: () => fakeScheduleService.states(),
  events: async query => fakeScheduleService.events(query),
  about: async () => mockAbout,
  lastUpdatedAt: async () => null,
  sourceFor: () => "test"
};

const unavailableSchedule = () => Promise.reject(new Error("Truck schedule is unavailable."));

export const bundledProductionRepository: MobileApiRepository = {
  bootstrap: async () => bootstrap,
  menu: async () => menu,
  about: async () => mockAbout,
  states: async () => [],
  events: unavailableSchedule,
  lastUpdatedAt: async () => null,
  sourceFor: resource => (resource === "events" || resource === "states" ? "unavailable" : "bundled")
};

function withOptionalRemote(baseUrl: string): MobileApiRepository {
  const remote = createMobileApiRepository(baseUrl);
  return {
    bootstrap: async () => remote.bootstrap().catch(() => bundledProductionRepository.bootstrap()),
    menu: async () => remote.menu().catch(() => bundledProductionRepository.menu()),
    about: async () => remote.about().catch(() => bundledProductionRepository.about()),
    states: () => remote.states(),
    events: (query, signal) => remote.events(query, signal),
    lastUpdatedAt: resource => remote.lastUpdatedAt(resource),
    sourceFor: resource => {
      const source = remote.sourceFor(resource);
      return source === "unavailable" && ["bootstrap", "menu", "about"].includes(resource) ? "bundled" : source;
    }
  };
}

export function getMobileRepository(mockEnabled: boolean, apiBaseUrl?: string): MobileApiRepository {
  if (mockEnabled) return mockRepository;
  return apiBaseUrl ? withOptionalRemote(apiBaseUrl) : bundledProductionRepository;
}
