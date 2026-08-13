import bootstrap from "../../fixtures/bootstrap.json";
import menu from "../../fixtures/menu.json";
import { type EventPage } from "../../domain/models";
import { type AboutPage, createMobileApiRepository, type MobileApiRepository } from "./httpRepository";
import { fakeScheduleService, type ScheduleQuery } from "./fakeScheduleService";

export type MobileRepository = MobileApiRepository & {
  bootstrap: () => Promise<typeof bootstrap>;
  menu: () => Promise<typeof menu>;
  events: (query?: ScheduleQuery, signal?: AbortSignal) => Promise<EventPage>;
};

const mockAbout: AboutPage = {
  updatedAt: "2026-08-13T12:00:00Z",
  hero: bootstrap.content.heroTitle,
  stats: [],
  sections: []
};

export const mockRepository: MobileRepository = {
  bootstrap: async () => bootstrap,
  menu: async () => menu,
  states: () => fakeScheduleService.states(),
  events: async query => fakeScheduleService.events(query),
  about: async () => mockAbout,
  lastUpdatedAt: async () => null
};

export function getMobileRepository(mockEnabled: boolean, apiBaseUrl?: string): MobileApiRepository {
  if (mockEnabled) return mockRepository;
  if (!apiBaseUrl) throw new Error("A production mobile API repository has not been configured.");
  return createMobileApiRepository(apiBaseUrl);
}
