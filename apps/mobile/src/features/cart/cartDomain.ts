export const MAX_CART_QUANTITY = 99;

export type CartQuantities = Record<string, number>;

export type CartState = {
  hydrated: boolean;
  quantities: CartQuantities;
};

export type CartCatalogItem = {
  categoryId: string;
  id: string;
  name: string;
  priceCents: number;
};

export type CartLine = CartCatalogItem & {
  lineTotalCents: number;
  quantity: number;
  unitPriceCents: number;
};

export type CartAction =
  | { type: "add"; menuItemId: string }
  | { type: "decrement"; menuItemId: string }
  | { type: "setQuantity"; menuItemId: string; quantity: number }
  | { type: "remove"; menuItemId: string }
  | { type: "clear" }
  | { type: "hydrate"; quantities: CartQuantities };

export const emptyCartState: CartState = { hydrated: false, quantities: {} };

function validQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_CART_QUANTITY;
}

function normalizedQuantities(quantities: CartQuantities): CartQuantities {
  return Object.fromEntries(Object.entries(quantities).filter(([, quantity]) => validQuantity(quantity)));
}

function withQuantity(state: CartState, menuItemId: string, quantity: number): CartState {
  if (!menuItemId.trim()) return state;
  const quantities = { ...state.quantities };
  if (quantity <= 0) delete quantities[menuItemId];
  else quantities[menuItemId] = Math.min(MAX_CART_QUANTITY, Math.floor(quantity));
  return { ...state, quantities };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      return withQuantity(state, action.menuItemId, (state.quantities[action.menuItemId] ?? 0) + 1);
    case "decrement":
      return withQuantity(state, action.menuItemId, (state.quantities[action.menuItemId] ?? 0) - 1);
    case "setQuantity":
      if (!Number.isInteger(action.quantity)) return state;
      return withQuantity(state, action.menuItemId, action.quantity);
    case "remove":
      return withQuantity(state, action.menuItemId, 0);
    case "clear":
      return { ...state, quantities: {} };
    case "hydrate":
      return { hydrated: true, quantities: normalizedQuantities(action.quantities) };
  }
}

export function reconcileCartQuantities(
  quantities: CartQuantities,
  catalog: readonly CartCatalogItem[]
): CartQuantities {
  const validIds = new Set(catalog.map(item => item.id));
  return Object.fromEntries(
    Object.entries(quantities).filter(([menuItemId, quantity]) => validIds.has(menuItemId) && validQuantity(quantity))
  );
}

export function cartLines(state: CartState, catalog: readonly CartCatalogItem[]): CartLine[] {
  return catalog.flatMap(item => {
    const quantity = state.quantities[item.id];
    if (!validQuantity(quantity)) return [];
    return [{ ...item, lineTotalCents: item.priceCents * quantity, quantity, unitPriceCents: item.priceCents }];
  });
}

export function totalUnitCount(state: CartState): number {
  return Object.values(state.quantities).reduce(
    (total, quantity) => total + (validQuantity(quantity) ? quantity : 0),
    0
  );
}

export function subtotalCents(state: CartState, catalog: readonly CartCatalogItem[]): number {
  return cartLines(state, catalog).reduce((total, line) => total + line.lineTotalCents, 0);
}

export function distinctLineCount(state: CartState, catalog: readonly CartCatalogItem[]): number {
  return cartLines(state, catalog).length;
}
