import { calendarEventFromTruckVisit } from "./calendarEvent";

test("maps an event to a timezone-preserving calendar draft", () => {
  const draft = calendarEventFromTruckVisit({
    eventId: "1",
    city: "Laramie",
    state: "WY",
    hostName: "Mingles",
    address1: "3206 Grand Ave",
    address2: null,
    postalCode: "82070",
    latitude: null,
    longitude: null,
    timezone: "America/Denver",
    startsAt: "2026-08-15T11:00:00-06:00",
    endsAt: "2026-08-15T19:00:00-06:00",
    orderUrl: null,
    status: "scheduled"
  });
  expect(draft).toMatchObject({ title: "On The Hook — Laramie at Mingles", startDate: "2026-08-15T11:00:00-06:00" });
});
