import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const to =
      body?.to?.toString()?.trim?.() ??
      body?.email?.toString()?.trim?.() ??
      "";
    const name = body?.name?.toString()?.trim?.() ?? body?.customerName?.toString()?.trim?.() ?? "";
    const service =
      body?.service?.toString()?.trim?.() ??
      body?.serviceType?.toString()?.trim?.() ??
      "";
    const bookingDate =
      body?.bookingDate?.toString()?.trim?.() ??
      body?.date?.toString()?.trim?.() ??
      "Not specified";
    const bookingTime =
      body?.bookingTime?.toString()?.trim?.() ??
      body?.time?.toString()?.trim?.() ??
      "Not specified";
    const bookingRef =
      body?.bookingRef?.toString()?.trim?.() ??
      body?.reference?.toString()?.trim?.() ??
      "";

    if (!to || !name || !service || !bookingRef) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Autoflash" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Booking Cancelled | Ref: ${bookingRef}`,
      html: `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;">
          <div style="background:#b91c1c; color:#ffffff; padding:16px 24px; font-weight:700; font-size:16px; letter-spacing:0.4px;">
            BOOKING CANCELLATION NOTICE
          </div>
          <div style="padding:24px;">
          <h2 style="color:#b91c1c; margin:0 0 10px;">${greeting}, ${name}</h2>
          <p style="margin:0 0 14px;">We regret to inform you that your booking has been cancelled.</p>

          <div style="margin:0 0 16px; padding:10px 12px; border:1px solid #fecaca; background:#fef2f2; border-radius:8px;">
            <strong style="color:#991b1b;">Cancelled Booking Ref: ${bookingRef}</strong>
          </div>

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
              <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Date</strong></td>
              <td style="padding:8px; border-bottom:1px solid #eee;">${bookingDate}</td>
            </tr>
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Time</strong></td>
              <td style="padding:8px; border-bottom:1px solid #eee;">${bookingTime}</td>
            </tr>
          </table>

          <p style="margin-top:20px;">
            If this was done in error or you wish to reschedule, please contact us.
          </p>

          <p style="margin-top:30px;">
            Regards,<br/>
            <strong>Autoflash Team</strong>
          </p>
          </div>
        </div>
      </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Cancel email failed:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
