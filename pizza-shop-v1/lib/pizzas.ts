import "server-only";

import type { Pizza } from "./shop";

const PIZZAS: Pizza[] = [
  {
    id: "margherita",
    name: "Margherita",
    description: "The classic: bright tomato, creamy mozzarella and fresh basil.",
    ingredients: ["tomato", "mozzarella", "basil"],
    vegetarian: true,
    spicy: false,
    prices: { small: 15, medium: 19, large: 23 },
  },
  {
    id: "pepperoni",
    name: "Pepperoni Classic",
    description: "Crisp-edged pepperoni with mozzarella and rich tomato sauce.",
    ingredients: ["tomato", "mozzarella", "pepperoni"],
    vegetarian: false,
    spicy: false,
    prices: { small: 17, medium: 21, large: 25 },
  },
  {
    id: "garden-fire",
    name: "Garden Fire",
    description: "Roasted peppers, red onion and jalapeño with a chilli finish.",
    ingredients: ["tomato", "mozzarella", "capsicum", "red onion", "jalapeño", "chilli"],
    vegetarian: true,
    spicy: true,
    prices: { small: 17, medium: 21, large: 25 },
  },
  {
    id: "hot-honey",
    name: "Hot Honey Pepperoni",
    description: "Pepperoni, chilli and a drizzle of sweet hot honey.",
    ingredients: ["tomato", "mozzarella", "pepperoni", "chilli", "honey"],
    vegetarian: false,
    spicy: true,
    prices: { small: 18, medium: 22, large: 27 },
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Feta, olives, spinach and roasted capsicum on tomato sauce.",
    ingredients: ["tomato", "mozzarella", "feta", "olives", "spinach", "capsicum"],
    vegetarian: true,
    spicy: false,
    prices: { small: 18, medium: 22, large: 26 },
  },
  {
    id: "bbq-chicken",
    name: "Smoky BBQ Chicken",
    description: "Chicken, red onion and mozzarella over smoky barbecue sauce.",
    ingredients: ["barbecue sauce", "mozzarella", "chicken", "red onion"],
    vegetarian: false,
    spicy: false,
    prices: { small: 18, medium: 23, large: 28 },
  },
  {
    id: "truffle-mushroom",
    name: "Truffle Mushroom",
    description: "Garlic mushrooms, mozzarella and truffle oil on a white base.",
    ingredients: ["garlic", "mozzarella", "mushroom", "truffle oil"],
    vegetarian: true,
    spicy: false,
    prices: { small: 19, medium: 24, large: 29 },
  },
  {
    id: "hawaiian",
    name: "Hawaiian Holiday",
    description: "Smoked ham and pineapple with mozzarella and tomato sauce.",
    ingredients: ["tomato", "mozzarella", "ham", "pineapple"],
    vegetarian: false,
    spicy: false,
    prices: { small: 17, medium: 21, large: 25 },
  },
];

export async function getPizzas() {
  console.log("[server] getPizzas invoked");
  return PIZZAS;
}
