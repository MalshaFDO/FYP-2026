export type CartPaymentOption = "full" | "half";

export interface CartItem {
  id: string;
  serviceCategory: "bodywash" | "fullservice";
  serviceType: string;
  paymentOption: CartPaymentOption;
  totalPrice: number;
  payableAmount: number;
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

export { CART_EVENT };
