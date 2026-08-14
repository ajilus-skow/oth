const { by, device, element, expect, waitFor } = require("detox");

const launchApp = async options => {
  await device.launchApp({ newInstance: true, ...options });
};

const openCart = async () => {
  await element(by.id("cart-button")).tap();
  await waitFor(element(by.id("cart-screen")))
    .toBeVisible()
    .withTimeout(10_000);
};

describe("Local Menu cart", () => {
  beforeAll(async () => {
    await launchApp({ delete: true });
  });

  it("completes the offline local confirmation flow and stays empty after relaunch", async () => {
    await element(by.id("tab-menu")).tap();
    await element(by.id("add-to-cart-fish-and-chips")).tap();
    await element(by.id("increment-cart-fish-and-chips")).tap();
    await element(by.id("add-to-cart-wild-alaskan-cod-1-piece")).tap();
    await expect(element(by.id("cart-badge"))).toHaveText("3");

    await openCart();
    await expect(element(by.id("cart-line-fish-and-chips"))).toBeVisible();
    await expect(element(by.id("cart-line-wild-alaskan-cod-1-piece"))).toBeVisible();
    await expect(element(by.id("cart-subtotal"))).toHaveText("$43.00");
    await element(by.id("decrement-cart-line-fish-and-chips")).tap();
    await expect(element(by.id("cart-subtotal"))).toHaveText("$25.00");

    await element(by.id("submit-order")).tap();
    await expect(element(by.id("order-confirmation-screen"))).toBeVisible();
    await expect(element(by.text("Prototype order confirmed"))).toBeVisible();
    await expect(
      element(by.text("No order was transmitted to a restaurant. This is a local prototype confirmation only."))
    ).toBeVisible();
    await element(by.id("back-to-menu")).tap();
    await expect(element(by.id("cart-badge"))).not.toExist();

    await openCart();
    await expect(element(by.text("Your cart is ready for a fresh catch."))).toBeVisible();
    await launchApp();
    await openCart();
    await expect(element(by.text("Your cart is ready for a fresh catch."))).toBeVisible();
  });

  it("restores local cart intent after a relaunch before submission", async () => {
    await launchApp({ delete: true });
    await element(by.id("tab-menu")).tap();
    await element(by.id("add-to-cart-fish-and-chips")).tap();
    await launchApp();
    await openCart();
    await expect(element(by.id("cart-line-fish-and-chips"))).toBeVisible();
    await expect(element(by.id("cart-subtotal"))).toHaveText("$18.00");
  });
});
