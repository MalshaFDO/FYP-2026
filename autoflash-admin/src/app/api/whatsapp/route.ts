import { NextResponse } from "next/server";

const toMMDDYYYY = (rawDate: string) => {
  const value = rawDate.trim();
  if (!value) return "";

  const pad = (part: string) => part.padStart(2, "0");

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T|\s)/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${pad(month)}/${pad(day)}/${year}`;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${pad(month)}/${pad(day)}/${year}`;
  }

  const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, month, day, year] = dashMatch;
    return `${pad(month)}/${pad(day)}/${year}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getMonth() + 1).padStart(2, "0")}/${String(
      parsed.getDate()
    ).padStart(2, "0")}/${parsed.getFullYear()}`;
  }

  return value;
};

const formatAdditionalServices = (input: unknown) => {
  if (!input) return "None";

  if (Array.isArray(input)) {
    const names = input
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && "name" in item) {
          return String((item as { name?: unknown }).name ?? "").trim();
        }
        return "";
      })
      .filter(Boolean);

    return names.length ? names.join(", ") : "None";
  }

  if (typeof input === "string") return input.trim() || "None";

  return "None";
};

export async function POST(req: Request) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phone = body?.phone?.toString()?.trim?.() ?? "";
  const name = body?.name?.toString()?.trim?.() ?? "";
  const service = body?.service?.toString()?.trim?.() ?? "";
  const vehicleNumber =
    body?.vehicleNumber?.toString()?.trim?.() ??
    body?.vehicle?.toString()?.trim?.() ??
    "Not provided";
  const price =
    body?.price?.toString()?.trim?.() ??
    body?.totalPrice?.toString()?.trim?.() ??
    "Not provided";
  const venue = body?.venue?.toString()?.trim?.() ?? "Autoflash Service Center";
  const date = body?.date?.toString()?.trim?.() ?? "";
  const time = body?.time?.toString()?.trim?.() ?? "";
  const bookingRefFromBody =
    body?.bookingRef?.toString()?.trim?.() ??
    body?.reference?.toString()?.trim?.() ??
    "";
  const additionalServices = formatAdditionalServices(body?.additionalServices);
  const template = body?.template?.toString()?.trim?.().toLowerCase?.() ?? "confirm";

  const missing: string[] = [];
  if (!phone) missing.push("phone");
  if (!name) missing.push("name");
  if (!service) missing.push("service");

  if (missing.length) {
    return NextResponse.json(
      { error: "Missing required fields", fields: missing },
      { status: 400 }
    );
  }

  const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID?.trim() ?? "";
  const whatsappToken = process.env.WHATSAPP_TOKEN?.trim() ?? "";

  if (!whatsappPhoneId || !whatsappToken) {
    return NextResponse.json(
      { error: "WhatsApp service is not configured" },
      { status: 500 }
    );
  }

  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const bookingRef = bookingRefFromBody || "AF-" + Date.now().toString().slice(-6);
  const bookingDate = toMMDDYYYY(date) || "To be confirmed";
  const bookingTime = time || "To be confirmed";

  const whatsappMessage = `
${greeting} ${name}

AUTOFALSH BOOKING CONFIRMED

Ref: ${bookingRef}
Service: ${service}
Date: ${bookingDate}
Time: ${bookingTime}
Vehicle Number: ${vehicleNumber}
Add-ons: ${additionalServices}
Venue: ${venue}
Total: Rs. ${price}

Please arrive 10 minutes before your appointment.

Thank you for choosing Autoflash.
`;

  const cancelMessage = `
${greeting} ${name}

Your Autoflash Booking Has Been Cancelled

Ref: ${bookingRef}
Service: ${service}
Date: ${bookingDate}
Time: ${bookingTime}
Add-ons: ${additionalServices}

If this was a mistake or you'd like to reschedule,
please contact us.

Autoflash Team
`;

  const selectedMessage = template === "cancel" ? cancelMessage : whatsappMessage;

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: selectedMessage.trim() },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const apiMessage =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      data?.message ||
      "Unknown WhatsApp API error";
    const apiCode = data?.error?.code;
    const apiType = data?.error?.type;
    const apiTraceId = data?.error?.fbtrace_id;

    console.error("WhatsApp API error", {
      status: response.status,
      code: apiCode,
      type: apiType,
      message: apiMessage,
      traceId: apiTraceId,
    });

    return NextResponse.json(
      {
        error: "WhatsApp API request failed",
        message: apiMessage,
        code: apiCode,
        type: apiType,
        traceId: apiTraceId,
        details: data,
      },
      { status: response.status || 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
