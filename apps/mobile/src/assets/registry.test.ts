import { hasOfficialWordmark, images, OfficialWordmark } from "./registry";

test("registers semantic imagery while retaining the official-logo release gate", () => {
  expect(images.photos.truckSide).toBeDefined();
  expect(images.photos.mealTruck).toBeDefined();
  expect(images.photos.freshestTaste).toBeDefined();
  expect(images.brand.fishLineArt).toBeDefined();
  expect(OfficialWordmark).toBeDefined();
  expect(hasOfficialWordmark).toBe(true);
});
