import { act, create } from "react-test-renderer";

const mockReset = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ reset: mockReset }),
  useRoute: () => ({
    params: {
      receipt: {
        lines: [
          {
            lineTotalCents: 3600,
            menuItemId: "fish-and-chips",
            name: "Fish & Chips",
            quantity: 2,
            unitPriceCents: 1800
          }
        ],
        submittedAt: "2026-08-14T12:00:00.000Z",
        subtotalCents: 3600
      }
    }
  })
}));

import { OrderConfirmationScreen } from "./OrderConfirmationScreen";

beforeEach(() => jest.clearAllMocks());

test("shows a local-only receipt and resets to Menu", async () => {
  let screen!: ReturnType<typeof create>;
  await act(async () => {
    screen = create(<OrderConfirmationScreen />);
  });

  expect(screen.root.findByProps({ children: "Prototype order confirmed" })).toBeDefined();
  expect(
    screen.root.findByProps({
      children: "No order was transmitted to a restaurant. This is a local prototype confirmation only."
    })
  ).toBeDefined();
  expect(screen.root.findByProps({ accessibilityLabel: "Submitted subtotal $36.00" })).toBeDefined();

  screen.root.findByProps({ accessibilityLabel: "Back to Menu" }).props.onPress();
  expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Tabs", params: { screen: "Menu" } }] });
});
