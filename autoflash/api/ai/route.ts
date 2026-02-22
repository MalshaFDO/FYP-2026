import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, stage } = await req.json();

    let reply = "";
    let nextStage = stage;

    // ===== STAGE 1 =====
    if (stage === "make_model") {
      reply = `Thank you. What oil grade was used in your previous service? If unsure, please provide your current mileage.`;
      nextStage = "oil_info";
    }

    // ===== STAGE 2 =====
    else if (stage === "oil_info") {
      let recommendedOil = "";

      if (message.toLowerCase().includes("w")) {
        recommendedOil = message;
      } else {
        const mileage = parseInt(message.replace(/\D/g, ""));
        if (mileage < 50000) recommendedOil = "5W-20";
        else if (mileage < 100000) recommendedOil = "5W-30";
        else recommendedOil = "10W-40";
      }

      reply = `Based on your information, I recommend ${recommendedOil} fully synthetic oil.

Here is your quotation:

Engine Oil – LKR 8,500
Oil Filter – LKR 2,500
Service Charge – LKR 3,000

Total: LKR 14,000

Would you like to proceed with booking?`;

      nextStage = "quotation";
    }

    // ===== STAGE 3 =====
    else if (stage === "quotation") {
      if (message.toLowerCase().includes("yes")) {
        reply = "Please provide your Name and Mobile Number to confirm the booking.";
        nextStage = "details";
      } else {
        reply = "No problem. Let me know if you need anything else.";
        nextStage = "done";
      }
    }

    // ===== STAGE 4 =====
    else if (stage === "details") {
      reply = `Thank you. Your booking request has been recorded. Our team will contact you shortly to confirm the appointment. 🚗`;
      nextStage = "done";
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
${reply}`
        }
      ]
    }
  ]
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
