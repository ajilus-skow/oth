import { act, create } from "react-test-renderer";
import { CartProvider, useCart, type CartPersistence } from "./CartProvider";

const mockSaveCart = jest.fn(() => Promise.resolve());
const mockClearSavedCart = jest.fn(() => Promise.resolve());
const mockLoadCart = jest.fn();
const persistence: CartPersistence = { clear: mockClearSavedCart, load: mockLoadCart, save: mockSaveCart };

let latest: ReturnType<typeof useCart> | undefined;

function Capture() {
  latest = useCart();
  return null;
}

beforeEach(() => {
  latest = undefined;
  jest.clearAllMocks();
});

test("hydrates before writing and persists later mutations", async () => {
  mockLoadCart.mockResolvedValue({ "fish-and-chips": 2 });

  await act(async () => {
    create(
      <CartProvider persistence={persistence}>
        <Capture />
      </CartProvider>
    );
  });

  expect(latest?.hydrated).toBe(true);
  expect(latest?.totalUnitCount).toBe(2);
  expect(mockClearSavedCart).not.toHaveBeenCalled();

  await act(async () => {
    latest?.add("fresh-slaw");
  });

  expect(mockSaveCart).toHaveBeenLastCalledWith({ "fish-and-chips": 2, "fresh-slaw": 1 });
});

test("keeps an in-memory cart available when hydration fails", async () => {
  mockLoadCart.mockRejectedValue(new Error("storage unavailable"));

  await act(async () => {
    create(
      <CartProvider persistence={persistence}>
        <Capture />
      </CartProvider>
    );
  });

  expect(latest?.hydrated).toBe(true);
  expect(latest?.storageError).toContain("could not be restored");
});
