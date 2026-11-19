# AgentPizza — Version 2

The WebMCP-enabled AgentPizza application. It keeps the human-facing interface from Version 1 and exposes the same application capabilities through browser-native tools.

The registered tools are:

- `find_pizzas`: search with optional dietary and flavour filters.
- `add_to_cart`: add one medium pizza using only its pizza ID.
- `remove_from_cart`: remove a pizza using only its pizza ID.
- `checkout`: open checkout and return a confirmation ID when the user is logged in; otherwise return a login-required message.

Every tool invocation writes a `[WebMCP] ... invoked` entry, including its inputs, to the browser console.

Server-side operations write `[server] ... invoked` entries to the terminal running Next.js. Initial menu loading logs `getPizzas`; WebMCP search logs `findPizzas`; checkout logs `checkoutOrder`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test WebMCP in Chrome

WebMCP is experimental and is not enabled by default in Chrome. Use a current Chrome build. The WebMCP runtime and its DevTools panel have separate flags.

1. Open `chrome://flags/#enable-webmcp-testing` in Chrome.
2. Change **WebMCP for testing** to **Enabled**.
3. Open `chrome://flags/#devtools-webmcp-support`.
4. Change **DevTools WebMCP support** to **Enabled**.
5. Click **Relaunch** to restart Chrome completely.
6. Run this Version 2 application with `npm run dev`.
7. Open `http://localhost:3000`, reload the page, and open a new DevTools window.

If the flag is working, run this in the Chrome DevTools Console:

```js
document.modelContext
```

It should return a `ModelContext` object. If it returns `undefined`, confirm that `#enable-webmcp-testing` is enabled, Chrome was relaunched, and you are testing Version 2.

If `document.modelContext` exists but **Application → WebMCP** is missing, confirm that the separate `#devtools-webmcp-support` flag is enabled. Close any DevTools windows that were already open, relaunch Chrome, reload AgentPizza, and open DevTools again.

### List registered tools

Open Chrome DevTools on the AgentPizza page and run:

```js
const tools = await document.modelContext.getTools();
console.table(tools.map(({ name, description }) => ({ name, description })));
```

The list should contain `find_pizzas`.

It should also contain `add_to_cart`, `remove_from_cart`, and `checkout`.

You can inspect its complete definition with:

```js
tools.find((tool) => tool.name === "find_pizzas");
```

### Execute the tool manually

```js
const findPizzas = tools.find((tool) => tool.name === "find_pizzas");

await document.modelContext.executeTool(findPizzas, {
  vegetarian: true,
  spicy: false,
  excludedIngredient: "mushroom",
});
```

The Console displays matching pizzas from the server-owned catalogue. The server and human interface reuse the same `searchPizzas()` helper. This first tool is read-only, so it returns data without changing the visible page.

### Inspect tools visually

Recent Chrome builds include a WebMCP panel in DevTools:

1. Open Chrome DevTools.
2. Select the **Application** panel.
3. Select **WebMCP** in the Application sidebar.
4. Find `find_pizzas` under **Available Tools**.
5. Select it to inspect its description and input schema or execute it with test values.

For an optional agent-style interface, install Google's [Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd). It can list registered tools, execute them manually, and test them through a natural-language agent. Use experimental browser extensions only on trusted pages during development.

Chrome's current documentation is available in the [WebMCP overview](https://developer.chrome.com/docs/ai/webmcp), [Imperative API guide](https://developer.chrome.com/docs/ai/webmcp/imperative-api), and [WebMCP DevTools guide](https://developer.chrome.com/docs/devtools/application/webmcp).

### Test from an external agent

WebMCP tools belong to the live browser tab, so a standalone MCP client cannot discover them directly. Google's `chrome-devtools-mcp` can bridge an external agent—such as Codex CLI, Gemini CLI, Claude Code, Cursor, or Copilot—to the Chrome tab.

1. Keep AgentPizza Version 2 open in Chrome with the WebMCP flags enabled.
2. Open `chrome://inspect/#remote-debugging` and enable **Remote Debugging**.
3. Add this MCP server to your external agent:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--autoConnect",
        "--categoryExperimentalWebmcp"
      ]
    }
  }
}
```

4. When Chrome asks whether to allow the connection, select **Allow**.
5. Ask the external agent:

```text
List the WebMCP tools exposed by the AgentPizza page.
```

Then try a task that uses several tools:

```text
Find a vegetarian spicy pizza, add it to my cart, and open checkout.
```

The bridge exposes `list_webmcp_tools` and `execute_webmcp_tool` to the external agent. WebMCP remains tab-bound; the bridge gives the external agent controlled access to that live Chrome session. See [Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents/get-started) and its [WebMCP debugging guide](https://developer.chrome.com/docs/devtools/agents/webmcp-debugging).

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
- `app/page.tsx` is the Server Component for the shop. It calls `getPizzas()`, renders the static page shell, and passes the serialized menu to `PizzaShop`.
- `app/actions.ts` contains `checkoutOrder()`, which reads the Asgardeo session from server cookies and validates the submitted cart against the server-owned catalogue.
- `app/api/pizzas/route.ts` searches the server-owned catalogue for WebMCP, while `app/api/checkout/route.ts` exposes the shared checkout operation as JSON.
- `instrumentation-client.ts` is the browser entry point. It registers the tools before React hydration without adding a WebMCP component to the page hierarchy.
- `components/PizzaShop.tsx` is the Client Component boundary. It owns menu filters and reflects browser cart changes in the human interface.
- `components/Cart.tsx` owns cart presentation, authenticated checkout, payment selection, and order confirmation.
- `lib/cart-store.ts` is a plain browser-storage library shared by the human interface and WebMCP tools. Its browser event keeps React synchronized when an agent changes the cart.
- `lib/agent-pizza-tools.ts` is independent of React and Next.js components. It registers the four tools with the standard `document.modelContext.registerTool()` API.
- `components/AuthControls.tsx` contains the documented Asgardeo controls and the small profile menu.
- `lib/shop.ts` contains the shared pure search, cart, price, and validation functions used by the server, browser store, and React interface.

The cart has no database. It is kept only in the current browser tab so it can survive the round trip to Asgardeo and resume checkout after login.

Checkout crosses a real Next.js server boundary for authentication and cart validation, but payment remains simulated. Credit card details stay in the browser. Apple Pay and Google Pay open a decorative QR-code window, complete after eight seconds, show a random order ID for three seconds, and then close automatically. No payment provider is contacted.
