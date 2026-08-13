import type { RootStackParams } from "./AppNavigator";

test("defines stable deep-link parameters for truck events", () => {
  const route: RootStackParams["EventDetail"] = { eventId: "fixture-wdm-20260815" };
  expect(route.eventId).toBe("fixture-wdm-20260815");
});
