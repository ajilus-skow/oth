import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import type { TruckEvent } from "../../domain/models";

type LocalReminderModule = {
  schedule: (reminder: { id: string; title: string; body: string; fireDate: string }) => Promise<void>;
  cancel: (id: string) => Promise<void>;
};

const reminderKey = (eventId: string) => `oth.local-reminder.${eventId}`;
const getNativeReminders = () => NativeModules.OTHLocalReminders as LocalReminderModule | undefined;

function reminderDraft(event: TruckEvent) {
  return {
    id: event.eventId,
    title: "On The Hook is visiting tomorrow",
    body: `${event.hostName} in ${event.city}, ${event.state}`,
    fireDate: new Date(Date.parse(event.startsAt) - 24 * 60 * 60 * 1000).toISOString()
  };
}

export function localRemindersSupported(): boolean {
  return Platform.OS === "ios" && Boolean(getNativeReminders());
}

export async function hasLocalReminder(eventId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(reminderKey(eventId))) !== null;
}

export async function scheduleLocalReminder(event: TruckEvent): Promise<void> {
  const nativeReminders = getNativeReminders();
  if (!nativeReminders || Platform.OS !== "ios") throw new Error("Local reminders are not available on this device.");
  await nativeReminders.schedule(reminderDraft(event));
  await AsyncStorage.setItem(reminderKey(event.eventId), "scheduled");
}

export async function cancelLocalReminder(eventId: string): Promise<void> {
  const nativeReminders = getNativeReminders();
  if (!nativeReminders || Platform.OS !== "ios") throw new Error("Local reminders are not available on this device.");
  await nativeReminders.cancel(eventId);
  await AsyncStorage.removeItem(reminderKey(eventId));
}
