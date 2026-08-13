import type { TruckEvent } from "../../domain/models";
import { directionsUrl } from "./directions";

const event = {
  eventId: "1",
  city: "West Des Moines",
  state: "IA",
  hostName: "Lowe's",
  address1: "1700 50th St",
  address2: null,
  postalCode: "50266",
  latitude: null,
  longitude: null,
  timezone: "America/Chicago",
  startsAt: "2026-08-15T11:00:00-05:00",
  endsAt: "2026-08-15T19:00:00-05:00",
  orderUrl: null,
  status: "scheduled"
} satisfies TruckEvent;

test("prefers coordinates and safely encodes an address fallback", () => {
  expect(directionsUrl(event)).toContain("1700%2050th%20St");
  expect(directionsUrl({ ...event, latitude: 41.5, longitude: -93.7 })).toContain("41.5%2C-93.7");
});
