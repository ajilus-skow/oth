jest.mock("react-native", () => ({
  NativeModules: { OTHCalendar: { addEvent: jest.fn() } },
  Platform: { OS: "ios" }
}));

import { NativeModules } from "react-native";
import { addCalendarEvent } from "./nativeCalendar";

test("passes the local calendar draft to the iOS adapter", async () => {
  const event = {
    title: "On The Hook — Johnstown at Dine In",
    startDate: "2026-08-13T11:00:00-06:00",
    endDate: "2026-08-13T20:30:00-06:00",
    location: "Dine In, 4884 Larimer Parkway, Johnstown, CO, 80534",
    notes: "On The Hook Fish & Chips truck visit."
  };

  await addCalendarEvent(event);
  expect(NativeModules.OTHCalendar.addEvent).toHaveBeenCalledWith(event);
});
