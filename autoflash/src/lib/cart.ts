export type CartPaymentOption = "full" | "half";

export interface CartItem {
  id: string;
  serviceCategory: "bodywash" | "fullservice";
  serviceType: string;
  paymentOption: CartPaymentOption;
  totalPrice: number;
  payableAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStage?: "initial" | "remaining";
  bookingId?: string;
  paymentStatus?: "Pending" | "Partially Paid" | "Paid";
  bookingDate: string;
  bookingTime: string;
  vehicleLabel: string;
  customerName?: string;
  mobile?: string;
  bookingPayload: Record<string, unknown>;
  createdAt: string;
}

const CART_KEY = "autoflashCart";
const CART_EVENT = "autoflash-cart-updated";
const PAYMENT_HISTORY_KEY = "autoflashPaymentHistory";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addCartItem(item: Omit<CartItem, "id" | "createdAt">) {
  const nextItem: CartItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  saveCartItems([...getCartItems(), nextItem]);
  return nextItem;
}

export function removeCartItem(id: string) {
  saveCartItems(getCartItems().filter((item) => item.id !== id));
}

export function clearCart() {
  saveCartItems([]);
}

export function getPaymentAmount(totalPrice: number, option: CartPaymentOption) {
  return option === "half" ? Math.ceil(totalPrice / 2) : totalPrice;
}

export interface PaymentHistoryItem {
  id: string;
  orderId: string;
  bookingId?: string;
  serviceType: string;
  customerName?: string;
  mobile?: string;
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentOption: CartPaymentOption;
  paymentStage: "initial" | "remaining";
  status: "Partially Paid" | "Paid";
  paidAt: string;
}

export function getPaymentHistory(): PaymentHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PAYMENT_HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addPaymentHistory(items: Omit<PaymentHistoryItem, "id" | "paidAt">[]) {
  if (typeof window === "undefined" || items.length === 0) return;

  const nextItems = items.map((item) => ({
    ...item,
    id: `${item.orderId}-${item.bookingId || item.serviceType}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    paidAt: new Date().toISOString(),
  }));

  window.localStorage.setItem(
    PAYMENT_HISTORY_KEY,
    JSON.stringify([...nextItems, ...getPaymentHistory()])
  );
}

export { CART_EVENT };
