import type { TruckEvent } from "../../domain/models";

export type EventSection = { title: string; data: TruckEvent[] };

export function groupEventsByLocalDate(events: TruckEvent[]): EventSection[] {
  const groups = new Map<string, TruckEvent[]>();
  for (const event of events) {
    const date = event.startsAt.slice(0, 10);
    groups.set(date, [...(groups.get(date) ?? []), event]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([title, data]) => ({ title, data }));
}

export function localHours(event: TruckEvent): string {
  const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: event.timezone });
  return `${formatter.format(new Date(event.startsAt))}–${formatter.format(new Date(event.endsAt))}`;
}
