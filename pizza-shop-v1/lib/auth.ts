import "server-only";

import { AsgardeoNext } from "@asgardeo/nextjs";
import { asgardeo } from "@asgardeo/nextjs/server";

export async function isUserLoggedIn() {
  const { getSessionId } = await asgardeo();
  return Boolean(await getSessionId());
}

export async function logDecodedIdToken() {
  if (process.env.NODE_ENV !== "development" ||
      process.env.ASGARDEO_LOG_DECODED_ID_TOKEN !== "true") return;

  try {
    const { getSessionId } = await asgardeo();
    const sessionId = await getSessionId();
    if (!sessionId) return;

    const token = await AsgardeoNext.getInstance().getDecodedIdToken(sessionId);
    console.info("[AgentPizza auth debug] Decoded ID token claims:\n" +
      JSON.stringify(token, null, 2));
  } catch (error) {
    console.warn("[AgentPizza auth debug] Could not decode the ID token:",
      error instanceof Error ? error.message : "Unknown error");
  }
}
