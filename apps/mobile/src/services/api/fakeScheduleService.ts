import currentSchedule from "../../fixtures/current-schedule.json";
import { parseEventPage, type EventPage, type TruckEvent } from "../../domain/models";

export type ScheduleQuery = {
  from?: string;
  to?: string;
  state?: string;
  query?: string;
  limit?: number;
};

export type ScheduleState = { code: string; name: string };

const stateNames: Record<string, string> = {
  CO: "Colorado",
  IA: "Iowa",
  ID: "Idaho",
  KS: "Kansas",
  KY: "Kentucky",
  MN: "Minnesota",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  OR: "Oregon",
  PA: "Pennsylvania",
  TX: "Texas",
  UT: "Utah",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming"
};
const timezones: Record<string, { name: string; offset: string }> = {
  CO: { name: "America/Denver", offset: "-06:00" },
  ID: { name: "America/Boise", offset: "-06:00" },
  KS: { name: "America/Chicago", offset: "-05:00" },
  IA: { name: "America/Chicago", offset: "-05:00" },
  KY: { name: "America/New_York", offset: "-04:00" },
  MN: { name: "America/Chicago", offset: "-05:00" },
  MO: { name: "America/Chicago", offset: "-05:00" },
  MT: { name: "America/Denver", offset: "-06:00" },
  NE: { name: "America/Chicago", offset: "-05:00" },
  OR: { name: "America/Los_Angeles", offset: "-07:00" },
  PA: { name: "America/New_York", offset: "-04:00" },
  TX: { name: "America/Chicago", offset: "-05:00" },
  UT: { name: "America/Denver", offset: "-06:00" },
  WA: { name: "America/Los_Angeles", offset: "-07:00" },
  WI: { name: "America/Chicago", offset: "-05:00" },
  WV: { name: "America/New_York", offset: "-04:00" },
  WY: { name: "America/Denver", offset: "-06:00" }
};
const parsedEvents = parseEventPage({
  updatedAt: currentSchedule.source.retrievedAt,
  nextCursor: null,
  events: currentSchedule.events.map(event => {
    const zone = timezones[event.location.state] ?? { name: "America/Chicago", offset: "-05:00" };
    const addressParts = event.location.formattedAddress.split(", ");
    return {
      eventId: event.id,
      city: event.location.city,
      state: event.location.state,
      hostName: event.location.venue,
      address1: addressParts[0],
      address2: null,
      postalCode: addressParts.at(-1)?.match(/\d{5}$/)?.[0] ?? null,
      latitude: null,
      longitude: null,
      timezone: zone.name,
      startsAt: `${event.date}T${event.hours.opensLocal}:00${zone.offset}`,
      endsAt: `${event.date}T${event.hours.closesLocal}:00${zone.offset}`,
      orderUrl: event.actionsAvailable.orderNow ? "https://onthehookfishandchips.com/order-now" : null,
      status: "scheduled"
    };
  })
});

function matchesQuery(event: TruckEvent, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [event.city, event.state, event.postalCode, event.hostName].some(value =>
    value?.toLowerCase().includes(normalized)
  );
}

function isDateInRange(event: TruckEvent, from?: string, to?: string): boolean {
  const date = event.startsAt.slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
}

/**
 * Development-only replacement for the eventual structured schedule API.
 * It deliberately returns the same validated shape as a network response and
 * has no release fallback in the production repository path.
 */
export const fakeScheduleService = {
  async events(query: ScheduleQuery = {}): Promise<EventPage> {
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 250);
    const state = query.state?.trim().toUpperCase();
    const events = parsedEvents.events
      .filter(event => event.status !== "canceled")
      .filter(event => !state || event.state === state)
      .filter(event => isDateInRange(event, query.from, query.to))
      .filter(event => matchesQuery(event, query.query ?? ""))
      .sort(
        (left, right) =>
          Date.parse(left.startsAt) - Date.parse(right.startsAt) || left.eventId.localeCompare(right.eventId)
      )
      .slice(0, limit);
    return { updatedAt: parsedEvents.updatedAt, nextCursor: null, events };
  },

  async states(): Promise<ScheduleState[]> {
    return [...new Set(parsedEvents.events.filter(event => event.status !== "canceled").map(event => event.state))]
      .sort()
      .map(code => ({ code, name: stateNames[code] ?? code }));
  }
};
