const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockGetCurrentPosition = jest.fn();

jest.mock("react-native-permissions", () => ({
  check: (...args: unknown[]) => mockCheck(...args),
  openSettings: jest.fn(),
  request: (...args: unknown[]) => mockRequest(...args),
  PERMISSIONS: { IOS: { LOCATION_WHEN_IN_USE: "location" } }
}));
jest.mock("@react-native-community/geolocation", () => ({
  getCurrentPosition: (...args: unknown[]) => mockGetCurrentPosition(...args)
}));

import { requestForegroundLocation, type ForegroundLocationResult } from "./foregroundLocation";

beforeEach(() => jest.clearAllMocks());

test("foreground location result never exposes a background tracking state", () => {
  const result: ForegroundLocationResult = { ok: false, reason: "denied" };
  expect(result).toEqual({ ok: false, reason: "denied" });
});

test("requests foreground location after the customer taps Near Me", async () => {
  mockCheck.mockResolvedValue("denied");
  mockRequest.mockResolvedValue("granted");
  mockGetCurrentPosition.mockImplementation(
    (success: (position: { coords: { latitude: number; longitude: number } }) => void) =>
      success({ coords: { latitude: 43.01, longitude: -92.46 } })
  );

  await expect(requestForegroundLocation()).resolves.toEqual({ ok: true, latitude: 43.01, longitude: -92.46 });
  expect(mockRequest).toHaveBeenCalledWith("location");
});

test("does not prompt again when foreground location is already granted", async () => {
  mockCheck.mockResolvedValue("granted");
  mockGetCurrentPosition.mockImplementation(
    (success: (position: { coords: { latitude: number; longitude: number } }) => void) =>
      success({ coords: { latitude: 43.01, longitude: -92.46 } })
  );

  await requestForegroundLocation();
  expect(mockRequest).not.toHaveBeenCalled();
});
