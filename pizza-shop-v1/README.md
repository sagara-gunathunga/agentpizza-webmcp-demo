# AgentPizza — Version 1

The original human-first AgentPizza application. This version intentionally contains no WebMCP tools, types, or registration code. Use it as the starting point when demonstrating an existing application before agent capabilities are added.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Connect Asgardeo login

1. Create a **Next.js** application in your Asgardeo organization.
2. Register `http://localhost:3000` as both an authorized redirect URL and an allowed sign-out URL.
3. Copy `.env.example` to `.env.local` and replace the three placeholder values with the application values from Asgardeo.
4. Restart `npm run dev` after changing the environment file.

To print the formatted decoded ID-token claims in the development server terminal, set `ASGARDEO_LOG_DECODED_ID_TOKEN=true`. Keep it `false` unless you are actively debugging because the claims can contain personal information. The logger is disabled in production even if the flag is set.

For the hosted demo, register `https://agentpizza.dev` in Asgardeo too and set the two `NEXT_PUBLIC_ASGARDEO_AFTER_*` values to that URL in the hosting environment. Keep `ASGARDEO_CLIENT_SECRET` private and never expose or commit it.

There are two authentication paths in the sample:

- **Log in** in the header starts the normal OpenID Connect redirect and returns to the home page.
- **Log in to checkout** remembers the checkout intent in the current browser tab, starts the same login flow, and opens order review when the user returns.
- After login, the header shows the SDK username. Its profile menu is intentionally limited to first name, last name, email, and an optional phone number.

The `/payment/*` pages are also protected by `proxy.ts`, so they cannot be opened directly without an authenticated session once Asgardeo is configured.

## Server and client boundary

- `lib/pizzas.ts` owns the sample catalogue and is protected by `server-only`, so the source data module cannot be imported into the browser bundle.
- `app/page.tsx` is the Server Component for the shop. It loads the menu, renders the static page shell, and passes the serialized menu to `PizzaShop`.
- `app/actions.ts` contains `checkoutOrder()`, which checks the Asgardeo session and validates the submitted cart against the server-owned catalogue.
- `components/PizzaShop.tsx` is the Client Component boundary. It owns menu filters and reflects browser cart changes in the human interface.
- `components/Cart.tsx` owns cart presentation, authenticated checkout, payment selection, and order confirmation.
- `components/AuthControls.tsx` contains the documented Asgardeo controls and the small profile menu.
- `lib/cart-store.ts` keeps the cart in browser session storage.
- `lib/shop.ts` contains the shared pure search, cart, price, and validation functions.

The cart has no database. It is kept only in the current browser tab so it can survive the round trip to Asgardeo and resume checkout after login.

Checkout crosses a real Next.js server boundary for authentication and cart validation, but payment remains simulated. Credit card details stay in the browser. Apple Pay and Google Pay open a decorative QR-code window, complete after eight seconds, show a random order ID for three seconds, and then close automatically. No payment provider is contacted.
