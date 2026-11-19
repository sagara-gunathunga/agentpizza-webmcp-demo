"use client";

import { useEffect, useState } from "react";
import { Cart } from "./Cart";
import {
  addToCart,
  getCart,
  onCartChange,
  removeFromCart,
} from "@/lib/cart-store";
import {
  EMPTY_FILTERS,
  formatPrice,
  PIZZA_SIZES,
  searchPizzas,
  type CartItem,
  type MenuFilters,
  type Pizza,
  type PizzaSize,
} from "@/lib/shop";

export function PizzaShop({ pizzas }: { pizzas: Pizza[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filters, setFilters] = useState<MenuFilters>(EMPTY_FILTERS);

  useEffect(() => {
    const syncCart = () => setCart(getCart());
    syncCart();
    return onCartChange(syncCart);
  }, []);

  const visiblePizzas = searchPizzas(pizzas, filters);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="shop-layout">
      <div>
        <div className="client-status" aria-live="polite">
          <span>{itemCount}</span> {itemCount === 1 ? "item" : "items"} in your cart
        </div>
        <PizzaMenu
          filters={filters}
          pizzas={visiblePizzas}
          onFiltersChange={setFilters}
        />
      </div>
      <Cart
        cart={cart}
        pizzas={pizzas}
        onRemove={removeFromCart}
      />
    </div>
  );
}

function PizzaMenu({
  filters,
  pizzas,
  onFiltersChange,
}: {
  filters: MenuFilters;
  pizzas: Pizza[];
  onFiltersChange: (filters: MenuFilters) => void;
}) {
  return (
    <section className="menu-section" id="menu">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Our menu</p>
          <h2>Pick your perfect slice</h2>
        </div>
        <p>{pizzas.length} {pizzas.length === 1 ? "pizza" : "pizzas"}</p>
      </div>

      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={filters.vegetarian}
            onChange={(event) => onFiltersChange({ ...filters, vegetarian: event.target.checked })}
          />
          Vegetarian
        </label>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={filters.spicy}
            onChange={(event) => onFiltersChange({ ...filters, spicy: event.target.checked })}
          />
          Spicy
        </label>
        <label className="ingredient-filter">
          <span>Exclude ingredient</span>
          <input
            type="search"
            placeholder="e.g. mushroom"
            value={filters.excludedIngredient}
            onChange={(event) => onFiltersChange({ ...filters, excludedIngredient: event.target.value })}
          />
        </label>
      </form>

      {pizzas.length ? (
        <div className="pizza-grid">
          {pizzas.map((pizza, index) => (
            <PizzaCard key={pizza.id} pizza={pizza} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-menu">
          <span>🍕</span>
          <h3>No pizzas match those filters</h3>
          <p>Try removing one of your preferences.</p>
        </div>
      )}
    </section>
  );
}

function PizzaCard({ pizza, index }: { pizza: Pizza; index: number }) {
  const [size, setSize] = useState<PizzaSize>("medium");

  return (
    <article className="pizza-card">
      <div className={`card-art card-art-${(index % 4) + 1}`} aria-hidden="true">
        <span>🍕</span>
        {pizza.spicy && <b>Hot</b>}
      </div>
      <div className="card-content">
        <div className="card-title-row">
          <h3>{pizza.name}</h3>
          {pizza.vegetarian && <span className="veg-badge">Veg</span>}
        </div>
        <p>{pizza.description}</p>
        <ul className="ingredients" aria-label="Ingredients">
          {pizza.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
        </ul>
        <div className="card-order-row">
          <label>
            <span className="sr-only">Size for {pizza.name}</span>
            <select value={size} onChange={(event) => setSize(event.target.value as PizzaSize)}>
              {PIZZA_SIZES.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)} · {formatPrice(pizza.prices[option])}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => addToCart(pizza.id, size)}>Add</button>
        </div>
      </div>
    </article>
  );
}
