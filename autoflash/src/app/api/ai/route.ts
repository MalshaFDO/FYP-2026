import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";
import ClosedDay from "@/models/closedDay";
import ClosedSlot from "@/models/ClosedSlot";
import { calculateServiceQuote } from "@/lib/pricing";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const FULLSERVICE_SLOT_LIMIT = 2;

function normalizeServiceType(serviceType?: string) {
  if (!serviceType) return "Full Service (AI)";

  const key = serviceType.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";

  return serviceType;
}

function parseTimeSlot(date: string, time: string) {
  const [clock, meridiemRaw] = time.split(" ");
  const [hourRaw, minuteRaw] = clock.split(":").map(Number);
  const meridiem = meridiemRaw.toLowerCase();
  let hour = hourRaw;

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const slotDateTime = new Date(`${date}T00:00:00`);
  slotDateTime.setHours(hour, minuteRaw || 0, 0, 0);
  return slotDateTime;
}

export async function POST(req: Request) {
  try {
    const {
      message = "",
      stage = "make_model", 
      serviceType,
      bookingData = {},
    } = await req.json();

    let reply = "";
    let nextStage = stage;
    // ===== STAGE 1 =====
    if (stage === "make_model") {
      const validVehicle = message.trim().split(" ").length >= 2;

      if (!validVehicle) {
        return NextResponse.json({
          reply: "Please provide your vehicle make and model. Example: Toyota Axio",
          nextStage: "make_model",
        });
      }

      bookingData.vehicle = message;
      reply = "Thank you. Could you please confirm the oil grade used during your previous service? If unsure, provide your current mileage.";
      nextStage = "oil_info";
    }

    // ===== STAGE 2 =====
   else if (stage === "oil_info") {
  let recommendedOil = "";

  const gradeMatch = message.match(/\b\d{1,2}w-\d{2}\b/i);
  if (gradeMatch) {
    recommendedOil = gradeMatch[0].toUpperCase();
  }

  const mileageMatch = message.match(/\d+/);
  if (!recommendedOil && mileageMatch) {
    const mileage = parseInt(mileageMatch[0], 10);
    recommendedOil = mileage >= 100000 ? "10W-40" : "5W-30";
  }

  if (mileageMatch) {
    bookingData.mileage = parseInt(mileageMatch[0], 10);
  }

  bookingData.oilGrade = recommendedOil || "5W-30";

  // ✅ NEW: Dynamic Pricing
  const quote = calculateServiceQuote({
    oilGrade: bookingData.oilGrade,
    vehicle: bookingData.vehicle,
  });

  // Store for later use (PDF + DB)
  bookingData.quote = quote;

  const hasSelectedSlot = Boolean(
    bookingData.bookingDate && bookingData.bookingTime
  );

  reply = `Based on your information, I recommend ${bookingData.oilGrade} fully synthetic oil.

Here is your quotation:

Engine Oil - LKR ${quote.oilPrice}
Oil Filter - LKR ${quote.oilFilter}
Service Charge - LKR ${quote.serviceCharge}

Total: LKR ${quote.total}

${
  hasSelectedSlot
    ? `Your selected slot is ${bookingData.bookingDate} at ${bookingData.bookingTime}.`
    : "Please select your preferred date and time on the calendar."
}

Would you like to proceed with booking?`;

  nextStage = "quotation";
}

    // ===== STAGE 3 =====
      else if (stage === "quotation") {
        if (message.toLowerCase().includes("yes")) {
          reply = "Please provide your Name, Mobile Number, and Vehicle Number to confirm the booking. Example: Malsha Fernando 0771234567 CAA-1234";
          nextStage = "details";
        } else {
          reply = "No problem. Let me know if you need anything else.";
          nextStage = "done";
        }
      }
    // ===== STAGE 4 =====
    else if (stage === "details") {
      console.log("DETAILS STAGE HIT");
      console.log("Booking Data:", bookingData);
      console.log("Service Type:", serviceType);

      await connectDB();

      // Get booking date
      const bookingDate =
        bookingData.bookingDate || new Date().toISOString().split("T")[0];
      const bookingTime = bookingData.bookingTime || "10:00 am";

      // Check if admin closed this date
      const closed = await ClosedDay.findOne({ date: bookingDate });

      if (closed) {
        return NextResponse.json({
          reply: `Sorry, bookings are closed on this date: ${closed.reason}`,
          nextStage: "done",
        });
      }

      const closedSlots = await ClosedSlot.find({
        date: bookingDate,
      });

      for (const slot of closedSlots) {
        const slotDateTime = parseTimeSlot(bookingDate, bookingTime);
        const start = parseTimeSlot(bookingDate, slot.startTime);
        const end = parseTimeSlot(bookingDate, slot.endTime);

        if (slotDateTime >= start && slotDateTime < end) {
          return NextResponse.json({
            error: `This time is closed: ${slot.reason ?? "Closed"}`,
          });
        }
      }


      // Simple parsing (you can improve later)
      const parts = message.trim().split(" ");
      if (parts.length < 3) {
        return NextResponse.json({
          reply: "Please provide Name, Mobile Number, and Vehicle Number.",
          nextStage: "details",
        });
      }

      const vehicleNumber = parts[parts.length - 1];
      const mobile = parts[parts.length - 2];

      // Normalize format
      let formattedVehicleNumber = vehicleNumber
        ?.toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

      if (formattedVehicleNumber) {
        const match = formattedVehicleNumber.match(/^([A-Z]+)(\d+)$/);

        if (match) {
          const letters = match[1];
          const numbers = match[2];
          formattedVehicleNumber = `${letters}-${numbers}`;
        }
      }

        const formattedMobileNumber = mobile?.replace(/\D/g, "");

      // Count existing full service bookings
      const existingCount = await Booking.countDocuments({
        bookingDate,
        bookingTime,
        serviceCategory: "fullservice",
        status: { $ne: "Cancelled" },
      });

      if (existingCount >= FULLSERVICE_SLOT_LIMIT) {
        return NextResponse.json({
          reply:
            "Sorry, this time slot is fully booked for Full Service. Please choose another time.",
          nextStage: "done",
        });
      }

      const customerName = parts.slice(0, parts.length - 2).join(" ");
      const quoteTotal = 14000;

      await Booking.create({
        vehicle: bookingData.vehicle,
        serviceType: normalizeServiceType(serviceType),
        serviceCategory: "fullservice",
        oilGrade: bookingData.oilGrade,
        mileage: bookingData.mileage,
        customerName,
        mobile: formattedMobileNumber || mobile,
        vehicleNumber: formattedVehicleNumber || vehicleNumber,
        bookingDate: bookingData.bookingDate || new Date().toISOString().split("T")[0],
        bookingTime: bookingData.bookingTime || "10:00 am",
        hourSlot: existingCount + 1,
        totalPrice: quoteTotal,
        status: "Pending",
      });
      reply = `Thank you ${customerName}. Your booking has been successfully created. Our team will contact you shortly.`;
      nextStage = "done";
    }
    else {
      reply = "Session reset. Please provide your vehicle make and model to start a new booking.";
      nextStage = "make_model";
    }

    // ===== Gemini Formatting Layer =====
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

   const formatted = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `
You are AutoFlash AI, a professional automotive service advisor in Sri Lanka.

Customer Vehicle: ${bookingData.vehicle}
Mileage: ${bookingData.mileage}
Oil Grade: ${bookingData.oilGrade}

Your responsibilities:
- Guide customers through booking
- Recommend correct oil types
- Provide clear quotations in LKR
- Keep responses short and professional

Rules:
- Do NOT mention AI
- Do NOT give multiple options
- Keep under 5 lines
- If bookingDate and bookingTime are present, confirm the selected slot and do NOT ask for date/time

Message:
${reply}
          `,
        },
      ],
    },
  ],
});
    const response = await formatted.response;

    return NextResponse.json({
      reply: response.text(),
      nextStage,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
