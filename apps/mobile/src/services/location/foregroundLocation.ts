import Geolocation from "@react-native-community/geolocation";
import { check, openSettings, PERMISSIONS, request } from "react-native-permissions";

export type ForegroundLocationResult =
  { ok: true; latitude: number; longitude: number } | { ok: false; reason: "denied" | "unavailable" | "error" };

function permissionResult(status: string): ForegroundLocationResult | null {
  if (status === "granted" || status === "limited") return null;
  if (status === "unavailable") return { ok: false, reason: "unavailable" };
  return { ok: false, reason: "denied" };
}

export async function locationPermissionState(): Promise<ForegroundLocationResult | { ok: true }> {
  const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  return permissionResult(status) ?? { ok: true };
}

export async function requestForegroundLocation(): Promise<ForegroundLocationResult> {
  const currentStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  if (currentStatus === "unavailable") return { ok: false, reason: "unavailable" };

  // Request only in response to the customer's Near Me action. Checking first
  // avoids an unnecessary prompt when access has already been granted.
  const permission =
    currentStatus === "granted" || currentStatus === "limited"
      ? currentStatus
      : await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  const failure = permissionResult(permission);
  if (failure) return failure;

  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({ ok: true, latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve({ ok: false, reason: "error" }),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 }
    );
  });
}

export async function openLocationSettings(): Promise<void> {
  await openSettings("application");
}
