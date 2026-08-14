import { CART_STORAGE_KEY, createCartPersistence, parsePersistedCart } from "./cartPersistence";

const mockStorage = new Map<string, string>();
const mockRemoveItem = jest.fn((key: string) => {
  mockStorage.delete(key);
  return Promise.resolve();
});
const persistence = createCartPersistence({
  getItem: key => Promise.resolve(mockStorage.get(key) ?? null),
  removeItem: mockRemoveItem,
  setItem: (key, value) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }
});

beforeEach(() => {
  mockStorage.clear();
  jest.clearAllMocks();
});

test("parses only the current schema and valid quantity intent", () => {
  expect(
    parsePersistedCart(
      JSON.stringify({
        items: [
          { menuItemId: "fish-and-chips", quantity: 2 },
          { menuItemId: "bad", quantity: 0 },
          { menuItemId: "too-many", quantity: 100 }
        ],
        schemaVersion: 1,
        updatedAt: "2026-08-14T00:00:00.000Z"
      })
    )
  ).toEqual({ "fish-and-chips": 2 });
  expect(parsePersistedCart("not-json")).toEqual({});
  expect(parsePersistedCart(JSON.stringify({ items: [], schemaVersion: 2 }))).toEqual({});
});

test("persists only cart intent and clears it", async () => {
  await persistence.save({ "fish-and-chips": 2, invalid: 0 }, "2026-08-14T00:00:00.000Z");

  expect(JSON.parse(mockStorage.get(CART_STORAGE_KEY) ?? "")).toEqual({
    items: [{ menuItemId: "fish-and-chips", quantity: 2 }],
    schemaVersion: 1,
    updatedAt: "2026-08-14T00:00:00.000Z"
  });
  await expect(persistence.load()).resolves.toEqual({ "fish-and-chips": 2 });

  await persistence.clear();
  await expect(persistence.load()).resolves.toEqual({});
  expect(mockRemoveItem).toHaveBeenCalledWith(CART_STORAGE_KEY);
});
