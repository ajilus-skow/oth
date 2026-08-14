import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import {
  cartLines,
  cartReducer,
  emptyCartState,
  reconcileCartQuantities,
  subtotalCents,
  totalUnitCount,
  type CartLine
} from "./cartDomain";
import { clearSavedCart, loadCart, saveCart } from "./cartPersistence";
import { cartCatalog } from "./menuCatalog";

type CartContextValue = {
  add(menuItemId: string): void;
  clear(): void;
  clearAndPersist(): Promise<void>;
  decrement(menuItemId: string): void;
  hydrated: boolean;
  lines: CartLine[];
  remove(menuItemId: string): void;
  setQuantity(menuItemId: string, quantity: number): void;
  storageError: string | null;
  subtotalCents: number;
  totalUnitCount: number;
};

export type CartPersistence = {
  clear(): Promise<void>;
  load(): Promise<Record<string, number>>;
  save(quantities: Record<string, number>): Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const nativePersistence: CartPersistence = { clear: clearSavedCart, load: loadCart, save: saveCart };

export function CartProvider({
  children,
  persistence = nativePersistence
}: PropsWithChildren<{ persistence?: CartPersistence }>) {
  const [state, dispatch] = useReducer(cartReducer, emptyCartState);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  const skipNextEmptyPersistence = useRef(false);

  useEffect(() => {
    let active = true;
    void persistence
      .load()
      .then(quantities => {
        if (active) dispatch({ quantities: reconcileCartQuantities(quantities, cartCatalog), type: "hydrate" });
      })
      .catch(() => {
        if (active) {
          setStorageError("Your cart is available for this session, but it could not be restored.");
          dispatch({ quantities: {}, type: "hydrate" });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const quantities = state.quantities;
    if (Object.keys(quantities).length === 0 && skipNextEmptyPersistence.current) {
      skipNextEmptyPersistence.current = false;
      return;
    }
    writes.current = writes.current
      .then(async () => {
        if (Object.keys(quantities).length === 0) await persistence.clear();
        else await persistence.save(quantities);
        setStorageError(current => (current?.includes("could not be saved") ? null : current));
      })
      .catch(() => setStorageError("Your cart is available for this session, but it could not be saved."));
  }, [persistence, state.hydrated, state.quantities]);

  const value = useMemo<CartContextValue>(
    () => ({
      add: menuItemId => dispatch({ menuItemId, type: "add" }),
      clear: () => dispatch({ type: "clear" }),
      clearAndPersist: () => {
        skipNextEmptyPersistence.current = true;
        dispatch({ type: "clear" });
        writes.current = writes.current
          .then(() => persistence.clear())
          .then(() => setStorageError(current => (current?.includes("could not be saved") ? null : current)))
          .catch(() => setStorageError("Your cart is available for this session, but it could not be saved."));
        return writes.current;
      },
      decrement: menuItemId => dispatch({ menuItemId, type: "decrement" }),
      hydrated: state.hydrated,
      lines: cartLines(state, cartCatalog),
      remove: menuItemId => dispatch({ menuItemId, type: "remove" }),
      setQuantity: (menuItemId, quantity) => dispatch({ menuItemId, quantity, type: "setQuantity" }),
      storageError,
      subtotalCents: subtotalCents(state, cartCatalog),
      totalUnitCount: totalUnitCount(state)
    }),
    [persistence, state, storageError]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
