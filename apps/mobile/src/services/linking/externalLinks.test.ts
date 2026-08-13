import { validateExternalUrl } from "./externalLinks";

test.each([
  ["https://onthehookfishandchips.com/jobs", "web", true],
  ["tel:3073164665", "phone", true],
  ["mailto:info@onthehookfishandchips.com", "email", true],
  ["javascript:alert(1)", "web", false],
  ["file:///private/data", "web", false],
  ["data:text/plain,unsafe", "web", false],
  ["https://example.com", "phone", false]
] as const)("validates %s for %s", (value, kind, expected) => {
  expect(Boolean(validateExternalUrl(value, kind))).toBe(expected);
});
