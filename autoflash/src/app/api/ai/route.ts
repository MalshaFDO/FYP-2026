import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/booking";
import Quotation from "@/models/Quotation";
import { calculateServiceQuote } from "@/lib/pricing";
import { getServiceItems } from "@/lib/getServiceItems";
import { generateQuotationPDF } from "@/lib/generateQuote";
import cloudinary from "@/lib/cloudinary";

// --- Helpers ---

const sendResponse = (reply: string, nextStage: string, bookingData: any, extras = {}) => 
  NextResponse.json({ reply, nextStage, bookingData, ...extras });

function normalizeServiceType(serviceType?: string) {
  const key = serviceType?.trim().toLowerCase();
  if (key === "full") return "Full Service";
  if (key === "oil") return "Oil Change";
  return serviceType || "Full Service (AI)";
}

function parseTimeSlot(date: string, time: string) {
  const [clock, meridiemRaw] = time.split(" ");
  const [hourRaw, minuteRaw] = clock.split(":").map(Number);
  let hour = hourRaw;
  const meridiem = meridiemRaw.toLowerCase();

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const slotDateTime = new Date(`${date}T00:00:00`);
  slotDateTime.setHours(hour, minuteRaw || 0, 0, 0);
  return slotDateTime;
}

function getNextDetailsStage(data: any) {
  if (!String(data?.customerName ?? "").trim()) return "details_name";
  if (!String(data?.mobile ?? "").trim()) return "details_mobile";
  if (!String(data?.vehicleNumber ?? "").trim()) return "details_vehicle";
  return null;
}

async function uploadQuotationPdf(base64File: string) {
  try {
    const upload = await cloudinary.uploader.upload(base64File, {
      resource_type: "raw",
      folder: "autoflash/quotations",
      public_id: `Quote_${Date.now()}`,
      format: "pdf",
    });

    return upload.secure_url ?? null;
  } catch (error) {
    console.error("Quotation PDF Upload Error:", error);
    return null;
  }
}

async function createFullServiceBooking(data: any, serviceType: string) {
  await connectDB();

  const slotDateTime = parseTimeSlot(data.bookingDate, data.bookingTime);
  if (slotDateTime < new Date()) {
    return sendResponse("You cannot book a past slot.", "quotation", data);
  }

  const vehicleNum = String(data.vehicleNumber ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^([A-Z]+)(\d+)$/, "$1-$2");
  const count = await Booking.countDocuments({
    bookingDate: data.bookingDate,
    bookingTime: data.bookingTime,
  });

  await Booking.create({
    ...data,
    vehicleNumber: vehicleNum,
    serviceType: normalizeServiceType(serviceType),
    serviceCategory: "fullservice",
    additionalServices: data.additionalServices ?? [],
    hourSlot: count + 1,
    totalPrice: data.quote.total,
    status: "Pending",
  });

  return sendResponse(
    `Your booking has been confirmed successfully. We look forward to seeing you on ${data.bookingDate} at ${data.bookingTime}.`,
    "done",
    {
      ...data,
      vehicleNumber: vehicleNum,
    }
  );
}

function buildQuote(bookingData: any) {
  const isSelectedService = bookingData.vehicleType && Array.isArray(bookingData.services) && bookingData.services.length > 0;
  const isOilChangePackage = String(bookingData.serviceType ?? "").toLowerCase() === "oil";
  const additionalServices = Array.isArray(bookingData.additionalServices)
    ? bookingData.additionalServices
        .filter((service: any) => service && service.name)
        .map((service: any) => ({
          name: String(service.name),
          price: Number(service.price) || 0,
        }))
    : [];
  const additionalServicesTotal = additionalServices.reduce(
    (sum: number, item: { price: number }) => sum + item.price,
    0,
  );
  
  const oilBrandLabel = String(bookingData.oilBrand ?? "Mobil")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const oilQuote = calculateServiceQuote({
    oilGrade: bookingData.oilGrade,
    vehicle: bookingData.vehicle,
    brand: bookingData.oilBrand || "mobil",
  });

  if (isOilChangePackage) {
    return {
      items: [
        { name: `Engine Oil (${oilBrandLabel} ${bookingData.oilGrade}, ${oilQuote.liters}L)`, price: oilQuote.oilPrice },
        { name: "Genuine Oil Filter Replacement", price: oilQuote.oilFilter },
        { name: "Oil Change Labor Charge", price: oilQuote.serviceCharge },
        ...additionalServices,
      ],
      total: oilQuote.total + additionalServicesTotal,
    };
  }

  if (isSelectedService) {
    const orderedServices = (bookingData.services as string[]).filter(
      (service) => service !== "oilChange" && service !== "oilFilter"
    );
    const serviceQuote = getServiceItems({
      vehicleType: bookingData.vehicleType,
      selectedServices: orderedServices,
    });

    if (!bookingData.oilGrade) return serviceQuote;

    const primaryServices = serviceQuote.items.filter(
      (item: any) => item.name === "Full Service" || item.name === "Engine Wash"
    );
    const remainingServices = serviceQuote.items.filter(
      (item: any) => item.name !== "Full Service" && item.name !== "Engine Wash"
    );

    return {
      items: [
        ...primaryServices,
        { name: `Engine Oil (${oilBrandLabel} ${bookingData.oilGrade}, ${oilQuote.liters}L)`, price: oilQuote.oilPrice },
        { name: "Genuine Oil Filter Replacement", price: oilQuote.oilFilter },
        ...remainingServices,
        ...additionalServices,
      ],
      total: serviceQuote.total + oilQuote.oilPrice + oilQuote.oilFilter + additionalServicesTotal,
    };
  }

  return {
    items: [
      { name: `Engine Oil Service (${oilBrandLabel} ${bookingData.oilGrade}, ${oilQuote.liters}L)`, price: oilQuote.oilPrice },
      { name: "Genuine Oil Filter Replacement", price: oilQuote.oilFilter },
      { name: "Standard Service Labor Charge", price: oilQuote.serviceCharge },
      ...additionalServices,
    ],
    total: oilQuote.total + additionalServicesTotal,
  };
}

