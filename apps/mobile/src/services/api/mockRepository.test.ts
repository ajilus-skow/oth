import { getMobileRepository } from "./mockRepository";

test("mock data uses the production event validation boundary", async () => {
  expect(() => getMobileRepository(false)).toThrow("production mobile API repository");
  await expect(getMobileRepository(true).events()).resolves.toMatchObject({ events: expect.any(Array) });
});
