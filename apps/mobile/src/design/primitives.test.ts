import { colors, sizes } from "./tokens";

test("provides brand tokens and accessible touch-size constants", () => {
  expect(colors.brandBlue).toBe("#0382C8");
  expect(sizes.minimumTapTarget).toBeGreaterThanOrEqual(44);
  expect(sizes.primaryButtonHeight).toBeGreaterThanOrEqual(52);
});
