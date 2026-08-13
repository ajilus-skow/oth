const mockStorage = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    })
  }
}));

import { createMobileApiRepository } from "./httpRepository";

const eventPage = {
  updatedAt: "2026-08-13T12:00:00Z",
  nextCursor: null,
  events: [
    {
      eventId: "event-1",
      city: "Des Moines",
      state: "IA",
      hostName: "Host",
      address1: "1 Main St",
      address2: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      timezone: "America/Chicago",
      startsAt: "2026-08-13T11:00:00-05:00",
      endsAt: "2026-08-13T19:00:00-05:00",
      orderUrl: null,
      status: "scheduled"
    }
  ]
};

beforeEach(() => mockStorage.clear());

test("requires HTTPS for a production API", () => {
  expect(() => createMobileApiRepository("http://example.com")).toThrow("HTTPS");
});

test("persists a validated response and keeps it when a refresh fails", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(eventPage), { status: 200, headers: { ETag: "v1" } }))
    .mockRejectedValueOnce(new Error("offline"));
  const repository = createMobileApiRepository("https://api.example.com", fetcher);

  await expect(repository.events()).resolves.toEqual(eventPage);
  // Make the persisted item stale so the second call attempts a refresh.
  const [key, cached] = [...mockStorage.entries()][0];
  mockStorage.set(key, JSON.stringify({ ...JSON.parse(cached), updatedAt: "2020-01-01T00:00:00Z" }));
  await expect(repository.events()).resolves.toEqual(eventPage);
});

test("forwards a caller abort signal to event requests", async () => {
  const controller = new AbortController();
  const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify(eventPage), { status: 200 }));
  await createMobileApiRepository("https://api.example.com", fetcher).events({ state: "IA" }, controller.signal);
  expect(fetcher.mock.calls[0][1].signal).toBe(controller.signal);
});
