import { NativeModules, Platform } from "react-native";
import type { CalendarEventDraft } from "./calendarEvent";

type NativeCalendarModule = {
  addEvent(event: CalendarEventDraft): Promise<void>;
};

const calendarModule = NativeModules.OTHCalendar as NativeCalendarModule | undefined;

export async function addCalendarEvent(event: CalendarEventDraft): Promise<void> {
  if (Platform.OS !== "ios" || !calendarModule) {
    throw new Error("Calendar creation is unavailable on this device.");
  }
  await calendarModule.addEvent(event);
}
