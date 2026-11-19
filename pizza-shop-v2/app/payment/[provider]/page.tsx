import { notFound } from "next/navigation";
import { PaymentSimulation } from "@/components/PaymentSimulation";
import type { WalletProvider } from "@/lib/shop";

const WALLET_PROVIDERS: WalletProvider[] = ["apple-pay", "google-pay"];

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{ amount?: string }>;
}) {
  const { provider } = await params;
  const { amount: amountValue } = await searchParams;

  if (!WALLET_PROVIDERS.includes(provider as WalletProvider)) notFound();

  const amount = Number(amountValue);
  if (!Number.isFinite(amount) || amount <= 0) notFound();

  return <PaymentSimulation provider={provider as WalletProvider} amount={amount} />;
}
