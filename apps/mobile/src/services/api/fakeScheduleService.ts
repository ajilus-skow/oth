import fixtureEvents from "../../fixtures/truck-events.json";
import { parseEventPage, type EventPage } from "../../domain/models";

export type ScheduleQuery = {
  from?: string;
  to?: string;
  state?: string;
  query?: string;
  limit?: number;
};

export type ScheduleState = { code: string; name: string };

const parsedFixtureEvents = parseEventPage(fixtureEvents);

function matches(value: string | null, query: string): boolean {
  return value?.toLowerCase().includes(query) ?? false;
}

/** Deterministic schedule data used only by development and automated tests. */
export const fakeScheduleService = {
  async events(query: ScheduleQuery = {}): Promise<EventPage> {
    const normalizedQuery = query.query?.trim().toLowerCase() ?? "";
    const state = query.state?.trim().toUpperCase();
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 250);
    const events = parsedFixtureEvents.events
      .filter(event => !state || event.state === state)
      .filter(event => !query.from || event.startsAt.slice(0, 10) >= query.from)
      .filter(event => !query.to || event.startsAt.slice(0, 10) <= query.to)
      .filter(
        event =>
          !normalizedQuery ||
          matches(event.city, normalizedQuery) ||
          matches(event.state, normalizedQuery) ||
          matches(event.hostName, normalizedQuery) ||
          matches(event.postalCode, normalizedQuery)
      )
      .slice(0, limit);
    return { updatedAt: parsedFixtureEvents.updatedAt, nextCursor: null, events };
  },

  async states(): Promise<ScheduleState[]> {
    return [...new Set(parsedFixtureEvents.events.map(event => event.state))]
      .sort()
      .map(code => ({ code, name: code }));
  }
};
