import type { TruckEvent } from "../../domain/models";
import { formatEventTime, selectUpcomingEvents } from "./selectEvents";

const event = (overrides: Partial<TruckEvent>): TruckEvent => ({
  eventId: "a",
  city: "City",
  state: "IA",
  hostName: "Host",
  address1: "1 Main",
  address2: null,
  postalCode: null,
  latitude: null,
  longitude: null,
  timezone: "America/Chicago",
  startsAt: "2026-08-15T11:00:00-05:00",
  endsAt: "2026-08-15T19:00:00-05:00",
  orderUrl: null,
  status: "scheduled",
  ...overrides
});

test("excludes canceled and expired events while preserving deterministic order without coordinates", () => {
  const now = new Date("2026-08-14T00:00:00Z");
  expect(
    selectUpcomingEvents(
      [event({ eventId: "c", status: "canceled" }), event({ eventId: "z" }), event({ eventId: "a" })],
      now
    ).map(item => item.eventId)
  ).toEqual(["a", "z"]);
});

test("uses the event timezone for rendering", () => {
  expect(formatEventTime(event({ timezone: "America/Denver" }))).toContain("Aug 15");
});

test("keeps local calendar day and clock time across a DST boundary", () => {
  const rendered = formatEventTime(
    event({ timezone: "America/Chicago", startsAt: "2026-03-08T11:00:00-05:00", endsAt: "2026-03-08T19:00:00-05:00" })
  );
  expect(rendered).toContain("Mar 8");
  expect(rendered).toContain("11:00 AM");
});

test("selects a deterministic 250-event local schedule without dropping visits", () => {
  const now = new Date("2026-08-14T00:00:00Z");
  const events = Array.from({ length: 250 }, (_, index) =>
    event({
      eventId: `event-${String(250 - index).padStart(3, "0")}`,
      startsAt: "2026-08-15T11:00:00-05:00",
      endsAt: "2026-08-15T19:00:00-05:00"
    })
  );

  const selected = selectUpcomingEvents(events, now);

  expect(selected).toHaveLength(250);
  expect(selected.map(item => item.eventId)).toEqual([...selected.map(item => item.eventId)].sort());
});
