import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SignedIn, SignedOut, SignInButton } from "@asgardeo/nextjs";
import { checkoutOrder } from "@/app/actions";
import { clearCart, getCart, onCheckoutRequest } from "@/lib/cart-store";
import {
  calculateCartTotal,
  formatPrice,
  getWalletName,
  type CartItem,
  type Pizza,
  type PizzaSize,
  type WalletProvider,
} from "@/lib/shop";

const CHECKOUT_INTENT_KEY = "agentpizza:resume-checkout";

type CartProps = {
  cart: CartItem[];
  pizzas: Pizza[];
  onRemove: (pizzaId: string, size: PizzaSize) => void;
};

export function Cart({
  cart,
  pizzas,
  onRemove,
}: CartProps) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const total = calculateCartTotal(cart, pizzas);

  function completePayment(orderId?: string) {
    setOrderNumber(orderId ?? String(Math.floor(100000 + Math.random() * 900000)));
    clearCart();
  }

  function startWalletPayment(provider: WalletProvider) {
    return Boolean(window.open(
      `/payment/${provider}?amount=${total}`,
      `agentpizza-${provider}`,
      "popup,width=520,height=760",
    ));
  }

  const openCheckout = useCallback(async () => {
    setCheckingOut(true);
    setCheckoutMessage("");

    try {
      const result = await checkoutOrder(getCart());
      if (!result.ok) return setCheckoutMessage(result.message);
      setReviewing(true);
    } catch {
      setCheckoutMessage("Checkout is temporarily unavailable.");
    } finally {
      setCheckingOut(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(CHECKOUT_INTENT_KEY) === "true") {
      sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
      void openCheckout();
    }
  }, [openCheckout]);

  useEffect(() => onCheckoutRequest(() => setReviewing(true)), []);

  useEffect(() => {
    function receivePayment(event: MessageEvent) {
      if (event.origin === window.location.origin &&
          event.data?.type === "agentpizza:payment-success") completePayment(event.data.orderId);
    }

    window.addEventListener("message", receivePayment);
    return () => window.removeEventListener("message", receivePayment);
  }, []);

  if (orderNumber) {
    return (
      <aside className="cart-panel order-success" id="cart">
        <span className="success-icon">✓</span>
        <p className="eyebrow">Order confirmed</p>
        <h2>Your pizza is in the oven.</h2>
        <p>Demo order #{orderNumber}</p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setReviewing(false);
            setOrderNumber(null);
          }}
        >
          Start another order
        </button>
      </aside>
    );
  }

  return (
    <aside className="cart-panel" id="cart">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">Your cart</p>
          <h2>{reviewing ? "Review order" : "Ready when you are"}</h2>
        </div>
        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <span>🍕</span>
          <p>Your cart is waiting for something delicious.</p>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {cart.map((item) => {
              const pizza = pizzas.find((candidate) => candidate.id === item.pizzaId);
              if (!pizza) return null;

              return (
                <li key={`${item.pizzaId}-${item.size}`}>
                  <div>
                    <strong>{pizza.name}</strong>
                    <span>{item.size} · Qty {item.quantity}</span>
                  </div>
                  <div>
                    <strong>{formatPrice(pizza.prices[item.size] * item.quantity)}</strong>
                    {!reviewing && (
                      <button type="button" onClick={() => onRemove(item.pizzaId, item.size)}>Remove</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          {reviewing ? (
            <PaymentOptions
              total={total}
              onBack={() => setReviewing(false)}
              onPaid={() => completePayment()}
              onStartWallet={startWalletPayment}
            />
          ) : (
            <>
              <SignedIn>
                <button
                  type="button"
                  className="checkout-button"
                  disabled={checkingOut}
                  onClick={() => void openCheckout()}
                >
                  {checkingOut ? "Checking…" : "Review order"}
                </button>
              </SignedIn>
              <SignedOut>
                <SignInButton
                  className="checkout-button"
                  onClickCapture={() => sessionStorage.setItem(CHECKOUT_INTENT_KEY, "true")}
                >
                  Log in to checkout
                </SignInButton>
              </SignedOut>
              {checkoutMessage && <p role="status">{checkoutMessage}</p>}
            </>
          )}
        </>
      )}
    </aside>
  );
}

type PaymentMethod = "credit-card" | WalletProvider;

function PaymentOptions({
  total,
  onBack,
  onPaid,
  onStartWallet,
}: {
  total: number;
  onBack: () => void;
  onPaid: () => void;
  onStartWallet: (provider: WalletProvider) => boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [walletMessage, setWalletMessage] = useState("");

  function openWallet(provider: WalletProvider) {
    setMethod(provider);
    setWalletMessage(onStartWallet(provider)
      ? `${getWalletName(provider)} opened in a payment window. Complete the simulated payment there.`
      : "The payment window was blocked. Allow pop-ups for this site and try again.");
  }

  function submitDemoCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProcessing(true);
    window.setTimeout(onPaid, 1200);
  }

  return (
    <div className="payment-options">
      <div className="payment-summary">
        <span>Amount to pay</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      <p className="demo-notice">Simulation only. Use the test values shown below—not real payment details.</p>

      <div className="payment-methods" aria-label="Payment methods">
        <button
          type="button"
          className={`payment-method card-method ${method === "credit-card" ? "selected" : ""}`}
          onClick={() => {
            setMethod("credit-card");
            setWalletMessage("");
          }}
        >
          <span>▣</span> Credit card
        </button>
        {(["apple-pay", "google-pay"] as const).map((provider) => (
          <button
            type="button"
            className={`payment-method ${provider} ${method === provider ? "selected" : ""}`}
            key={provider}
            onClick={() => openWallet(provider)}
          >
            <span>{provider === "apple-pay" ? "●" : "G"}</span> {getWalletName(provider)}
          </button>
        ))}
      </div>

      {method === "credit-card" && (
        <form className="card-form" onSubmit={submitDemoCard}>
          <label>
            Card number
            <input inputMode="numeric" autoComplete="off" defaultValue="4242 4242 4242 4242" required />
          </label>
          <div>
            <label>
              Expiry
              <input inputMode="numeric" autoComplete="off" defaultValue="12/30" required />
            </label>
            <label>
              CVC
              <input inputMode="numeric" autoComplete="off" defaultValue="123" required />
            </label>
          </div>
          <button type="submit" className="checkout-button" disabled={processing}>
            {processing ? "Processing…" : `Pay ${formatPrice(total)}`}
          </button>
        </form>
      )}

      {walletMessage && <p className="wallet-message" role="status">{walletMessage}</p>}
      <button type="button" className="text-button" onClick={onBack}>Back to cart</button>
    </div>
  );
}
