import { getPizzas } from "@/lib/pizzas";
import { searchPizzas } from "@/lib/shop";

export async function POST(request: Request) {
  console.log("[server] findPizzas invoked");
  const input = await request.json();
  const filters = {
    vegetarian: input.vegetarian === true,
    spicy: input.spicy === true,
    excludedIngredient:
      typeof input.excludedIngredient === "string" ? input.excludedIngredient : "",
  };

  return Response.json(searchPizzas(await getPizzas(), filters));
}
