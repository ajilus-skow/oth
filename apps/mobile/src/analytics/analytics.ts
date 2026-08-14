export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, boolean | number | string | undefined>;
};
export type Analytics = { track: (event: AnalyticsEvent) => void };

const isSensitivePropertyName = (key: string) =>
  /(?:latitude|longitude|coordinate|push.?token|notification.?token|email|phone|query|search.?text|order.?url)/i.test(
    key
  );

export const noOpAnalytics: Analytics = { track: () => undefined };
export const analytics = safeAnalytics();

export function searchQueryType(value: string): "city" | "state" | "zip" | "unknown" {
  const query = value.trim();
  if (/^\d{5}(?:-\d{4})?$/.test(query)) return "zip";
  if (/^[A-Za-z]{2}$/.test(query)) return "state";
  if (/^[A-Za-z .'-]+(?:,\s*[A-Za-z]{2})?$/.test(query)) return "city";
  return "unknown";
}

export function safeAnalytics(delegate: Analytics = noOpAnalytics): Analytics {
  return {
    track: event =>
      delegate.track({
        ...event,
        properties: Object.fromEntries(
          Object.entries(event.properties ?? {}).filter(([key]) => !isSensitivePropertyName(key))
        )
      })
  };
}
