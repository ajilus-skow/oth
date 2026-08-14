import {
  MAX_CART_QUANTITY,
  cartLines,
  cartReducer,
  distinctLineCount,
  emptyCartState,
  reconcileCartQuantities,
  subtotalCents,
  totalUnitCount,
  type CartCatalogItem
} from "./cartDomain";

const catalog: CartCatalogItem[] = [
  { categoryId: "entrees", id: "fish-and-chips", name: "Fish & Chips", priceCents: 1800 },
  { categoryId: "sides", id: "fresh-slaw", name: "Fresh Slaw", priceCents: 300 }
];

test("adds to one normalized line and enforces the quantity limit", () => {
  let state = cartReducer(emptyCartState, { menuItemId: "fish-and-chips", type: "add" });
  state = cartReducer(state, { menuItemId: "fish-and-chips", type: "add" });
  state = cartReducer(state, { menuItemId: "fish-and-chips", quantity: 500, type: "setQuantity" });

  expect(state.quantities).toEqual({ "fish-and-chips": 99 });
  expect(totalUnitCount(state)).toBe(MAX_CART_QUANTITY);
});

test("decrementing one removes the line and clear/remove are idempotent", () => {
  const withOne = cartReducer(emptyCartState, { menuItemId: "fresh-slaw", type: "add" });
  const removed = cartReducer(withOne, { menuItemId: "fresh-slaw", type: "decrement" });

  expect(removed.quantities).toEqual({});
  expect(cartReducer(removed, { menuItemId: "missing", type: "remove" })).toEqual(removed);
  expect(cartReducer(removed, { type: "clear" })).toEqual(removed);
});

test("hydrates valid quantities and drops malformed values", () => {
  const hydrated = cartReducer(emptyCartState, {
    quantities: { "fish-and-chips": 2, bad: 0, decimal: 1.5, huge: 100 },
    type: "hydrate"
  });

  expect(hydrated).toEqual({ hydrated: true, quantities: { "fish-and-chips": 2 } });
});

test("reconciles stale menu items and calculates integer-cent selectors in catalog order", () => {
  const state = {
    hydrated: true,
    quantities: reconcileCartQuantities({ "fish-and-chips": 2, "fresh-slaw": 3, removed: 4 }, catalog)
  };

  expect(cartLines(state, catalog).map(line => line.id)).toEqual(["fish-and-chips", "fresh-slaw"]);
  expect(totalUnitCount(state)).toBe(5);
  expect(distinctLineCount(state, catalog)).toBe(2);
  expect(subtotalCents(state, catalog)).toBe(4500);
});
