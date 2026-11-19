"use server";

import { isUserLoggedIn } from "@/lib/auth";
import { getPizzas } from "@/lib/pizzas";
import { isCartItem } from "@/lib/shop";

type CheckoutResult = {
  ok: boolean;
  message: string;
};

export async function checkoutOrder(cart: unknown): Promise<CheckoutResult> {
  console.log("[server] checkoutOrder invoked");

  if (!(await isUserLoggedIn())) {
    return { ok: false, message: "You need to log in in order to check out." };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, message: "The cart is empty." };
  }

  if (!cart.every(isCartItem)) {
    return { ok: false, message: "The cart contains an invalid item." };
  }

  const pizzas = await getPizzas();
  const cartIsValid = cart.every((item) =>
    pizzas.some((pizza) => pizza.id === item.pizzaId),
  );

  if (!cartIsValid) return { ok: false, message: "The cart contains an invalid item." };

  return { ok: true, message: "Checkout approved." };
}
