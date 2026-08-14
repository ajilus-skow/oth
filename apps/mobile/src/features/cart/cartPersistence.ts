import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAX_CART_QUANTITY, type CartQuantities } from "./cartDomain";

export const CART_STORAGE_KEY = "oth.cart.v1";
const SCHEMA_VERSION = 1;

type StoredCart = {
  items: Array<{ menuItemId: string; quantity: number }>;
  schemaVersion: number;
  updatedAt: string;
};

export type CartStorage = {
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
};

function validItem(value: unknown): value is { menuItemId: string; quantity: number } {
  if (typeof value !== "object" || value === null) return false;
  const item = value as { menuItemId?: unknown; quantity?: unknown };
  return (
    typeof item.menuItemId === "string" &&
    Boolean(item.menuItemId.trim()) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= MAX_CART_QUANTITY
  );
}

export function parsePersistedCart(raw: string | null): CartQuantities {
  if (!raw) return {};
  try {
    const payload: unknown = JSON.parse(raw);
    if (typeof payload !== "object" || payload === null) return {};
    const stored = payload as Partial<StoredCart>;
    if (stored.schemaVersion !== SCHEMA_VERSION || !Array.isArray(stored.items)) return {};
    return Object.fromEntries(stored.items.filter(validItem).map(item => [item.menuItemId, item.quantity]));
  } catch {
    return {};
  }
}

export function createCartPersistence(storage: CartStorage) {
  return {
    clear: () => storage.removeItem(CART_STORAGE_KEY),
    load: async (): Promise<CartQuantities> => parsePersistedCart(await storage.getItem(CART_STORAGE_KEY)),
    save: async (quantities: CartQuantities, updatedAt = new Date().toISOString()): Promise<void> => {
      const items = Object.entries(quantities)
        .filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_CART_QUANTITY)
        .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
      await storage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, schemaVersion: SCHEMA_VERSION, updatedAt } satisfies StoredCart)
      );
    }
  };
}

const nativeCartPersistence = createCartPersistence(AsyncStorage);
export const loadCart = nativeCartPersistence.load;
export const saveCart = nativeCartPersistence.save;
export const clearSavedCart = nativeCartPersistence.clear;
