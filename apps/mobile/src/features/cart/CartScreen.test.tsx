import { act, create, type ReactTestRenderer } from "react-test-renderer";

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace })
}));

import { CartProvider } from "./CartProvider";
import { CartScreen } from "./CartScreen";

function persistence(quantities: Record<string, number>) {
  return {
    clear: jest.fn(() => Promise.resolve()),
    load: jest.fn(() => Promise.resolve(quantities)),
    save: jest.fn(() => Promise.resolve())
  };
}

async function render(quantities: Record<string, number>): Promise<ReactTestRenderer> {
  let screen!: ReactTestRenderer;
  await act(async () => {
    screen = create(
      <CartProvider persistence={persistence(quantities)}>
        <CartScreen onSubmit={jest.fn()} />
      </CartProvider>
    );
  });
  return screen;
}

test("shows an honest empty cart with a browse-menu action", async () => {
  const screen = await render({});
  expect(screen.root.findByProps({ accessibilityLabel: "Browse menu" })).toBeDefined();
});

test("keeps the cart usable and explains a local-storage restore failure", async () => {
  const failedPersistence = {
    clear: jest.fn(() => Promise.resolve()),
    load: jest.fn(() => Promise.reject(new Error("storage unavailable"))),
    save: jest.fn(() => Promise.resolve())
  };
  let screen!: ReactTestRenderer;
  await act(async () => {
    screen = create(
      <CartProvider persistence={failedPersistence}>
        <CartScreen />
      </CartProvider>
    );
  });

  expect(screen.root.findByProps({ accessibilityRole: "alert" }).props.children).toContain("could not be restored");
  expect(screen.root.findByProps({ accessibilityLabel: "Browse menu" })).toBeDefined();
});

test("shows cart totals and lets a line quantity change", async () => {
  const screen = await render({ "fish-and-chips": 2, "fresh-slaw": 1 });
  expect(screen.root.findByProps({ accessibilityLabel: "Subtotal $39.00" })).toBeDefined();
  await act(async () => {
    screen.root.findByProps({ accessibilityLabel: "Remove one Fish & Chips from cart" }).props.onPress();
  });
  expect(screen.root.findByProps({ accessibilityLabel: "Subtotal $21.00" })).toBeDefined();
});

test("submits a local receipt and replaces the cart route", async () => {
  const onSubmit = jest.fn();
  const cartPersistence = persistence({ "fish-and-chips": 1 });
  let screen!: ReactTestRenderer;
  await act(async () => {
    screen = create(
      <CartProvider persistence={cartPersistence}>
        <CartScreen onSubmit={onSubmit} />
      </CartProvider>
    );
  });
  await act(async () => {
    const submit = screen.root.findByProps({ accessibilityLabel: "Submit prototype order" }).props.onPress;
    await submit();
    await submit();
  });

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(cartPersistence.clear).toHaveBeenCalledTimes(1);
  expect(screen.root.findByProps({ accessibilityLabel: "Browse menu" })).toBeDefined();
  expect(mockReplace).toHaveBeenCalledWith(
    "OrderConfirmation",
    expect.objectContaining({ receipt: expect.objectContaining({ subtotalCents: 1800 }) })
  );
});
