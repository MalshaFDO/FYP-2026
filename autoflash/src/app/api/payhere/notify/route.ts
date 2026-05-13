import { NextResponse } from "next/server";
import { createPayHereNotificationHash } from "@/lib/payhere";

export async function POST(req: Request) {
  const formData = await req.formData();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantSecret) {
    return NextResponse.json({ success: false, error: "PayHere secret missing" }, { status: 500 });
  }

  const merchantId = String(formData.get("merchant_id") || "");
  const orderId = String(formData.get("order_id") || "");
  const amount = String(formData.get("payhere_amount") || "");
  const currency = String(formData.get("payhere_currency") || "");
  const statusCode = String(formData.get("status_code") || "");
  const md5sig = String(formData.get("md5sig") || "");

  const localSignature = createPayHereNotificationHash({
    merchantId,
    merchantSecret,
    orderId,
    amount,
    currency,
    statusCode,
  });

  const verified = localSignature === md5sig;
  const paid = verified && statusCode === "2";

  console.log("PayHere notification", {
    orderId,
    paymentId: String(formData.get("payment_id") || ""),
    verified,
    paid,
    statusCode,
  });

  return NextResponse.json({ success: true, verified, paid });
}

