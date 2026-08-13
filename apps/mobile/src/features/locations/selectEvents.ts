import type { TruckEvent } from "../../domain/models";

export type Coordinates = { latitude: number; longitude: number };

const milesBetween = (event: TruckEvent, origin: Coordinates) => {
  if (event.latitude === null || event.longitude === null) return null;
  const radians = (value: number) => (value * Math.PI) / 180;
  const a =
    Math.sin(radians(event.latitude - origin.latitude) / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
      Math.cos(radians(event.latitude)) *
      Math.sin(radians(event.longitude - origin.longitude) / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export function selectUpcomingEvents(events: TruckEvent[], now: Date, origin?: Coordinates): TruckEvent[] {
  return events
    .filter(event => event.status !== "canceled" && Date.parse(event.endsAt) > now.getTime())
    .sort((left, right) => {
      const leftDistance = origin ? milesBetween(left, origin) : null;
      const rightDistance = origin ? milesBetween(right, origin) : null;
      if (leftDistance !== null && rightDistance !== null && leftDistance !== rightDistance)
        return leftDistance - rightDistance;
      return Date.parse(left.startsAt) - Date.parse(right.startsAt) || left.eventId.localeCompare(right.eventId);
    });
}

export function formatEventTime(event: TruckEvent): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone }).format(
    new Date(event.startsAt)
  );
}
