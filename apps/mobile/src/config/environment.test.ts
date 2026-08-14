import { mobileEnvironment } from "./environment";

test("exposes only the development fixture switch", () => {
  expect(Object.keys(mobileEnvironment)).toEqual(["useMockData"]);
});
