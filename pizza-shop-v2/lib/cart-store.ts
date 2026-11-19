import {
  addCartItem,
  isCartItem,
  removeCartItem,
  removePizzaItems,
  type CartItem,
  type PizzaSize,
} from "@/lib/shop";

const CART_STORAGE_KEY = "agentpizza:cart";
const CART_CHANGED_EVENT = "agentpizza:cart-changed";
const CHECKOUT_REQUESTED_EVENT = "agentpizza:checkout-requested";

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

export function removePizza(pizzaId: string) {
  const cart = getCart();
  if (!cart.some((item) => item.pizzaId === pizzaId)) return false;
  saveCart(removePizzaItems(cart, pizzaId));
  return true;
}

export function clearCart() {
  saveCart([]);
}

export function onCartChange(listener: () => void) {
  window.addEventListener(CART_CHANGED_EVENT, listener);
  return () => window.removeEventListener(CART_CHANGED_EVENT, listener);
}

export function requestCheckout() {
  window.dispatchEvent(new Event(CHECKOUT_REQUESTED_EVENT));
}

export function onCheckoutRequest(listener: () => void) {
  window.addEventListener(CHECKOUT_REQUESTED_EVENT, listener);
  return () => window.removeEventListener(CHECKOUT_REQUESTED_EVENT, listener);
}
