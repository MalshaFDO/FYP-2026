import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

  if (typeof input === "string") {
    return input.trim() || "None";
  }

  return "None";
};

export async function POST(req: Request) {
  let to = "";
  let name = "";
  let service = "";
  let vehicleNumber = "";
  let price = "";
  let venue = "";
  let bookingDate = "";
  let bookingTime = "";
  let bookingRef = "";
  let additionalServices = "None";

  try {
    const body = await req.json();

    to = body?.to?.toString()?.trim?.() ?? "";
    name = body?.name?.toString()?.trim?.() ?? "";
    service = body?.service?.toString()?.trim?.() ?? "";
    vehicleNumber =
      body?.vehicleNumber?.toString()?.trim?.() ??
      body?.vehicle?.toString()?.trim?.() ??
      "";
    price =
      body?.price?.toString()?.trim?.() ??
      body?.totalPrice?.toString()?.trim?.() ??
      "";
    venue = body?.venue?.toString()?.trim?.() ?? "Autoflash Service Center";
    bookingDate =
  body?.bookingDate?.toString()?.trim?.() ??
  body?.date?.toString()?.trim?.() ??
  "";

bookingTime =
  body?.bookingTime?.toString()?.trim?.() ??
  body?.time?.toString()?.trim?.() ??
  "";

    bookingRef =
      body?.bookingRef?.toString()?.trim?.() ??
      body?.reference?.toString()?.trim?.() ??
      "";
    additionalServices = formatAdditionalServices(body?.additionalServices);
    bookingDate = toMMDDYYYY(bookingDate);
  } 
  catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing: string[] = [];
  if (!to) missing.push("to");
  if (!name) missing.push("name");
  if (!service) missing.push("service");
  if (!bookingDate) bookingDate = "Not specified";
  if (!bookingTime) bookingTime = "Not specified";

  if (missing.length) {
    return NextResponse.json(
      { error: "Missing required fields", fields: missing },
      { status: 400 }
    );
  }

  if (!vehicleNumber) vehicleNumber = "Not provided";
  if (!price) price = "Not provided";
  if (!venue) venue = "Autoflash Service Center";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(to)) {
    return NextResponse.json({ error: "Invalid recipient email" }, { status: 400 });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return NextResponse.json(
      { error: "Email service is not configured" },
      { status: 500 }
    );
  }

  const hour = new Date().getHours();
  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  if (!bookingRef) {
    bookingRef = "AF-" + Date.now().toString().slice(-6);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Autoflash" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Booking Confirmed | Ref: ${bookingRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;">
            <div style="background:#166534; color:#ffffff; padding:16px 24px; font-weight:700; font-size:16px; letter-spacing:0.4px;">
              BOOKING CONFIRMED
            </div>
            <div style="padding:24px;">
            <h2 style="color:#166534; margin:0 0 10px;">${greeting}, ${name}</h2>
            <p>Your booking has been successfully confirmed. Below are the details:</p>

            <table style="width:100%; border-collapse: collapse; margin-top:15px;">
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Booking Reference</strong></td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${bookingRef}</td>
              </tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Service</strong></td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${service}</td>
              </tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">
                <strong>Booking Date</strong>
                </td>
                <td style="padding:8px; border-bottom:1px solid #eee;">
                 ${bookingDate}
                     </td>
                    </tr>

<tr>
  <td style="padding:8px; border-bottom:1px solid #eee;">
    <strong>Booking Time</strong>
  </td>
  <td style="padding:8px; border-bottom:1px solid #eee;">
    ${bookingTime}
  </td>
</tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Vehicle Number</strong></td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${vehicleNumber}</td>
              </tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Additional Services</strong></td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${additionalServices}</td>
              </tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Venue</strong></td>
                <td style="padding:8px; border-bottom:1px solid #eee;">${venue}</td>
              </tr>
              <tr>
                <td style="padding:8px;"><strong>Total Price</strong></td>
                <td style="padding:8px; color:#e10600; font-weight:bold;">Rs. ${price}</td>
              </tr>
            </table>

            <u><b><p style="margin-top:20px; color:#b91c1c" >Please arrive 10 minutes before your scheduled time.</p></b></u>
            <p style="margin-top:30px;">Thank you for choosing <strong>Autoflash</strong>.</p>
            <hr style="margin-top:30px;" />
            <p style="font-size:12px; color:#777;">If you have any questions, reply to this email or contact us directly At +9476 824 8676.</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
