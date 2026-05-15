"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaCalendarAlt, FaCar, FaCreditCard, FaLock, FaPhoneAlt, FaTrashAlt, FaUser } from "react-icons/fa";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  CART_EVENT,
  CartPaymentOption,
  clearCart,
  getPaymentAmount,
  getCartItems,
  getPaymentHistory,
  removeCartItem,
  saveCartItems,
} from "@/lib/cart";
import type { CartItem, PaymentHistoryItem } from "@/lib/cart";
import styles from "./Cart.module.css";

type CheckoutMode = "online" | "service";

const copy = {
  en: {
    eyebrow: "AutoFlash Cart",
    heroTitle: "Checkout built for quick service payments",
    heroText:
      "Review your booking, choose the payment amount where available, and move into the gateway with everything ready.",
    payableNow: "Payable now",
    item: "booking item",
    emptyTitle: "Your cart is empty",
    emptyText: "Add a bodywash, full service, or oil change booking to begin checkout.",
    browse: "Browse services",
    remove: (serviceType: string) => `Remove ${serviceType}`,
    customerPending: "Customer details pending",
    mobilePending: "Mobile pending",
    paymentChoice: "Payment choice",
    remainingBalance: "Remaining balance",
    fullPaymentRequired: "Full payment required",
    chooseBefore: "Choose before payment",
    payBalance: "Pay balance",
    fullOnly: "Full only",
    total: "Total",
    remainingPayment: "Remaining payment",
    halfPayment: "Half payment",
    fullPayment: "Full payment",
    balanceAfterPaid: "Balance after paid",
    payAtService: "Pay at service",
    note: "Booking will be saved without online payment.",
    paymentSummary: "Payment Summary",
    bookingTotal: "Booking total",
    gatewayNoteOnline:
      "Full service and oil change can use full or half payment. Bodywash stays full payment only.",
    gatewayNoteService:
      "Your booking will be confirmed now and you can pay when you arrive for the service.",
    payNow: "Pay now",
    payLater: "Pay later",
    opening: "Opening PayHere...",
    saving: "Saving booking...",
    clearCart: "Clear cart",
    history: "Payment History",
    recentPayments: "Recent payments",
    paymentCancelled: "Payment was cancelled. Your cart is still here so you can try again.",
    alreadyHandled: "This payment has already been handled.",
    paymentNoItems: "Payment returned successfully, but no pending cart items were found.",
    paymentSuccess: "Payment successful. Your booking has been created and the cart is now empty.",
    payhereFailed: "Unable to start PayHere checkout",
    saveLater: "Booking saved. Please pay at the service center.",
    saveLaterFailed: "Unable to save your booking for payment at service",
    checkoutFailed: (serviceType: string) => `Failed to create ${serviceType} booking`,
    paymentReturnFailed:
      "Payment returned successfully, but booking creation failed.",
  },
  si: {
    eyebrow: "AutoFlash කරත්තය",
    heroTitle: "ඉක්මන් සේවා ගෙවීම් සඳහා සකස් කළ Checkout එක",
    heroText:
      "ඔබේ වෙන්කරවා ගැනීම පරීක්ෂා කර, අවශ්‍ය නම් ගෙවීම් ප්‍රමාණය තෝරා, සියල්ල සූදානම්ව gateway එකට යන්න.",
    payableNow: "දැන් ගෙවිය යුතුය",
    item: "වෙන්කරවා ගැනීම",
    emptyTitle: "ඔබේ කරත්තය හිස්ය",
    emptyText: "checkout ආරම්භ කිරීමට body wash, full service, හෝ oil change booking එකක් එක් කරන්න.",
    browse: "සේවා බලන්න",
    remove: (serviceType: string) => `${serviceType} ඉවත් කරන්න`,
    customerPending: "පාරිභෝගික තොරතුරු තවම නැත",
    mobilePending: "ජංගම අංකය තවම නැත",
    paymentChoice: "ගෙවීම් තේරීම",
    remainingBalance: "ඉතිරි ශේෂය",
    fullPaymentRequired: "සම්පූර්ණ ගෙවීම අවශ්‍යයි",
    chooseBefore: "ගෙවීමට පෙර තෝරන්න",
    payBalance: "ශේෂය ගෙවන්න",
    fullOnly: "සම්පූර්ණය පමණයි",
    total: "මුළු එකතුව",
    remainingPayment: "ඉතිරි ගෙවීම",
    halfPayment: "අර්ධ ගෙවීම",
    fullPayment: "සම්පූර්ණ ගෙවීම",
    balanceAfterPaid: "ගෙවීමෙන් පසු ශේෂය",
    payAtService: "සේවාවේදී ගෙවන්න",
    note: "වාහක ගෙවීමක් නොමැතිව වෙන්කරවා ගැනීම සුරකිනු ඇත.",
    paymentSummary: "ගෙවීම් සාරාංශය",
    bookingTotal: "වෙන්කරවා ගැනීමේ එකතුව",
    gatewayNoteOnline:
      "Full service සහ oil change සඳහා සම්පූර්ණ හෝ අර්ධ ගෙවීම භාවිතා කළ හැක. Bodywash සඳහා සම්පූර්ණ ගෙවීම පමණි.",
    gatewayNoteService:
      "ඔබේ booking එක දැන් තහවුරු වන අතර සේවාවට පැමිණි විට ගෙවිය හැක.",
    payNow: "දැන් ගෙවන්න",
    payLater: "පසුව ගෙවන්න",
    opening: "PayHere විවෘත කරමින්...",
    saving: "වෙන්කරවා ගැනීම සුරකිමින්...",
    clearCart: "කරත්තය හිස් කරන්න",
    history: "ගෙවීම් ඉතිහාසය",
    recentPayments: "නවතම ගෙවීම්",
    paymentCancelled: "ගෙවීම අවලංගු විය. නැවත උත්සාහ කිරීමට ඔබේ කරත්තය තවමත් මෙහි ඇත.",
    alreadyHandled: "මෙම ගෙවීම දැනටමත් සකසා ඇත.",
    paymentNoItems: "ගෙවීම සාර්ථකව පැමිණි නමුත් pending cart items හමු නොවීය.",
    paymentSuccess: "ගෙවීම සාර්ථකයි. ඔබේ වෙන්කරවා ගැනීම සෑදී ඇති අතර කරත්තය දැන් හිස්ය.",
    payhereFailed: "PayHere checkout ආරම්භ කළ නොහැක",
    saveLater: "වෙන්කරවා ගැනීම සුරකින ලදී. කරුණාකර සේවා මධ්‍යස්ථානයේදී ගෙවන්න.",
    saveLaterFailed: "සේවාවේදී ගෙවීමට ඔබේ booking එක සුරැකිය නොහැක",
    checkoutFailed: (serviceType: string) => `${serviceType} වෙන්කරවා ගැනීම සාදන්න අසාර්ථක විය`,
    paymentReturnFailed:
      "ගෙවීම සාර්ථකව පැමිණි නමුත් booking නිර්මාණය අසාර්ථක විය.",
  },
} as const;

