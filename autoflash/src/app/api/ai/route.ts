import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";
import { calculateServiceQuote } from "@/lib/pricing";
import { generateQuotationPDF } from "@/lib/generateQuote";
import cloudinary from "@/lib/cloudinary";

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
      stage = "start",
      serviceType,
      bookingData = {},
    } = await req.json();

    if (stage === "start") {
      return NextResponse.json({
        reply: "Hi! Welcome to AutoFlash. How can I assist you today?",
        nextStage: "make_model",
        bookingData,
      });
    }

    if (stage === "make_model") {
      const validVehicle = message.trim().split(" ").length >= 2;

      if (!validVehicle) {
        return NextResponse.json({
          reply: "Please provide your vehicle make and model. Example: Toyota Axio",
          nextStage: "make_model",
          bookingData,
        });
      }

      bookingData.vehicle = message;

      return NextResponse.json({
        reply:
          "Got it. What oil grade was used in your last service? If you're not sure, just tell me your current mileage.",
        nextStage: "oil_info",
        bookingData,
      });
    }

    if (stage === "oil_info") {
      let recommendedOil = "";
      let userProvidedOil = false;

      const gradeMatch = message.match(/\b\d{1,2}w-\d{2}\b/i);
      if (gradeMatch) {
        recommendedOil = gradeMatch[0].toUpperCase();
        userProvidedOil = true;
      }

      const mileageMatch = message.match(/\d+/);

      if (!userProvidedOil && mileageMatch) {
        const mileage = parseInt(mileageMatch[0], 10);
        bookingData.mileage = mileage;
        recommendedOil = mileage >= 100000 ? "10W-40" : "5W-30";
      }

      bookingData.oilGrade = recommendedOil || "5W-30";

      const reply = userProvidedOil
        ? `Great. We'll proceed with ${bookingData.oilGrade} fully synthetic oil.`
        : `Based on your mileage, I recommend ${bookingData.oilGrade} fully synthetic oil.`;

      return NextResponse.json({
        reply: `${reply}

Please select your preferred oil brand:

1. Toyota
2. Mobil
3. Castrol
4. Honda`,
        nextStage: "oil_brand",
        bookingData,
      });
    }

    if (stage === "oil_brand") {
      const msg = message.toLowerCase();

      let selectedBrand = "";

      if (msg.includes("1") || msg.includes("toyota")) {
        selectedBrand = "toyota";
      } else if (msg.includes("2") || msg.includes("mobil")) {
        selectedBrand = "mobil";
      } else if (msg.includes("3") || msg.includes("castrol")) {
        selectedBrand = "castrol";
      } else if (msg.includes("4") || msg.includes("honda")) {
        selectedBrand = "honda";
      } else {
        return NextResponse.json({
          reply: "Please select a valid option: Toyota, Mobil, Castrol, or Honda.",
          nextStage: "oil_brand",
          bookingData,
        });
      }

      bookingData.oilBrand = selectedBrand;

      const quote = calculateServiceQuote({
        oilGrade: bookingData.oilGrade,
        vehicle: bookingData.vehicle,
        brand: selectedBrand,
      });

      bookingData.quote = quote;

      return NextResponse.json({
        reply: `Great. You selected ${selectedBrand.toUpperCase()} oil.

Oil Required: ${quote.liters}L

Engine Oil (${quote.liters}L) - LKR ${quote.oilPrice}
Oil Filter - LKR ${quote.oilFilter}
Service Charge - LKR ${quote.serviceCharge}

Total: LKR ${quote.total}

Generating your quotation...`,
        nextStage: "generate_pdf",
        bookingData,
      });
    }

    if (stage === "generate_pdf") {
      const quote = calculateServiceQuote({
        oilGrade: bookingData.oilGrade,
        vehicle: bookingData.vehicle,
        brand: bookingData.oilBrand || "mobil",
      });

      const pdfBytes = await generateQuotationPDF({
        customerName: "Preview",
        mobile: "N/A",
        vehicle: bookingData.vehicle,
        vehicleNumber: "N/A",
        oilBrand: bookingData.oilBrand,
        oilGrade: bookingData.oilGrade,
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        quote,
      });

      const base64File = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;

      const uploadRes = await cloudinary.uploader.upload(base64File, {
        resource_type: "image",
        folder: "autoflash/quotations",
      });

      const publicId = uploadRes.public_id;
      const securePdfUrl = uploadRes.secure_url;
      const fallbackPdfUrl = `/api/quotation?publicId=${encodeURIComponent(publicId)}`;
      const pdfUrl = securePdfUrl || fallbackPdfUrl;
      const pdfDownloadUrl = publicId
        ? cloudinary.url(publicId, {
            secure: true,
            resource_type: "image",
            type: "upload",
            format: "pdf",
            flags: "attachment",
          })
        : securePdfUrl || `${fallbackPdfUrl}&download=1`;

      bookingData.quote = quote;

      return NextResponse.json({
        reply: "Your quotation is ready. Please review it below.",
        pdfUrl,
        pdfDownloadUrl,
        cloudinaryPdfUrl: securePdfUrl || null,
        nextStage: "quotation",
        bookingData,
      });
    }

    if (stage === "quotation") {
      const quote = calculateServiceQuote({
        oilGrade: bookingData.oilGrade,
        vehicle: bookingData.vehicle,
        brand: bookingData.oilBrand || "mobil",
      });

      return NextResponse.json({
        reply: `Your total service cost is LKR ${quote.total}.

Your selected slot is ${bookingData.bookingDate} at ${bookingData.bookingTime}.

Is this date and time convenient for you?`,
        nextStage: "confirm_slot",
        bookingData,
      });
    }

    if (stage === "confirm_slot") {
      const msg = message.toLowerCase();

      if (
        msg.includes("yes") ||
        msg.includes("yeah") ||
        msg.includes("yep") ||
        msg.includes("sure") ||
        msg.includes("ok")
      ) {
        return NextResponse.json({
          reply: "Great. What is your name?",
          nextStage: "details_name",
          bookingData,
        });
      }

      return NextResponse.json({
        reply: "No problem. Please select another date and time.",
        nextStage: "quotation",
        bookingData,
      });
    }

    if (stage === "details_name") {
      bookingData.customerName = message.trim();

      return NextResponse.json({
        reply: "Great. Please enter your mobile number.",
        nextStage: "details_mobile",
        bookingData,
      });
    }

    if (stage === "details_mobile") {
      const mobileMatch = message.match(/0\d{9}/);

      if (!mobileMatch) {
        return NextResponse.json({
          reply: "Please enter a valid mobile number. Example: 0771234567",
          nextStage: "details_mobile",
          bookingData,
        });
      }

      bookingData.mobile = mobileMatch[0];

      return NextResponse.json({
        reply: "Perfect. Now enter your vehicle number. Example: CAK-6494",
        nextStage: "details_vehicle",
        bookingData,
      });
    }

    if (stage === "details_vehicle") {
      try {
        await connectDB();

        const bookingDate = bookingData.bookingDate;
        const bookingTime = bookingData.bookingTime;

        const slotDateTime = parseTimeSlot(bookingDate, bookingTime);

        if (slotDateTime < new Date()) {
          return NextResponse.json({
            reply: "You cannot book a past time slot.",
            nextStage: "quotation",
            bookingData,
          });
        }

        const existingCount = await Booking.countDocuments({
          bookingDate,
          bookingTime,
          serviceCategory: "fullservice",
          status: { $ne: "Cancelled" },
        });

        const vehicleMatch = message.match(/[A-Z]{2,3}-?\d{3,4}/i);

        let vehicleNumber = vehicleMatch![0]
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");

        const match = vehicleNumber.match(/^([A-Z]+)(\d+)$/);
        if (match) vehicleNumber = `${match[1]}-${match[2]}`;

        const quote = calculateServiceQuote({
          oilGrade: bookingData.oilGrade,
          vehicle: bookingData.vehicle,
          brand: bookingData.oilBrand || "mobil",
        });

        await Booking.create({
          vehicle: bookingData.vehicle,
          serviceType: normalizeServiceType(serviceType),
          serviceCategory: "fullservice",
          oilGrade: bookingData.oilGrade,
          oilBrand: bookingData.oilBrand,
          mileage: bookingData.mileage,
          customerName: bookingData.customerName,
          mobile: bookingData.mobile,
          vehicleNumber,
          bookingDate,
          bookingTime,
          hourSlot: existingCount + 1,
          totalPrice: quote.total,
          status: "Pending",
        });

        return NextResponse.json({
          reply: `Thank you ${bookingData.customerName}. Your booking is confirmed for ${bookingDate} at ${bookingTime}.`,
          nextStage: "done",
          bookingData,
        });
      } catch (error) {
        console.error(error);

        return NextResponse.json(
          {
            reply: "Something went wrong. Please try again.",
            nextStage: "details_vehicle",
            bookingData,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      reply: "I couldn't understand that request.",
      nextStage: stage,
      bookingData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
