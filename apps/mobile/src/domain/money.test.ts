import { formatUsd } from "./money";

test("formats integer cents as USD without parsing display strings", () => {
  expect(formatUsd(1800)).toBe("$18.00");
  expect(formatUsd(7)).toBe("$0.07");
  expect(formatUsd(-1)).toBe("Price unavailable");
});
