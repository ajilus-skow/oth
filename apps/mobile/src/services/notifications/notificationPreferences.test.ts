import { defaultNotificationPreferences, normalizeHomeArea } from "./notificationPreferences";

test("normalizes supported home-area inputs", () => {
  expect(normalizeHomeArea("  82001 ")).toBe("82001");
  expect(normalizeHomeArea("Cheyenne,wy")).toBe("Cheyenne, wy");
  expect(normalizeHomeArea("Wyoming")).toBeNull();
});

test("uses useful opt-in defaults without a home area", () => {
  expect(defaultNotificationPreferences).toEqual({
    homeArea: "",
    scheduledNearby: true,
    dayBefore: true,
    morningOf: false
  });
});