export default function CartPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("online");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const orderId = params.get("order_id") || "";

    if (!paymentStatus) return;

    if (paymentStatus === "cancel") {
      setPaymentMessage(t.paymentCancelled);
      window.history.replaceState({}, "", "/cart");
      return;
    }

    if (paymentStatus !== "success") return;

    const processedKey = orderId ? `autoflashProcessedOrder:${orderId}` : "";

    if (processedKey && window.localStorage.getItem(processedKey)) {
      setPaymentMessage(t.alreadyHandled);
      window.history.replaceState({}, "", "/cart");
      return;
    }

    const stored = window.localStorage.getItem("autoflashPendingCheckout");
    const pendingItems = stored ? (JSON.parse(stored) as CartItem[]) : getCartItems();

    if (!Array.isArray(pendingItems) || pendingItems.length === 0) {
      setPaymentMessage(t.paymentNoItems);
      window.history.replaceState({}, "", "/cart");
      return;
    }

    const createPaidBookings = async () => {
      setIsCheckingOut(true);
      setCheckoutError("");

      try {
        for (const item of pendingItems) {
          const type = item.serviceCategory === "bodywash" ? "bodywash" : "fullservice";
          const res = await fetch(`/api/bookings?type=${type}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...item.bookingPayload,
              paymentStatus: "Paid",
              paymentOption: item.paymentOption,
              paidAmount: item.payableAmount,
              paymentOrderId: orderId,
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || t.checkoutFailed(item.serviceType));
          }
        }

        clearCart();
        window.localStorage.removeItem("autoflashPendingCheckout");
        if (processedKey) window.localStorage.setItem(processedKey, "true");
        setItems([]);
        setPaymentMessage(t.paymentSuccess);
      } catch (error) {
        setCheckoutError(
          error instanceof Error ? error.message : t.paymentReturnFailed
        );
      } finally {
        setIsCheckingOut(false);
        window.history.replaceState({}, "", "/cart");
      }
    };

    createPaidBookings();
  }, [t]);

  useEffect(() => {
    const syncCart = () => {
      setItems(getCartItems());
      setPaymentHistory(getPaymentHistory());
    };

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

  const handlePayNow = async () => {
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
        throw new Error(data.error || t.payhereFailed);
      }

      window.localStorage.setItem("autoflashPendingCheckout", JSON.stringify(items));
      if (typeof data?.fields?.order_id === "string" && data.fields.order_id) {
        window.localStorage.setItem("autoflashPendingOrderId", data.fields.order_id);
      }
      submitPayHereForm(data.actionUrl, data.fields);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : t.payhereFailed);
      setIsCheckingOut(false);
    }
  };

  const handlePayInService = async () => {
    if (items.length === 0 || isCheckingOut) return;

    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      for (const item of items) {
        const type = item.serviceCategory === "bodywash" ? "bodywash" : "fullservice";
        const res = await fetch(`/api/bookings?type=${type}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...item.bookingPayload,
            paymentStatus: "Pending",
            paymentOption: "full",
            paidAmount: 0,
            remainingAmount: Number(item.totalPrice || 0),
          }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || t.checkoutFailed(item.serviceType));
        }
      }

      clearCart();
      window.localStorage.removeItem("autoflashPendingCheckout");
      window.localStorage.removeItem("autoflashPendingOrderId");
      setItems([]);
      setPaymentMessage(t.saveLater);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : t.saveLaterFailed
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
        </div>
        <div className={styles.heroPanel}>
          <span>{t.payableNow}</span>
          <strong>LKR {totals.payable.toLocaleString()}</strong>
          <small>
            {items.length} {t.item}
            {items.length === 1 ? "" : "s"}
          </small>
        </div>
      </section>

      <section className={styles.cartShell}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FaCreditCard />
            </div>
            <h2>{t.emptyTitle}</h2>
            {paymentMessage && <p className={styles.successText}>{paymentMessage}</p>}
            <p>{t.emptyText}</p>
            <Link href="/services" className={styles.primaryLink}>
              {t.browse}
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
                      aria-label={t.remove(item.serviceType)}
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
                      <FaUser /> {item.customerName || t.customerPending}
                    </span>
                    <span>
                      <FaPhoneAlt /> {item.mobile || t.mobilePending}
                    </span>
                  </div>

                  {checkoutMode === "online" ? (
                    <>
                      <div className={styles.paymentSelector}>
                        <div>
                          <span>{t.paymentChoice}</span>
                          <strong>
                            {item.paymentStage === "remaining"
                              ? t.remainingBalance
                              : item.serviceCategory === "bodywash"
                              ? t.fullPaymentRequired
                              : t.chooseBefore}
                          </strong>
                        </div>
                        {item.paymentStage === "remaining" ? (
                          <div className={styles.lockedPayment}>
                            <FaLock /> {t.payBalance}
                          </div>
                        ) : item.serviceCategory === "fullservice" ? (
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
                            <FaLock /> {t.fullOnly}
                          </div>
                        )}
                      </div>
                      <div className={styles.priceRow}>
                        <div>
                          <span>{t.total}</span>
                          <strong>LKR {item.totalPrice.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>
                            {item.paymentStage === "remaining"
                              ? t.remainingPayment
                              : item.paymentOption === "half"
                              ? t.halfPayment
                              : t.fullPayment}
                          </span>
                          <strong>LKR {item.payableAmount.toLocaleString()}</strong>
                        </div>
                        {item.remainingAmount ? (
                          <div>
                            <span>{t.balanceAfterPaid}</span>
                            <strong>LKR {item.remainingAmount.toLocaleString()}</strong>
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <div className={styles.priceRow}>
                      <div>
                        <span>{t.total}</span>
                        <strong>LKR {item.totalPrice.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>{t.payAtService}</span>
                        <strong>LKR {item.totalPrice.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>{t.note}</span>
                        <strong>{t.note}</strong>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <aside className={styles.summary}>
              <div className={styles.summaryHeader}>
                <FaCreditCard />
                <h2>{t.paymentSummary}</h2>
              </div>
              <div className={styles.summaryLine}>
                <span>{t.bookingTotal}</span>
                <strong>LKR {totals.total.toLocaleString()}</strong>
              </div>
              <div className={styles.summaryLine}>
                <span>{checkoutMode === "online" ? t.payableNow : t.payAtService}</span>
                <strong>
                  LKR {checkoutMode === "online" ? totals.payable.toLocaleString() : totals.total.toLocaleString()}
                </strong>
              </div>
              <div className={styles.gatewayNote}>
                {checkoutMode === "online" ? t.gatewayNoteOnline : t.gatewayNoteService}
              </div>
              {paymentMessage && <div className={styles.paymentMessage}>{paymentMessage}</div>}
              {checkoutError && <div className={styles.checkoutError}>{checkoutError}</div>}
              <div className={styles.checkoutActions}>
                <button
                  type="button"
                  className={`${styles.checkoutBtn} ${checkoutMode === "online" ? styles.segmentActive : ""}`}
                  onClick={() => {
                    setCheckoutMode("online");
                    handlePayNow();
                  }}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut && checkoutMode === "online" ? t.opening : t.payNow}
                </button>
                <button
                  type="button"
                  className={`${styles.checkoutBtn} ${styles.checkoutLaterBtn} ${
                    checkoutMode === "service" ? styles.segmentActive : ""
                  }`}
                  onClick={() => {
                    setCheckoutMode("service");
                    handlePayInService();
                  }}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut && checkoutMode === "service" ? t.saving : t.payLater}
                </button>
              </div>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
              >
                {t.clearCart}
              </button>
            </aside>
          </>
        )}
      </section>

      {paymentHistory.length > 0 && (
        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <p className={styles.eyebrow}>{t.history}</p>
            <h2>{t.recentPayments}</h2>
          </div>
          <div className={styles.historyList}>
            {paymentHistory.slice(0, 8).map((payment) => (
              <article key={payment.id} className={styles.historyItem}>
                <div>
                  <strong>{payment.serviceType}</strong>
                  <span>
                    {payment.bookingDate} at {payment.bookingTime}
                  </span>
                </div>
                <div>
                  <span>{payment.status}</span>
                  <strong>LKR {payment.paidAmount.toLocaleString()}</strong>
                  {payment.remainingAmount > 0 && (
                    <small>LKR {payment.remainingAmount.toLocaleString()}</small>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
