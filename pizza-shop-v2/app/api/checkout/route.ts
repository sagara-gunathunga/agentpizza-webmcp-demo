import { checkoutOrder } from "@/app/actions";

export async function POST(request: Request) {
  return Response.json(await checkoutOrder(await request.json()));
}
