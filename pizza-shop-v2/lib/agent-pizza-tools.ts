import { addToCart, getCart, removePizza, requestCheckout } from "@/lib/cart-store";

export function registerAgentPizzaTools() {
  if (!document.modelContext) return;

  void Promise.all([
    document.modelContext.registerTool({
      name: "find_pizzas",
      description: "Find pizzas by dietary and flavour preferences.",
      inputSchema: {
        type: "object",
        properties: {
          vegetarian: { type: "boolean" },
          spicy: { type: "boolean" },
          excludedIngredient: { type: "string" },
        },
      },
      execute: async ({ vegetarian = false, spicy = false, excludedIngredient = "" }) => {
        const filters = { vegetarian, spicy, excludedIngredient };
        console.log("[WebMCP] find_pizzas invoked", filters);
        const response = await fetch("/api/pizzas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        });
        return response.json();
      },
    }),

    document.modelContext.registerTool({
      name: "add_to_cart",
      description: "Add one medium pizza to the cart by pizza ID.",
      inputSchema: {
        type: "object",
        properties: { pizzaId: { type: "string" } },
        required: ["pizzaId"],
      },
      execute: ({ pizzaId }) => {
        console.log("[WebMCP] add_to_cart invoked", { pizzaId });
        addToCart(pizzaId);
        return { ok: true, message: `Added ${pizzaId} to the cart.` };
      },
    }),

    document.modelContext.registerTool({
      name: "remove_from_cart",
      description: "Remove a pizza from the cart by pizza ID.",
      inputSchema: {
        type: "object",
        properties: { pizzaId: { type: "string" } },
        required: ["pizzaId"],
      },
      execute: ({ pizzaId }) => {
        console.log("[WebMCP] remove_from_cart invoked", { pizzaId });
        if (!removePizza(pizzaId)) {
          return { ok: false, message: `Pizza not in cart: ${pizzaId}` };
        }
        return { ok: true, message: `Removed ${pizzaId} from the cart.` };
      },
    }),

    document.modelContext.registerTool({
      name: "checkout",
      description: "Open checkout for the current cart. The user must be logged in.",
      execute: async () => {
        console.log("[WebMCP] checkout invoked");
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getCart()),
        });
        const result = await response.json();
        if (!result.ok) return result;
        requestCheckout();
        return { ...result, message: "Checkout opened." };
      },
    }),
  ]).catch((error) => {
    console.error("WebMCP tool registration failed:", error);
  });
}
