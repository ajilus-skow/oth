const { by, device, element, expect, waitFor } = require("detox");

const launchApp = async options => {
  await device.launchApp({ newInstance: true, ...options, launchArgs: { detoxEnableSynchronization: 0 } });
  await device.disableSynchronization();
};

const openCart = async () => {
  await waitFor(element(by.id("cart-button")))
    .toBeVisible()
    .withTimeout(10_000);
  await element(by.id("cart-button")).tap();
  await waitFor(element(by.id("cart-screen")))
    .toBeVisible()
    .withTimeout(20_000);
};

const openMenu = async () => {
  await waitFor(element(by.id("tab-menu")))
    .toBeVisible()
    .withTimeout(10_000);
  await element(by.id("tab-menu")).tap();
  await waitFor(element(by.id("add-to-cart-fish-and-chips")))
    .toBeVisible()
    .withTimeout(10_000);
};

const addFishAndChips = async () => {
  await element(by.id("add-to-cart-fish-and-chips")).tap();
  await waitFor(element(by.id("increment-cart-fish-and-chips")))
    .toBeVisible()
    .withTimeout(10_000);
};

describe("Local Menu cart", () => {
  beforeAll(async () => {
    await launchApp({ delete: true });
  });

  it("completes the offline local confirmation flow and stays empty after relaunch", async () => {
    await openMenu();
    await addFishAndChips();
    await element(by.id("increment-cart-fish-and-chips")).tap();
    await element(by.id("decrement-cart-fish-and-chips")).tap();
    await waitFor(element(by.id("add-to-cart-wild-alaskan-cod-1-piece")))
      .toBeVisible()
      .whileElement(by.id("menu-screen"))
      .scroll(280, "down");
    await element(by.id("add-to-cart-wild-alaskan-cod-1-piece")).tap();
    await expect(element(by.id("cart-badge"))).toHaveText("2");

    await openCart();
    await expect(element(by.id("cart-line-fish-and-chips"))).toBeVisible();
    await expect(element(by.id("cart-line-wild-alaskan-cod-1-piece"))).toBeVisible();
    await expect(element(by.id("cart-subtotal"))).toHaveText("$25.00");

    await element(by.id("submit-order")).tap();
    await waitFor(element(by.id("order-confirmation-screen")))
      .toBeVisible()
      .withTimeout(10_000);
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
    await openMenu();
    await addFishAndChips();
    await launchApp();
    await openCart();
    await expect(element(by.id("cart-line-fish-and-chips"))).toBeVisible();
    await expect(element(by.id("cart-subtotal"))).toHaveText("$18.00");
  });
});
