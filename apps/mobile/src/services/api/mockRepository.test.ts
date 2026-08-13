import { getMobileRepository } from "./mockRepository";

test("release builds use bundled content without silently using mock schedules", async () => {
  await expect(getMobileRepository(false).menu()).resolves.toMatchObject({ categories: expect.any(Array) });
  await expect(getMobileRepository(false).bootstrap()).resolves.toMatchObject({ links: expect.any(Object) });
  await expect(getMobileRepository(false).events()).rejects.toThrow("schedule is unavailable");
  expect(getMobileRepository(false).sourceFor("menu")).toBe("bundled");
  await expect(getMobileRepository(true).events()).resolves.toMatchObject({ events: expect.any(Array) });
  expect(getMobileRepository(true).sourceFor("events")).toBe("test");
});
