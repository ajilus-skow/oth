import { fakeScheduleService } from "./fakeScheduleService";

test("returns stable structured fixture events with query filters", async () => {
  const schedule = await fakeScheduleService.events({ state: "ia", query: "belle plaine" });
  expect(schedule.nextCursor).toBeNull();
  expect(schedule.events).toHaveLength(1);
  expect(schedule.events[0]).toMatchObject({ eventId: "oth-202608-013", state: "IA" });
});

test("limits schedules and exposes states with upcoming fixtures", async () => {
  await expect(fakeScheduleService.events({ limit: 1 })).resolves.toMatchObject({ events: [expect.any(Object)] });
  await expect(fakeScheduleService.states()).resolves.toEqual(
    expect.arrayContaining([
      { code: "CO", name: "Colorado" },
      { code: "IA", name: "Iowa" },
      { code: "WY", name: "Wyoming" }
    ])
  );
});
