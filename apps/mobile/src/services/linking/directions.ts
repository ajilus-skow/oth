import type { TruckEvent } from "../../domain/models";
import { openExternalUrl } from "./externalLinks";
import { analytics } from "../../analytics/analytics";

export function directionsUrl(event: TruckEvent): string {
  const destination =
    event.latitude !== null && event.longitude !== null
      ? `${event.latitude},${event.longitude}`
      : [event.address1, event.city, event.state, event.postalCode].filter(Boolean).join(", ");
  return `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}`;
}

export const openDirections = (event: TruckEvent) => {
  analytics.track({ name: "directions_tapped", properties: { eventId: event.eventId } });
  return openExternalUrl(directionsUrl(event), "map");
};
