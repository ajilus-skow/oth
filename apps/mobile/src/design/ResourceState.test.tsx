import { resourceStateCopy } from "./ResourceState";

test("defines a useful retryable error state without exposing exceptions", () => {
  expect(resourceStateCopy.error).toEqual({ title: "Unable to refresh", body: "Check your connection and try again." });
});
