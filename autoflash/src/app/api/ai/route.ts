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
  start: (msg: string, data: any) => 
    sendResponse("Hi! Welcome to AutoFlash. How can I assist you today?", "make_model", data),

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

    const uploadRes = await cloudinary.uploader.upload(base64File, {
      resource_type: "raw",
      folder: "autoflash/quotations",
      public_id: `Quote_${Date.now()}`,
      format: "pdf",
    });

    await Quotation.create({
      ...data,
      quotationNumber: qNum,
      totalPrice: quote.total,
      pdfUrl: uploadRes.secure_url,
      status: "generated",
    });

    return NextResponse.json({
      pdfUrl: uploadRes.secure_url,
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

    let securePdfUrl = null;
    try {
      const upload = await cloudinary.uploader.upload(base64File, {
        resource_type: "raw",
        folder: "autoflash/quotations",
        public_id: `Quote_${Date.now()}`,
        format: "pdf",
      });
      securePdfUrl = upload.secure_url;
    } catch (e) {
      console.error("PDF Upload Error", e);
    }

    await Quotation.create({ ...data, quotationNumber: qNum, totalPrice: quote.total, pdfUrl: securePdfUrl, status: "generated" });
    
    data.quotationNumber = qNum;
    data.quote = quote;
    return sendResponse("Your quotation is ready. Review it below.", "quotation", data, { 
      pdfUrl: securePdfUrl || base64File, 
      quotationNumber: qNum 
    });
  },

  quotation: (msg: string, data: any) => {
    const reply = `Your total service cost is LKR ${data.quote.total}.\nYour selected appointment is ${data.bookingDate} at ${data.bookingTime}.\n\nWould you like to confirm this booking?`;
    return sendResponse(reply, "confirm_slot", data);
  },

  confirm_slot: (msg: string, data: any) => {
    const isAffirmative = /yes|yeah|yep|sure|ok/i.test(msg);
    return isAffirmative 
      ? sendResponse("Thank you. May I have your name, please?", "details_name", data)
      : sendResponse("Certainly. Please review the quotation and select a more convenient date and time.", "quotation", data);
  },

  details_name: (msg: string, data: any) => {
    data.customerName = msg.trim();
    return sendResponse(`Thank you, ${data.customerName}. Could you please share your mobile number?`, "details_mobile", data);
  },

  details_mobile: (msg: string, data: any) => {
    const match = msg.match(/0\d{9}/);
    if (!match) return sendResponse("Please enter a valid 10-digit mobile number, for example 0771234567.", "details_mobile", data);
    data.mobile = match[0];
    return sendResponse("Lastly, could you please provide your vehicle registration number? For example: CAK-6494.", "details_vehicle", data);
  },

  details_vehicle: async (msg: string, data: any, serviceType: string) => {
    try {
      await connectDB();
      const slotDateTime = parseTimeSlot(data.bookingDate, data.bookingTime);
      if (slotDateTime < new Date()) return sendResponse("You cannot book a past slot.", "quotation", data);

      const vehicleNum = msg.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]+)(\d+)$/, "$1-$2");
      const count = await Booking.countDocuments({ bookingDate: data.bookingDate, bookingTime: data.bookingTime });

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

      return sendResponse(`Your booking has been confirmed successfully. We look forward to seeing you on ${data.bookingDate} at ${data.bookingTime}.`, "done", data);
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


