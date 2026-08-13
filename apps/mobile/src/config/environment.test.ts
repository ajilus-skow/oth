import { mobileEnvironment } from "./environment";

test("centralizes the optional API base URL", () => {
  expect(Object.keys(mobileEnvironment)).toEqual(["apiBaseUrl", "useMockData"]);
});
