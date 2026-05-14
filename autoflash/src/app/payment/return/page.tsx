"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPaymentHistory,
  getCartItems,
  saveCartItems,
} from "@/lib/cart";
import type { CartItem, PaymentHistoryItem } from "@/lib/cart";

const HOME_REDIRECT_DELAY = 1800;

function getRemainingCartItem(item: CartItem, bookingId: string, remainingAmount: number): CartItem {
  return {
    ...item,
    bookingId,
    paymentOption: "full",
    paymentStage: "remaining",
    paymentStatus: "Partially Paid",
    paidAmount: item.payableAmount,
    remainingAmount,
    totalPrice: remainingAmount,
    payableAmount: remainingAmount,
    bookingPayload: {
      ...item.bookingPayload,
      bookingId,
      paymentStatus: "Partially Paid",
      paidAmount: item.payableAmount,
      remainingAmount,
    },
  };
}

export default function PaymentReturnPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizing your payment...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const storedOrderId = window.localStorage.getItem("autoflashPendingOrderId") || "";
    const orderId = params.get("order_id") || storedOrderId;

    if (paymentStatus === "cancel") {
      setIsError(true);
      setMessage("Payment was cancelled. Returning to your cart...");
      window.localStorage.removeItem("autoflashPendingOrderId");
      const timer = window.setTimeout(() => router.replace("/cart"), HOME_REDIRECT_DELAY);
      return () => window.clearTimeout(timer);
    }

    const processedKey = orderId ? `autoflashProcessedOrder:${orderId}` : "";

    if (processedKey && window.localStorage.getItem(processedKey)) {
      setMessage("This payment was already finalized. Returning home...");
      const timer = window.setTimeout(() => router.replace("/"), HOME_REDIRECT_DELAY);
      return () => window.clearTimeout(timer);
    }

    const finalizePayment = async () => {
      try {
        const stored = window.localStorage.getItem("autoflashPendingCheckout");
        const pendingItems = stored ? (JSON.parse(stored) as CartItem[]) : getCartItems();

        if (!Array.isArray(pendingItems) || pendingItems.length === 0) {
          setMessage("Payment completed. Returning home...");
          window.localStorage.removeItem("autoflashPendingCheckout");
          window.localStorage.removeItem("autoflashPendingOrderId");
          if (processedKey) window.localStorage.setItem(processedKey, "true");
          window.setTimeout(() => router.replace("/"), HOME_REDIRECT_DELAY);
          return;
        }

        const remainingItems: CartItem[] = [];
        const historyItems: Omit<PaymentHistoryItem, "id" | "paidAt">[] = [];

        for (const item of pendingItems) {
          const totalPrice = Number(item.totalPrice || 0);
          const paidNow = Number(item.payableAmount || 0);
          const isRemainingPayment = item.paymentStage === "remaining" && item.bookingId;

          if (isRemainingPayment) {
            const res = await fetch("/api/bookings/payment", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: item.bookingId,
                paidAmount: paidNow,
                totalPrice: Number(item.paidAmount || 0) + paidNow,
                paymentOrderId: orderId,
                paymentOption: "full",
                paymentStage: "remaining",
              }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
              throw new Error(data.error || "Failed to update remaining payment");
            }

            historyItems.push({
              orderId,
              bookingId: item.bookingId,
              serviceType: item.serviceType,
              customerName: item.customerName,
              mobile: item.mobile,
              bookingDate: item.bookingDate,
              bookingTime: item.bookingTime,
              totalPrice: Number(item.paidAmount || 0) + paidNow,
              paidAmount: paidNow,
              remainingAmount: 0,
              paymentOption: "full" as const,
              paymentStage: "remaining" as const,
              status: "Paid" as const,
            });

            continue;
          }

          const remainingAmount = Math.max(0, totalPrice - paidNow);
          const paymentStatus: "Partially Paid" | "Paid" =
            remainingAmount > 0 ? "Partially Paid" : "Paid";
          const type = item.serviceCategory === "bodywash" ? "bodywash" : "fullservice";
          const res = await fetch(`/api/bookings?type=${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...item.bookingPayload,
              paymentStatus,
              paymentOption: item.paymentOption,
              paidAmount: paidNow,
              remainingAmount,
              paymentOrderId: orderId,
            }),
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || `Failed to create ${item.serviceType} booking`);
          }

          const bookingId = data.booking?._id?.toString?.() || data.booking?._id || "";

          historyItems.push({
            orderId,
            bookingId,
            serviceType: item.serviceType,
            customerName: item.customerName,
            mobile: item.mobile,
            bookingDate: item.bookingDate,
            bookingTime: item.bookingTime,
            totalPrice,
            paidAmount: paidNow,
            remainingAmount,
            paymentOption: item.paymentOption,
            paymentStage: "initial" as const,
            status: paymentStatus,
          });

          if (remainingAmount > 0 && bookingId) {
            remainingItems.push(getRemainingCartItem(item, bookingId, remainingAmount));
          }
        }

        addPaymentHistory(historyItems);
        saveCartItems(remainingItems);
        window.localStorage.removeItem("autoflashPendingCheckout");
        window.localStorage.removeItem("autoflashPendingOrderId");
        if (processedKey) window.localStorage.setItem(processedKey, "true");

        setMessage(
          remainingItems.length > 0
            ? "Half payment saved. Your remaining balance is still in the cart."
            : "Full payment saved. Your cart is clear."
        );
        window.setTimeout(() => router.replace("/"), HOME_REDIRECT_DELAY);
      } catch (error) {
        setIsError(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Payment completed, but finalizing the booking failed."
        );
      }
    };

    finalizePayment();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#08111f",
        color: "#f8fafc",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: 520 }}>
        <p style={{ color: isError ? "#fca5a5" : "#67e8f9", fontWeight: 700 }}>
          AutoFlash Payment
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
          {isError ? "Please check your payment" : "Payment received"}
        </h1>
        <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>{message}</p>
      </section>
    </main>
  );
}
