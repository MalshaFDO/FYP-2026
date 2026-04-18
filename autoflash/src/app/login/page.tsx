"use client";

import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");

  const sendOtp = async () => {
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    setStep("otp");
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

   if (data.token) {
  // 🔐 store token
  localStorage.setItem("token", data.token);

  // 👉 get redirect route
  const redirect =
    localStorage.getItem("redirectAfterLogin") || "/booking/bodywash";

  // 🧹 clear redirect
  localStorage.removeItem("redirectAfterLogin");

  // 🔥 force full reload (IMPORTANT)
  window.location.href = redirect;
}
    else {
      alert(data.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-xl mb-4">Login with OTP</h1>

      {step === "phone" && (
        <>
          <input
            type="text"
            placeholder="Enter phone"
            className="w-full p-2 mb-3 text-black"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={sendOtp}
            className="bg-green-500 px-4 py-2 w-full"
          >
            Send OTP
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 mb-3 text-black"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={verifyOtp}
            className="bg-blue-500 px-4 py-2 w-full"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}