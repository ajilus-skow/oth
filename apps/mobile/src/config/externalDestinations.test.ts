import { externalDestinations } from "./externalDestinations";

test("provides safe bootstrap-backed web destinations", () => {
  expect(externalDestinations).toEqual({
    jobs: "https://onthehookfishandchips.com/jobs",
    store: "https://onthehookoutfitters.com/",
    franchise: "https://franchiseonthehook.com/",
    privacy: "https://onthehookfishandchips.com/privacy-policy",
    terms: "https://onthehookfishandchips.com/terms-and-conditions"
  });
});
