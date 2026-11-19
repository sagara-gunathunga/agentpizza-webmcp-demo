import {
  addCartItem,
  isCartItem,
  removeCartItem,
  type CartItem,
  type PizzaSize,
} from "@/lib/shop";

const CART_STORAGE_KEY = "agentpizza:cart";
const CART_CHANGED_EVENT = "agentpizza:cart-changed";

export function getCart() {
  try {
    const storedCart = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(storedCart) ? storedCart.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function addToCart(pizzaId: string, size: PizzaSize = "medium") {
  saveCart(addCartItem(getCart(), pizzaId, size));
}

export function removeFromCart(pizzaId: string, size: PizzaSize) {
  saveCart(removeCartItem(getCart(), pizzaId, size));
}

export function clearCart() {
  saveCart([]);
}

export function onCartChange(listener: () => void) {
  window.addEventListener(CART_CHANGED_EVENT, listener);
  return () => window.removeEventListener(CART_CHANGED_EVENT, listener);
}
