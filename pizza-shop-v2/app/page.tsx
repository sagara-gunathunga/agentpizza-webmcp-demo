import { AuthControls } from "@/components/AuthControls";
import { PizzaShop } from "@/components/PizzaShop";
import { getPizzas } from "@/lib/pizzas";

export default async function Home() {
  const pizzas = await getPizzas();

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AgentPizza home">
          <span className="brand-mark">A</span>
          <span>AgentPizza</span>
        </a>
        <div className="header-actions">
          <a className="cart-link" href="#cart">View cart</a>
          <AuthControls />
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Hand-stretched in Auckland</p>
          <h1>Good pizza.<br />No complicated choices.</h1>
          <p className="hero-text">
            Eight favourites, quality ingredients, and just enough heat when you want it.
          </p>
          <a className="primary-link" href="#menu">Explore the menu</a>
        </div>
        <div className="hero-art" aria-label="Illustration of a fresh pizza">
          <div className="pizza-illustration">
            <span className="topping topping-one" />
            <span className="topping topping-two" />
            <span className="topping topping-three" />
            <span className="topping topping-four" />
            <span className="leaf leaf-one" />
            <span className="leaf leaf-two" />
          </div>
        </div>
      </section>

      <PizzaShop pizzas={pizzas} />

      <footer>
        <span>AgentPizza</span>
        <span>Demo orders only. No actual payment is taken.</span>
      </footer>
    </main>
  );
}
