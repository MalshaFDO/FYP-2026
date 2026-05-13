import { NextResponse } from "next/server";
import { buildPayHereCheckout, PayHereCheckoutItem } from "@/lib/payhere";

type CheckoutCartItem = PayHereCheckoutItem & {
  customerName?: string;
  mobile?: string;
  bookingPayload?: {
    email?: unknown;
  };
};

function createOrderId() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `AF-${stamp}-${random}`;
}

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items?: CheckoutCartItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const checkoutItems = items.map((item) => ({
      serviceType: item.serviceType,
      payableAmount: Number(item.payableAmount || 0),
    }));
    const payableTotal = checkoutItems.reduce((sum, item) => sum + item.payableAmount, 0);

    if (payableTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount is invalid" },
        { status: 400 }
      );
    }

    const primaryItem = items.find((item) => item.customerName || item.mobile) || items[0];
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      new URL(req.url).origin;

    const checkout = buildPayHereCheckout({
      orderId: createOrderId(),
      items: checkoutItems,
      customer: {
        name: primaryItem.customerName,
        email:
          typeof primaryItem.bookingPayload?.email === "string"
            ? primaryItem.bookingPayload.email
            : undefined,
        phone: primaryItem.mobile,
      },
      origin,
    });

    return NextResponse.json({ success: true, ...checkout });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("PayHere merchant")
        ? "PayHere sandbox credentials are missing. Add PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET to .env.local."
        : "Failed to start PayHere checkout";

    console.error("PayHere checkout error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