// --- Stage Handlers ---

const STAGE_HANDLERS: Record<string, Function> = {
  start: (msg: string, data: any) => {
    if (data?.hasSavedVehicles && data?.selectedVehicleLabel) {
      return sendResponse(
        `Hi! Would you like the quotation for your saved vehicle ${data.selectedVehicleLabel}, or for another vehicle?`,
        "saved_vehicle_choice",
        data
      );
    }

    return sendResponse("Hi! Welcome to AutoFlash. How can I assist you today?", "make_model", data);
  },

  saved_vehicle_choice: (msg: string, data: any) => {
    const normalized = msg.trim().toLowerCase();
    const useSavedVehicle = /^(yes|y|saved|current|this|same|use saved)/i.test(normalized);
    const useOtherVehicle = /^(no|n|other|another|different)/i.test(normalized);

    if (useSavedVehicle) {
      data.useSavedVehicle = true;
      return sendResponse(
        `Great. We'll use your saved vehicle ${data.selectedVehicleLabel}. What oil grade was used in your last service? (Or tell me your mileage)`,
        "oil_info",
        data
      );
    }

    if (useOtherVehicle) {
      data.useSavedVehicle = false;
      data.vehicle = "";
      data.vehicleNumber = "";
      data.vehicleId = "";
      data.selectedVehicleLabel = "";

      return sendResponse(
        "Sure. Please provide your vehicle make and model. Example: Toyota Axio",
        "make_model",
        data
      );
    }

    return sendResponse(
      "Please reply with yes to use your saved vehicle, or say other if the quotation is for a different vehicle.",
      "saved_vehicle_choice",
      data
    );
  },

  make_model: (msg: string, data: any) => {
    if (msg.trim().split(" ").length < 2) {
      return sendResponse("Please provide your vehicle make and model. Example: Toyota Axio", "make_model", data);
    }
    data.vehicle = msg;
    return sendResponse("Got it. What oil grade was used in your last service? (Or tell me your mileage)", "oil_info", data);
  },

  oil_info: (msg: string, data: any) => {
    const gradeMatch = msg.match(/\b\d{1,2}w-\d{2}\b/i);
    const mileageMatch = msg.match(/\d+/);
    
    if (gradeMatch) {
      data.oilGrade = gradeMatch[0].toUpperCase();
    } else if (mileageMatch) {
      const mileage = parseInt(mileageMatch[0], 10);
      data.mileage = mileage;
      data.oilGrade = mileage >= 100000 ? "10W-40" : "5W-30";
    } else {
      data.oilGrade = "5W-30";
    }

    const reply = `Recommended: ${data.oilGrade} fully synthetic oil.\n\nPlease select a brand:\n1. Toyota\n2. Mobil\n3. Castrol\n4. Honda`;
    return sendResponse(reply, "oil_brand", data);
  },

  oil_brand: (msg: string, data: any) => {
    const brands: Record<string, string> = { "1": "toyota", "2": "mobil", "3": "castrol", "4": "honda" };
    const selected = Object.entries(brands).find(([k, v]) => msg.toLowerCase().includes(k) || msg.toLowerCase().includes(v))?.[1];

    if (!selected) {
      return sendResponse("Please select a valid option: Toyota, Mobil, Castrol, or Honda.", "oil_brand", data);
    }

    data.oilBrand = selected;
    return sendResponse("Please review and adjust your service selection below.", "select_services", data);  },

  select_services: (msg: string, data: any) =>
    sendResponse("Please review and adjust your service selection below.", "select_services", data),

  generate_quote: async (msg: string, data: any) => {
    await connectDB();
    const quote = buildQuote(data);
    const count = await Quotation.countDocuments();
    const qNum = `Quotation No. ${String(count + 1).padStart(2, "0")}`;

    const pdfBytes = await generateQuotationPDF({
      ...data,
      quote,
      quotationNumber: qNum,
      customerName: data.customerName || "Preview",
    });

    const base64File = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;
    const securePdfUrl = await uploadQuotationPdf(base64File);

    await Quotation.create({
      ...data,
      quotationNumber: qNum,
      totalPrice: quote.total,
      pdfUrl: securePdfUrl,
      status: "generated",
    });

    return NextResponse.json({
      pdfUrl: securePdfUrl || base64File,
      pdfDownloadUrl: securePdfUrl || base64File,
      cloudinaryPdfUrl: securePdfUrl,
      nextStage: "done",
      quotationNumber: qNum,
      bookingData: {
        ...data,
        quote,
        quotationNumber: qNum,
      },
    });
  },

  generate_pdf: async (msg: string, data: any) => {
    await connectDB();
    const quote = data.quote ?? buildQuote(data);
    const count = await Quotation.countDocuments();
    const qNum = `Quotation No. ${String(count + 1).padStart(2, "0")}`;

    const pdfBytes = await generateQuotationPDF({ ...data, quotationNumber: qNum, quote, customerName: "Preview" });
    const base64File = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;
    const securePdfUrl = await uploadQuotationPdf(base64File);

    await Quotation.create({ ...data, quotationNumber: qNum, totalPrice: quote.total, pdfUrl: securePdfUrl, status: "generated" });
    
    data.quotationNumber = qNum;
    data.quote = quote;
    return sendResponse("Your quotation is ready. Review it below.", "quotation", data, { 
      pdfUrl: securePdfUrl || base64File, 
      pdfDownloadUrl: securePdfUrl || base64File,
      cloudinaryPdfUrl: securePdfUrl,
      quotationNumber: qNum 
    });
  },

  quotation: (msg: string, data: any) => {
    const reply = `Your total service cost is LKR ${data.quote.total}.\nYour selected appointment is ${data.bookingDate} at ${data.bookingTime}.\n\nWould you like to confirm this booking?`;
    return sendResponse(reply, "confirm_slot", data);
  },

  confirm_slot: async (msg: string, data: any, serviceType: string) => {
    const isAffirmative = /yes|yeah|yep|sure|ok/i.test(msg);

    if (!isAffirmative) {
      return sendResponse("Certainly. Please review the quotation and select a more convenient date and time.", "quotation", data);
    }

    const nextStage = getNextDetailsStage(data);

    if (nextStage === "details_name") {
      return sendResponse("Thank you. May I have your name, please?", "details_name", data);
    }

    if (nextStage === "details_mobile") {
      return sendResponse("Thank you. Could you please share your mobile number?", "details_mobile", data);
    }

    if (nextStage === "details_vehicle") {
      return sendResponse("Lastly, could you please provide your vehicle registration number? For example: CAK-6494.", "details_vehicle", data);
    }

    return createFullServiceBooking(data, serviceType);
  },

  details_name: async (msg: string, data: any, serviceType: string) => {
    data.customerName = msg.trim();

    const nextStage = getNextDetailsStage(data);

    if (nextStage === "details_mobile") {
      return sendResponse(`Thank you, ${data.customerName}. Could you please share your mobile number?`, "details_mobile", data);
    }

    if (nextStage === "details_vehicle") {
      return sendResponse("Lastly, could you please provide your vehicle registration number? For example: CAK-6494.", "details_vehicle", data);
    }

    return createFullServiceBooking(data, serviceType);
  },

  details_mobile: async (msg: string, data: any, serviceType: string) => {
    const match = msg.match(/0\d{9}/);
    if (!match) return sendResponse("Please enter a valid 10-digit mobile number, for example 0771234567.", "details_mobile", data);
    data.mobile = match[0];

    const nextStage = getNextDetailsStage(data);

    if (nextStage === "details_vehicle") {
      return sendResponse("Lastly, could you please provide your vehicle registration number? For example: CAK-6494.", "details_vehicle", data);
    }

    return createFullServiceBooking(data, serviceType);
  },

  details_vehicle: async (msg: string, data: any, serviceType: string) => {
    try {
      data.vehicleNumber = msg;
      return createFullServiceBooking(data, serviceType);
    } catch (err) {
      return NextResponse.json({ reply: "We encountered a system issue while saving your booking. Please try again.", nextStage: "details_vehicle", bookingData: data }, { status: 500 });
    }
  },

  done: (msg: string, data: any) =>
    sendResponse(
      "You're very welcome. If you need any further assistance, we're always happy to help.",
      "done",
      data,
    )
};

// --- Main Entry ---

export async function POST(req: Request) {
  try {
    const { message = "", stage = "start", serviceType, bookingData = {} } = await req.json();
    const handler = STAGE_HANDLERS[stage];

    if (handler) {
      return await handler(message, bookingData, serviceType);
    }

    return sendResponse("I’m sorry, something went wrong in the conversation flow. Let’s start again.", "start", {});
  } catch (error) {
    console.error("Critical AI Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


