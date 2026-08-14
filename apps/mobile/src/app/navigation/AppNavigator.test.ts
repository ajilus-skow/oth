import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Pressable } from "react-native";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate })
}));

import { CartProvider, useCart } from "../../features/cart/CartProvider";
import { CartButton, type RootStackParams } from "./AppNavigator";

test("defines stable deep-link parameters for truck events", () => {
  const route: RootStackParams["EventDetail"] = { eventId: "fixture-wdm-20260815" };
  expect(route.eventId).toBe("fixture-wdm-20260815");
});

function CartActions() {
  const { add } = useCart();
  return createElement(
    Pressable,
    null,
    createElement(Pressable, { accessibilityLabel: "Add fish", onPress: () => add("fish-and-chips") }),
    createElement(Pressable, { accessibilityLabel: "Add slaw", onPress: () => add("fresh-slaw") })
  );
}

function persistence(quantities: Record<string, number>) {
  return {
    clear: jest.fn(() => Promise.resolve()),
    load: jest.fn(() => Promise.resolve(quantities)),
    save: jest.fn(() => Promise.resolve())
  };
}

async function renderCartButton(quantities: Record<string, number>): Promise<ReactTestRenderer> {
  let screen!: ReactTestRenderer;
  await act(async () => {
    screen = create(
      createElement(
        CartProvider,
        { persistence: persistence(quantities) },
        createElement(CartActions),
        createElement(CartButton)
      )
    );
  });
  return screen;
}

test("opens Cart and announces the live total-unit badge", async () => {
  const screen = await renderCartButton({ "fish-and-chips": 2 });
  const cart = screen.root.findByProps({ accessibilityLabel: "Cart, 2 items" });
  expect(cart.findByProps({ children: "2" })).toBeDefined();

  await act(async () => {
    screen.root.findByProps({ accessibilityLabel: "Add fish" }).props.onPress();
  });
  expect(screen.root.findByProps({ accessibilityLabel: "Cart, 3 items" })).toBeDefined();

  screen.root.findByProps({ accessibilityLabel: "Cart, 3 items" }).props.onPress();
  expect(mockNavigate).toHaveBeenCalledWith("Cart");
});

test("caps the visible cart badge at 99 plus while retaining the actual count", async () => {
  const screen = await renderCartButton({ "fish-and-chips": 99, "fresh-slaw": 1 });
  const cart = screen.root.findByProps({ accessibilityLabel: "Cart, 100 items" });
  expect(cart.findByProps({ children: "99+" })).toBeDefined();
});
