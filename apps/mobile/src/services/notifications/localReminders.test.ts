import { NativeModules, Platform } from "react-native";
import type { TruckEvent } from "../../domain/models";
import { cancelLocalReminder, scheduleLocalReminder } from "./localReminders";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined)
}));

const event: TruckEvent = {
  eventId: "visit-1",
  city: "Cheyenne",
  state: "WY",
  hostName: "Depot",
  address1: "1 Main",
  address2: null,
  postalCode: "82001",
  latitude: null,
  longitude: null,
  timezone: "America/Denver",
  startsAt: "2026-08-15T11:00:00-06:00",
  endsAt: "2026-08-15T19:00:00-06:00",
  orderUrl: null,
  status: "scheduled"
};

test("schedules and cancels an event-specific local reminder on iOS", async () => {
  const schedule = jest.fn().mockResolvedValue(undefined);
  const cancel = jest.fn().mockResolvedValue(undefined);
  Object.assign(NativeModules, { OTHLocalReminders: { schedule, cancel } });
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });

  await scheduleLocalReminder(event);
  await cancelLocalReminder(event.eventId);

  expect(schedule).toHaveBeenCalledWith(
    expect.objectContaining({ id: event.eventId, fireDate: "2026-08-14T17:00:00.000Z" })
  );
  expect(cancel).toHaveBeenCalledWith(event.eventId);
});
