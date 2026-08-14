import { act, create, type ReactTestRenderer } from "react-test-renderer";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock("../config/environment", () => ({
  mobileEnvironment: { useMockData: false }
}));

import { AboutScreen } from "./about/AboutScreen";
import { ContactScreen } from "./contact/ContactScreen";
import { MenuScreen } from "./menu/MenuScreen";
import { MoreScreen } from "./more/MoreScreen";
import { CartProvider } from "./cart/CartProvider";

const cartPersistence = {
  clear: async () => undefined,
  load: async () => ({}),
  save: async () => undefined
};

function textContent(renderer: ReactTestRenderer): string {
  return JSON.stringify(renderer.toJSON());
}

async function render(component: React.ReactElement): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(component);
  });
  return renderer;
}

test("release-selected bundled provider renders informational screens with no API configured", async () => {
  const menu = await render(
    <CartProvider persistence={cartPersistence}>
      <MenuScreen />
    </CartProvider>
  );
  const about = await render(<AboutScreen />);
  const more = await render(<MoreScreen />);
  const contact = await render(<ContactScreen />);

  expect(textContent(menu)).toContain("Menu");
  expect(textContent(menu)).toContain("Entrees");
  expect(textContent(menu)).toContain("$18.00");
  const addFishAndChips = menu.root.findByProps({ testID: "add-to-cart-fish-and-chips" });
  await act(async () => {
    addFishAndChips.props.onPress();
    await Promise.resolve();
  });
  expect(menu.root.findByProps({ testID: "cart-quantity-fish-and-chips" }).props.children).toEqual([1, " in cart"]);
  expect(textContent(about)).toContain("Fresh, wild-caught fish and chips.");
  expect(textContent(about)).toContain("Two Oceans. One Standard.");
  expect(textContent(more)).toContain("Contact Us");
  expect(textContent(more)).toContain("Privacy Policy");
  expect(textContent(contact)).toContain("info@onthehookfishandchips.com");
  expect(textContent(contact)).toContain("307-316-4665");
});
