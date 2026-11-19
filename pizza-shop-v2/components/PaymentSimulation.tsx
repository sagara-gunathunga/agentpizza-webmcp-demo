"use client";

import { useEffect, useState } from "react";
import { formatPrice, getWalletName, type WalletProvider } from "@/lib/shop";

export function PaymentSimulation({ provider, amount }: { provider: WalletProvider; amount: number }) {
  const [seconds, setSeconds] = useState(8);
  const [orderId, setOrderId] = useState("");
  const walletName = getWalletName(provider);

  useEffect(() => {
    let closeWindow: number | undefined;
    const countdown = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    const completion = window.setTimeout(() => {
      const id = String(Math.floor(100000 + Math.random() * 900000));
      window.clearInterval(countdown);
      setOrderId(id);
      window.opener?.postMessage(
        { type: "agentpizza:payment-success", provider, orderId: id },
        window.location.origin,
      );
      closeWindow = window.setTimeout(() => window.close(), 3_000);
    }, 8_000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(completion);
      if (closeWindow) window.clearTimeout(closeWindow);
    };
  }, [provider]);

  return (
    <main className={`wallet-page ${provider}`}>
      <section className="wallet-window">
        <div className="wallet-brand">
          <span>{provider === "apple-pay" ? "●" : "G"}</span>
          <strong>{walletName}</strong>
        </div>

        {orderId ? (
          <div className="wallet-success" role="status">
            <span>✓</span>
            <p>Payment successful</p>
            <h1>{formatPrice(amount)}</h1>
            <strong>Order ID: {orderId}</strong>
            <small>This window will close in three seconds.</small>
            <button type="button" onClick={() => window.close()}>Close payment window</button>
          </div>
        ) : (
          <>
            <p className="wallet-kicker">AgentPizza demo checkout</p>
            <h1>Scan to pay {formatPrice(amount)}</h1>
            <p className="wallet-instruction">
              Scan this demo code with your {provider === "apple-pay" ? "iPhone" : "phone"} to continue.
            </p>
            <DemoQrCode provider={provider} />
            <div className="payment-countdown">
              <span className="countdown-dot" />
              Simulating payment · {seconds}s
            </div>
            <p className="wallet-disclaimer">This QR code is decorative and cannot process a real payment.</p>
          </>
        )}
      </section>
    </main>
  );
}

function DemoQrCode({ provider }: { provider: WalletProvider }) {
  const seed = provider === "apple-pay" ? 11 : 23;
  const cells = Array.from({ length: 21 * 21 }, (_, index) => {
    const x = index % 21;
    const y = Math.floor(index / 21);
    const finder = inFinderPattern(x, y, 0, 0) || inFinderPattern(x, y, 14, 0) || inFinderPattern(x, y, 0, 14);
    const filled = finder || ((x * 17 + y * 31 + x * y + seed) % 7 < 3);
    return <span className={filled ? "filled" : ""} key={index} />;
  });

  return <div className="demo-qr" aria-label={`Decorative ${getWalletName(provider)} QR code`}>{cells}</div>;
}

function inFinderPattern(x: number, y: number, startX: number, startY: number) {
  if (x < startX || x > startX + 6 || y < startY || y > startY + 6) return false;
  const localX = x - startX;
  const localY = y - startY;
  const edge = localX === 0 || localX === 6 || localY === 0 || localY === 6;
  const center = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
  return edge || center;
}
