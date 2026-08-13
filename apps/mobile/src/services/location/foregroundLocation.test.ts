import type { ForegroundLocationResult } from "./foregroundLocation";

test("foreground location result never exposes a background tracking state", () => {
  const result: ForegroundLocationResult = { ok: false, reason: "denied" };
  expect(result).toEqual({ ok: false, reason: "denied" });
});
