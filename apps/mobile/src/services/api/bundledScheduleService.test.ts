import { bundledScheduleService } from "./bundledScheduleService";

test("returns stable structured fixture events with query filters", async () => {
  const schedule = await bundledScheduleService.events({ state: "ia", query: "adel" });
  expect(schedule.nextCursor).toBeNull();
  expect(schedule.events).toHaveLength(1);
  expect(schedule.events[0]).toMatchObject({
    eventId: "oth-20260820-ia-adel",
    city: "Adel",
    hostName: "World Liquor & Tobacco + Vapors ADEL",
    startsAt: "2026-08-20T11:00:00-05:00",
    endsAt: "2026-08-20T19:00:00-05:00",
    state: "IA"
  });
});

test("searches the complete formatted address", async () => {
  const schedule = await bundledScheduleService.events({ query: "590 W Forevergreen Rd" });

  expect(schedule.events).toHaveLength(1);
  expect(schedule.events[0]).toMatchObject({ eventId: "oth-20260826-ia-north-liberty", city: "North Liberty" });
});

test("includes the complete current Iowa schedule window", async () => {
  const schedule = await bundledScheduleService.events({ state: "IA" });

  expect(schedule.events).toHaveLength(9);
  expect(schedule.events[0]).toMatchObject({ city: "Adel", startsAt: "2026-08-20T11:00:00-05:00" });
  expect(schedule.events.at(-1)).toMatchObject({ city: "Altoona", endsAt: "2026-08-29T19:00:00-05:00" });
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
