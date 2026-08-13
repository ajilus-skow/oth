import type { TruckEvent } from "../../domain/models";

export type CalendarEventDraft = { title: string; startDate: string; endDate: string; location: string; notes: string };

export function calendarEventFromTruckVisit(event: TruckEvent): CalendarEventDraft {
  return {
    title: `On The Hook — ${event.city}${event.hostName ? ` at ${event.hostName}` : ""}`,
    startDate: event.startsAt,
    endDate: event.endsAt,
    location: [event.hostName, event.address1, event.address2, event.city, event.state, event.postalCode]
      .filter(Boolean)
      .join(", "),
    notes: "On The Hook Fish & Chips truck visit."
  };
}
