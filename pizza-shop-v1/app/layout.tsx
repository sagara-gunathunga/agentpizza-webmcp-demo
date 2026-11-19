import type { Metadata } from "next";
import { AsgardeoProvider } from "@asgardeo/nextjs/server";
import { logDecodedIdToken } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPizza",
  description: "Simple pizza choices, prepared for an agent-ready web demo.",
};

// Authentication depends on request cookies and headers, so the shell is rendered per request.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await logDecodedIdToken();

  return (
    <html lang="en">
      <body>
        <AsgardeoProvider>
          {children}
        </AsgardeoProvider>
      </body>
    </html>
  );
}
