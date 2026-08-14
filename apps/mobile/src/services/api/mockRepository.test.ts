import { getMobileRepository } from "./mockRepository";

test("release builds use bundled production content without using development fixtures", async () => {
  await expect(getMobileRepository(false).menu()).resolves.toMatchObject({ categories: expect.any(Array) });
  await expect(getMobileRepository(false).bootstrap()).resolves.toMatchObject({ links: expect.any(Object) });
  await expect(getMobileRepository(false).events()).resolves.toMatchObject({ events: expect.any(Array) });
  expect(getMobileRepository(false).sourceFor("menu")).toBe("bundled");
  expect(getMobileRepository(false).sourceFor("events")).toBe("bundled");
  await expect(getMobileRepository(true).events()).resolves.toMatchObject({ events: expect.any(Array) });
  expect(getMobileRepository(true).sourceFor("events")).toBe("test");
});
