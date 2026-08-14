import { LocalOrderSubmissionService } from "./orderSubmission";
import type { CartLine } from "./cartDomain";

const lines: CartLine[] = [
  {
    categoryId: "entrees",
    id: "fish-and-chips",
    lineTotalCents: 3600,
    name: "Fish & Chips",
    priceCents: 1800,
    quantity: 2,
    unitPriceCents: 1800
  }
];

test("creates an immutable local receipt snapshot without a transport dependency", () => {
  const receipt = new LocalOrderSubmissionService().submit(lines, 3600);
  lines[0].name = "Changed menu name";
  lines[0].quantity = 1;

  expect(receipt.lines).toEqual([
    {
      lineTotalCents: 3600,
      menuItemId: "fish-and-chips",
      name: "Fish & Chips",
      quantity: 2,
      unitPriceCents: 1800
    }
  ]);
  expect(receipt.subtotalCents).toBe(3600);
  expect(receipt.submittedAt).toEqual(expect.any(String));
});
