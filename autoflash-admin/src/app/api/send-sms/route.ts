import { NextResponse } from "next/server";
import axios from "axios";

const formatSmsDate = (value: string) => {
  const raw = value.trim();
  if (!raw) return raw;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatSmsTime = (value: string) => {
  const raw = value.trim();
  if (!raw) return raw;
  return raw.replace(/\b(am|pm)\b/i, (match) => match.toUpperCase());
};

const formatSmsVehicleNumber = (value: string) => {
  const raw = value.trim();
  if (!raw) return raw;
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const match = cleaned.match(/^([A-Z]+)(\d+)$/);
  if (!match) return cleaned;
  const letters = match[1];
  const numbers = match[2];
  return `${letters} - ${numbers}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = body?.name?.toString()?.trim?.() ?? "";
    const phone = body?.phone?.toString()?.trim?.() ?? "";
    const vehicleNumber = body?.vehicleNumber?.toString()?.trim?.() ?? "";
    const bookingDate = body?.bookingDate?.toString()?.trim?.() ?? "";
    const bookingTime = body?.bookingTime?.toString()?.trim?.() ?? "";
    const service = body?.service?.toString()?.trim?.() ?? "";
    const bookingRef = body?.bookingRef?.toString()?.trim?.() ?? "";
    const message = body?.message?.toString()?.trim?.() ?? "";

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }
    if (!message && !name) {
      return NextResponse.json(
        { error: "Name is required when message is not provided" },
        { status: 400 }
      );
    }

    // Ensure phone format 947XXXXXXXX
    let formattedPhone = phone.replace(/\s+/g, "");
    if (formattedPhone.startsWith("07")) {
      formattedPhone = "94" + formattedPhone.slice(1);
    }

    const displayDate = formatSmsDate(bookingDate);
    const displayTime = formatSmsTime(bookingTime);
    const displayVehicle = formatSmsVehicleNumber(vehicleNumber);

    const smsMessage =
      message ||
      `Mr/Mrs. ${name},

Your ${displayVehicle} booking is confirmed.

Date: ${displayDate}
Time: ${displayTime}
Service: ${service}
Ref: ${bookingRef}

Please arrive 10 minutes early.

Thank you for choosing AutoFlash.`;

    const response = await axios.post(
      process.env.SMS_API_URL as string,
      null,
      {
        params: {
          m: smsMessage,
          r: formattedPhone,
          a: process.env.SMS_SENDER_ID,
          u: process.env.SMS_USERNAME,
          p: process.env.SMS_PASSWORD,
          t: process.env.SMS_TYPE || 0,
        },
      }
    );

    console.log("Mobitel Response:", response.data);

    if (response.data === 200) {
      return NextResponse.json({
        success: true,
        message: "SMS sent successfully",
      });
    }

    return NextResponse.json({
      success: false,
      mobitelCode: response.data,
    });

  } catch (error: any) {
    console.error("SMS sending failed:", error?.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
