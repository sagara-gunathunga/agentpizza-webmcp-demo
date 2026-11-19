import { asgardeoMiddleware, createRouteMatcher } from "@asgardeo/nextjs/middleware";

const isPaymentRoute = createRouteMatcher(["/payment/(.*)"]);

export const proxy = asgardeoMiddleware(async (asgardeo, request) => {
  if (isPaymentRoute(request)) {
    const response = await asgardeo.protectRoute({ redirect: "/" });
    if (response) return response;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
