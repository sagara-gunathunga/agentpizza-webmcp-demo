export const PIZZA_SIZES = ["small", "medium", "large"] as const;

export type PizzaSize = (typeof PIZZA_SIZES)[number];
export type WalletProvider = "apple-pay" | "google-pay";

export type Pizza = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  vegetarian: boolean;
  spicy: boolean;
  prices: Record<PizzaSize, number>;
};

export type CartItem = {
  pizzaId: string;
  size: PizzaSize;
  quantity: number;
};

export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;
  return typeof item.pizzaId === "string" &&
    PIZZA_SIZES.includes(item.size as PizzaSize) &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0;
}

export type MenuFilters = {
  vegetarian: boolean;
  spicy: boolean;
  excludedIngredient: string;
};

export const EMPTY_FILTERS: MenuFilters = {
  vegetarian: false,
  spicy: false,
  excludedIngredient: "",
};

export function searchPizzas(pizzas: Pizza[], filters: MenuFilters) {
  const excluded = filters.excludedIngredient.trim().toLowerCase();

  return pizzas.filter((pizza) => {
    if (filters.vegetarian && !pizza.vegetarian) return false;
    if (filters.spicy && !pizza.spicy) return false;

    return !excluded || !pizza.ingredients.some((ingredient) => ingredient.toLowerCase().includes(excluded));
  });
}

export function addCartItem(cart: CartItem[], pizzaId: string, size: PizzaSize) {
  const match = cart.find((item) => item.pizzaId === pizzaId && item.size === size);

  if (!match) return [...cart, { pizzaId, size, quantity: 1 }];

  return cart.map((item) =>
    item === match ? { ...item, quantity: item.quantity + 1 } : item,
  );
}

export function removeCartItem(cart: CartItem[], pizzaId: string, size: PizzaSize) {
  return cart.filter((item) => !(item.pizzaId === pizzaId && item.size === size));
}

export function calculateCartTotal(cart: CartItem[], pizzas: Pizza[]) {
  return cart.reduce((total, item) => {
    const pizza = pizzas.find((candidate) => candidate.id === item.pizzaId);
    return total + (pizza?.prices[item.size] ?? 0) * item.quantity;
  }, 0);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function getWalletName(provider: WalletProvider) {
  return provider === "apple-pay" ? "Apple Pay" : "Google Pay";
}
