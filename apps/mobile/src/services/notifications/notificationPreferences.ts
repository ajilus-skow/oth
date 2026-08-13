import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkNotifications, openSettings, requestNotifications } from "react-native-permissions";

export type NotificationPreferences = {
  homeArea: string;
  scheduledNearby: boolean;
  dayBefore: boolean;
  morningOf: boolean;
};

export type NotificationPermissionState = "granted" | "denied" | "unavailable";

const storageKey = "oth.notification-preferences.v1";

export const defaultNotificationPreferences: NotificationPreferences = {
  homeArea: "",
  scheduledNearby: true,
  dayBefore: true,
  morningOf: false
};

export function normalizeHomeArea(value: string): string | null {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (/^\d{5}(?:-\d{4})?$/.test(normalized)) return normalized;
  if (/^[A-Za-z .'-]+,\s*[A-Za-z]{2}$/.test(normalized)) return normalized.replace(/,\s*/, ", ");
  return null;
}

export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify({ ...preferences, homeArea: normalizeHomeArea(preferences.homeArea) ?? "" })
  );
}

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return defaultNotificationPreferences;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      homeArea: typeof parsed.homeArea === "string" ? parsed.homeArea : "",
      scheduledNearby: parsed.scheduledNearby !== false,
      dayBefore: parsed.dayBefore !== false,
      morningOf: parsed.morningOf === true
    };
  } catch {
    return defaultNotificationPreferences;
  }
}

function permissionState(status: string): NotificationPermissionState {
  if (status === "granted" || status === "limited") return "granted";
  if (status === "unavailable") return "unavailable";
  return "denied";
}

export async function currentNotificationPermission(): Promise<NotificationPermissionState> {
  const { status } = await checkNotifications();
  return permissionState(status);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  const { status } = await requestNotifications(["alert", "badge", "sound"]);
  return permissionState(status);
}

export async function openNotificationSettings(): Promise<void> {
  await openSettings("notifications");
}
