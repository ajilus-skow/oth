import bootstrap from "../../content/bootstrap.json";
import menu from "../../content/menu.json";
import { type EventPage } from "../../domain/models";
import { type AboutPage, type MobileApiRepository } from "./httpRepository";
import { fakeScheduleService, type ScheduleQuery } from "./fakeScheduleService";
import { bundledScheduleService } from "./bundledScheduleService";

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
  lastUpdatedAt: async () => null,
  sourceFor: () => "test"
};

export const bundledProductionRepository: MobileApiRepository = {
  bootstrap: async () => bootstrap,
  menu: async () => menu,
  about: async () => mockAbout,
  states: () => bundledScheduleService.states(),
  events: query => bundledScheduleService.events(query),
  lastUpdatedAt: async () => null,
  sourceFor: () => "bundled"
};

export function getMobileRepository(mockEnabled: boolean): MobileApiRepository {
  if (mockEnabled) return mockRepository;
  return bundledProductionRepository;
}
