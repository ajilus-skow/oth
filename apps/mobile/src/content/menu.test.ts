import menu from "./menu.json";

test("bundles stable, priced prototype menu items", () => {
  const items = menu.categories.flatMap(category => category.items);

  expect(items).not.toHaveLength(0);
  expect(new Set(items.map(item => item.id)).size).toBe(items.length);
  expect(items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: "fish-and-chips", priceCents: 1800, purchasable: true }),
      expect.objectContaining({ id: "wild-alaskan-cod-3-pieces", priceCents: 1600, purchasable: true }),
      expect.objectContaining({ id: "bacon-clam-chowder-32oz", priceCents: 2200, purchasable: true })
    ])
  );
  expect(items.every(item => item.purchasable && Number.isInteger(item.priceCents) && item.priceCents >= 0)).toBe(true);
});
