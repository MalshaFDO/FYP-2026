import crypto from "crypto";

export type PayHereCheckoutItem = {
  serviceType: string;
  payableAmount: number;
};

export type PayHereCustomer = {
  name?: string;
  email?: string;
  phone?: string;
};

export type PayHereCheckoutPayload = {
  orderId: string;
  items: PayHereCheckoutItem[];
  customer: PayHereCustomer;
  origin: string;
};

const SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";
const LIVE_URL = "https://www.payhere.lk/pay/checkout";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex").toUpperCase();
}

export function formatPayHereAmount(amount: number) {
  return Number(amount || 0).toFixed(2);
}

export function createPayHereHash({
  merchantId,
  merchantSecret,
  orderId,
  amount,
  currency,
}: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
}) {
  return md5(`${merchantId}${orderId}${amount}${currency}${md5(merchantSecret)}`);
}

export function createPayHereNotificationHash({
  merchantId,
  merchantSecret,
  orderId,
  amount,
  currency,
  statusCode,
}: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
}) {
  return md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${md5(merchantSecret)}`);
}

function splitName(name?: string) {
  const parts = String(name || "AutoFlash Customer").trim().split(/\s+/);
  const firstName = parts.shift() || "AutoFlash";
  const lastName = parts.join(" ") || "Customer";

  return { firstName, lastName };
}

export function buildPayHereCheckout(payload: PayHereCheckoutPayload) {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const sandboxEnabled = process.env.PAYHERE_SANDBOX !== "false";

  if (!merchantId || !merchantSecret) {
    throw new Error("PayHere merchant credentials are not configured");
  }

  const currency = process.env.PAYHERE_CURRENCY || "LKR";
  const total = payload.items.reduce((sum, item) => sum + Number(item.payableAmount || 0), 0);
  const amount = formatPayHereAmount(total);
  const { firstName, lastName } = splitName(payload.customer.name);
  const itemNames = payload.items.map((item) => item.serviceType).join(", ");

  return {
    actionUrl: sandboxEnabled ? SANDBOX_URL : LIVE_URL,
    fields: {
      merchant_id: merchantId,
      return_url: `${payload.origin}/cart?payment=success&order_id=${encodeURIComponent(payload.orderId)}`,
      cancel_url: `${payload.origin}/cart?payment=cancel&order_id=${encodeURIComponent(payload.orderId)}`,
      notify_url: `${payload.origin}/api/payhere/notify`,
      first_name: firstName,
      last_name: lastName,
      email: payload.customer.email || "sandbox@autoflash.lk",
      phone: payload.customer.phone || "0771234567",
      address: "AutoFlash Service Center",
      city: "Colombo",
      country: "Sri Lanka",
      order_id: payload.orderId,
      items: itemNames || "AutoFlash Service Booking",
      currency,
      amount,
      custom_1: "autoflash-cart",
      custom_2: sandboxEnabled ? "sandbox" : "live",
      hash: createPayHereHash({
        merchantId,
        merchantSecret,
        orderId: payload.orderId,
        amount,
        currency,
      }),
    },
  };
}
