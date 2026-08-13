export type TruckEventStatus = "scheduled" | "canceled" | "rescheduled";

export type TruckEvent = {
  eventId: string;
  city: string;
  state: string;
  hostName: string;
  address1: string;
  address2: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  startsAt: string;
  endsAt: string;
  orderUrl: string | null;
  status: TruckEventStatus;
};

export type EventPage = { updatedAt: string; nextCursor: string | null; events: TruckEvent[] };

const object = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const string = (value: unknown): string | null => (typeof value === "string" && value.trim() ? value : null);
const nullableString = (value: unknown): string | null => (value === null ? null : string(value));
const nullableCoordinate = (value: unknown, minimum: number, maximum: number): number | null =>
  value === null
    ? null
    : typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum
      ? value
      : null;

export function parseEventPage(value: unknown): EventPage {
  const page = object(value);
  if (!page || !string(page.updatedAt) || !Array.isArray(page.events)) throw new Error("Invalid events response.");
  const events = page.events.flatMap(parseTruckEvent);
  return { updatedAt: page.updatedAt as string, nextCursor: nullableString(page.nextCursor), events };
}

export function parseTruckEvent(value: unknown): TruckEvent[] {
  const event = object(value);
  if (!event) return [];
  const eventId = string(event.eventId);
  const city = string(event.city);
  const state = string(event.state);
  const hostName = string(event.hostName);
  const address1 = string(event.address1);
  const timezone = string(event.timezone);
  const startsAt = string(event.startsAt);
  const endsAt = string(event.endsAt);
  const status = event.status;
  if (
    !eventId ||
    !city ||
    !state ||
    !hostName ||
    !address1 ||
    !timezone ||
    !startsAt ||
    !endsAt ||
    !["scheduled", "canceled", "rescheduled"].includes(String(status))
  )
    return [];
  if (
    Number.isNaN(Date.parse(startsAt)) ||
    Number.isNaN(Date.parse(endsAt)) ||
    Date.parse(endsAt) <= Date.parse(startsAt)
  )
    return [];
  const latitude = nullableCoordinate(event.latitude, -90, 90);
  const longitude = nullableCoordinate(event.longitude, -180, 180);
  if ((event.latitude !== null && latitude === null) || (event.longitude !== null && longitude === null)) return [];
  return [
    {
      eventId,
      city,
      state,
      hostName,
      address1,
      address2: nullableString(event.address2),
      postalCode: nullableString(event.postalCode),
      latitude,
      longitude,
      timezone,
      startsAt,
      endsAt,
      orderUrl: nullableString(event.orderUrl),
      status: status as TruckEventStatus
    }
  ];
}
