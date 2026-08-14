import menu from "../../content/menu.json";
import type { CartCatalogItem } from "./cartDomain";

export const cartCatalog: CartCatalogItem[] = menu.categories.flatMap(category =>
  category.items.flatMap(item =>
    item.purchasable && Number.isInteger(item.priceCents) && item.priceCents >= 0
      ? [{ categoryId: category.id, id: item.id, name: item.name, priceCents: item.priceCents }]
      : []
  )
);
