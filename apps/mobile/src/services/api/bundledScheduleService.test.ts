import { bundledScheduleService } from "./bundledScheduleService";

test("returns stable structured fixture events with query filters", async () => {
  const schedule = await bundledScheduleService.events({ state: "ia", query: "belle plaine" });
  expect(schedule.nextCursor).toBeNull();
  expect(schedule.events).toHaveLength(1);
  expect(schedule.events[0]).toMatchObject({ eventId: "oth-202608-013", state: "IA" });
});

test("searches the complete formatted address", async () => {
  const schedule = await bundledScheduleService.events({ query: "405 13th St" });

  expect(schedule.events).toHaveLength(1);
  expect(schedule.events[0]).toMatchObject({ eventId: "oth-202608-013", city: "Belle Plaine" });
});

test("limits schedules and exposes states with upcoming fixtures", async () => {
  await expect(bundledScheduleService.events({ limit: 1 })).resolves.toMatchObject({ events: [expect.any(Object)] });
  await expect(bundledScheduleService.states()).resolves.toEqual(
    expect.arrayContaining([
      { code: "CO", name: "Colorado" },
      { code: "IA", name: "Iowa" },
      { code: "WY", name: "Wyoming" }
    ])
  );
});

test("does not manufacture ordering URLs from availability flags", async () => {
  const schedule = await bundledScheduleService.events({ limit: 250 });
  expect(schedule.events.some(event => event.orderUrl !== null)).toBe(false);
});
