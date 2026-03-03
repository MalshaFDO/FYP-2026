import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function normalizeServiceType(serviceType?: string) {
  if (!serviceType) return "Full Service (AI)";

  const key = serviceType.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";

  return serviceType;
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

      reply = `Based on your information, I recommend ${bookingData.oilGrade} fully synthetic oil.

Here is your quotation:

Engine Oil - LKR 8,500
Oil Filter - LKR 2,500
Service Charge - LKR 3,000

Total: LKR 14,000

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

      // Simple parsing (you can improve later)
      const parts = message.trim().split(" ");

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

const customerName = parts.slice(0, parts.length - 2).join(" ");
const quoteTotal = 14000;

await Booking.create({
  vehicle: bookingData.vehicle,
  serviceType: normalizeServiceType(serviceType),
  oilGrade: bookingData.oilGrade,
  mileage: bookingData.mileage,
  customerName,
  mobile,
  vehicleNumber: formattedVehicleNumber || vehicleNumber,
  bookingDate: new Date().toISOString().split("T")[0],
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
              text: `You are an automotive service booking assistant.

Rewrite the following message as a single professional response.
Do NOT provide multiple options.
Do NOT explain anything.
Return only the final message.

Message:
${reply}`,
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
