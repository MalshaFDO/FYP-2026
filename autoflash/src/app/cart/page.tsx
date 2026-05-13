'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaCar,
  FaCreditCard,
  FaLock,
  FaPhoneAlt,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
import {
  CART_EVENT,
  CartItem,
  CartPaymentOption,
  clearCart,
  getPaymentAmount,
  getCartItems,
  removeCartItem,
  saveCartItems,
} from "@/lib/cart";
import styles from "./Cart.module.css";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const syncCart = () => setItems(getCartItems());

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_EVENT, syncCart);
    };
  }, []);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({
          total: acc.total + item.totalPrice,
          payable: acc.payable + item.payableAmount,
        }),
        { total: 0, payable: 0 }
      ),
    [items]
  );

  const handleRemove = (id: string) => {
    removeCartItem(id);
    setItems(getCartItems());
  };

  const handlePaymentOptionChange = (id: string, paymentOption: CartPaymentOption) => {
    const nextItems = items.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        paymentOption,
        payableAmount: getPaymentAmount(item.totalPrice, paymentOption),
      };
    });

    saveCartItems(nextItems);
    setItems(nextItems);
  };

  const submitPayHereForm = (actionUrl: string, fields: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.style.display = "none";

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return;

    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      const res = await fetch("/api/payhere/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to start PayHere checkout");
      }

      submitPayHereForm(data.actionUrl, data.fields);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start PayHere checkout");
      setIsCheckingOut(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>AutoFlash Cart</p>
          <h1>Checkout built for quick service payments</h1>
          <p>
            Review your booking, choose the payment amount where available, and
            move into the gateway with everything ready.
          </p>
        </div>
        <div className={styles.heroPanel}>
          <span>Payable now</span>
          <strong>LKR {totals.payable.toLocaleString()}</strong>
          <small>{items.length} booking item{items.length === 1 ? "" : "s"}</small>
        </div>
      </section>

      <section className={styles.cartShell}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaCreditCard />
            </div>
            <h2>Your cart is empty</h2>
            <p>Add a bodywash, full service, or oil change booking to begin checkout.</p>
            <Link href="/services" className={styles.primaryLink}>
              Browse services
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <article key={item.id} className={styles.cartItem}>
                  <div className={styles.itemHeader}>
                    <div>
                      <span className={styles.itemType}>
                        {item.serviceCategory === "bodywash" ? "Bodywash" : "Service"}
                      </span>
                      <h2>{item.serviceType}</h2>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Remove ${item.serviceType}`}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>

                  <div className={styles.metaGrid}>
                    <span>
                      <FaCar /> {item.vehicleLabel}
                    </span>
                    <span>
                      <FaCalendarAlt /> {item.bookingDate} at {item.bookingTime}
                    </span>
                    <span>
                      <FaUser /> {item.customerName || "Customer details pending"}
                    </span>
                    <span>
                      <FaPhoneAlt /> {item.mobile || "Mobile pending"}
                    </span>
                  </div>

                  <div className={styles.paymentSelector}>
                    <div>
                      <span>Payment choice</span>
                      <strong>
                        {item.serviceCategory === "bodywash"
                          ? "Full payment required"
                          : "Choose before gateway"}
                      </strong>
                    </div>
                    {item.serviceCategory === "fullservice" ? (
                      <div className={styles.segmentedControl}>
                        <button
                          type="button"
                          className={item.paymentOption === "full" ? styles.segmentActive : ""}
                          onClick={() => handlePaymentOptionChange(item.id, "full")}
                        >
                          Full
                        </button>
                        <button
                          type="button"
                          className={item.paymentOption === "half" ? styles.segmentActive : ""}
                          onClick={() => handlePaymentOptionChange(item.id, "half")}
                        >
                          Half
                        </button>
                      </div>
                    ) : (
                      <div className={styles.lockedPayment}>
                        <FaLock /> Full only
                      </div>
                    )}
                  </div>

                  <div className={styles.priceRow}>
                    <div>
                      <span>Total</span>
                      <strong>LKR {item.totalPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>
                        {item.paymentOption === "half" ? "Half payment" : "Full payment"}
                      </span>
                      <strong>LKR {item.payableAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className={styles.summary}>
              <div className={styles.summaryHeader}>
                <FaCreditCard />
                <h2>Payment Summary</h2>
              </div>
              <div className={styles.summaryLine}>
                <span>Booking total</span>
                <strong>LKR {totals.total.toLocaleString()}</strong>
              </div>
              <div className={styles.summaryLine}>
                <span>Payable now</span>
                <strong>LKR {totals.payable.toLocaleString()}</strong>
              </div>
              <div className={styles.gatewayNote}>
                Full service and oil change can use full or half payment. Bodywash
                stays full payment only. Checkout opens PayHere Sandbox.
              </div>
              {checkoutError && <div className={styles.checkoutError}>{checkoutError}</div>}
              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Opening PayHere..." : "Proceed to PayHere Sandbox"}
              </button>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
              >
                Clear cart
              </button>
            </aside>
          </>
        )}
      </section>
    </main>
  );
}
