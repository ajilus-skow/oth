import { act, create, type ReactTestRenderer } from "react-test-renderer";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate, replace: jest.fn() })
}));
jest.mock("../../config/environment", () => ({ mobileEnvironment: { useMockData: false } }));

import { CartButton } from "../../app/navigation/AppNavigator";
import { MenuScreen } from "../menu/MenuScreen";
import { CartProvider } from "./CartProvider";
import { CartScreen } from "./CartScreen";

const persistence = {
  clear: jest.fn(() => Promise.resolve()),
  load: jest.fn(() => Promise.resolve({})),
  save: jest.fn(() => Promise.resolve())
};

async function renderCartFlow(): Promise<ReactTestRenderer> {
  let screen!: ReactTestRenderer;
  await act(async () => {
    screen = create(
      <CartProvider persistence={persistence}>
        <MenuScreen />
        <CartButton />
        <CartScreen />
      </CartProvider>
    );
  });
  return screen;
}

beforeEach(() => jest.clearAllMocks());

test("keeps Menu quantity, shared Cart badge, and Cart line synchronized offline", async () => {
  const screen = await renderCartFlow();

  await act(async () => {
    screen.root.findByProps({ testID: "add-to-cart-fish-and-chips" }).props.onPress();
  });

  expect(screen.root.findByProps({ testID: "cart-quantity-fish-and-chips" }).props.children).toEqual([1, " in cart"]);
  expect(screen.root.findByProps({ accessibilityLabel: "Cart, 1 items" })).toBeDefined();
  expect(screen.root.findByProps({ accessibilityLabel: "Fish & Chips quantity 1" })).toBeDefined();

  await act(async () => {
    screen.root
      .findAllByProps({ accessibilityLabel: "Remove one Fish & Chips from cart" })
      .find(node => typeof node.props.onPress === "function")
      ?.props.onPress();
  });

  expect(screen.root.findByProps({ testID: "add-to-cart-fish-and-chips" })).toBeDefined();
  expect(screen.root.findByProps({ accessibilityLabel: "Cart" })).toBeDefined();
});
