import type { ImageSourcePropType } from "react-native";

export { default as OfficialWordmark } from "./brand/oth-logo.svg";

export const images = {
  brand: {
    wordmarkReference: require("./brand/oth-wordmark-reference.jpeg"),
    fishLineArt: require("./brand/fish-line-art.png"),
    friesLineArt: require("./brand/fries-line-art.png")
  },
  photos: {
    freshestTaste: require("./photos/freshest-taste.jpg"),
    mealTruck: require("./photos/mobile/meal-truck.jpg"),
    truckSide: require("./photos/mobile/truck-side.jpg"),
    fishAndChipsPlate: require("./photos/fish-and-chips-plate.jpg"),
    customerTruck: require("./photos/mobile/customer-truck.jpg"),
    ship: require("./photos/ship.jpg"),
    fishAndChipsEating: require("./photos/fish-and-chips-eating.jpg"),
    serviceWindow: require("./photos/mobile/service-window.jpg"),
    originalSauces: require("./photos/original-sauces.jpg")
  }
} satisfies Record<string, Record<string, ImageSourcePropType>>;

export const hasOfficialWordmark = true;
