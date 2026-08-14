import { safeAnalytics, searchQueryType, type AnalyticsEvent } from "./analytics";

test("removes sensitive properties before analytics delegation", () => {
  const received: AnalyticsEvent[] = [];
  safeAnalytics({ track: event => received.push(event) }).track({
    name: "directions_tapped",
    properties: {
      eventId: "safe",
      latitude: 1,
      orderUrl: "https://private",
      notificationToken: "secret",
      searchText: "Johnstown"
    }
  });
  expect(received).toEqual([{ name: "directions_tapped", properties: { eventId: "safe" } }]);
});

test.each([
  ["50310", "zip"],
  ["IA", "state"],
  ["Des Moines", "city"],
  ["x9!", "unknown"]
] as const)("classifies search input without retaining it", (query, type) => expect(searchQueryType(query)).toBe(type));
