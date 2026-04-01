import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

type QuotationPdfData = {
  quotationNumber?: string;
  customerName: string;
  mobile: string;
  vehicle: string;
  vehicleNumber: string;
  oilBrand?: string;
  oilGrade: string;
  bookingDate?: string;
  bookingTime?: string;
  quote: {
    items: Array<{
      name: string;
      price: number;
    }>;
    total: number;
  };
};

export async function generateQuotationPDF(data: QuotationPdfData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  // --- Helpers ---
  const sanitizePdfText = (value: unknown) =>
    String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "");

  // Format Current Date/Time
  const now = new Date();
  const generatedAt = now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const drawRow = (
    label: string,
    value: string,
    yPos: number,
    isBold = false,
    color = rgb(0, 0, 0),
  ) => {
    const activeFont = isBold ? boldFont : font;
    page.drawText(sanitizePdfText(label), {
      x: 70,
      y: yPos,
      size: 10,
      font: activeFont,
      color,
    });
    const valText = sanitizePdfText(value);
    const textWidth = activeFont.widthOfTextAtSize(valText, 10);
    page.drawText(valText, {
      x: 530 - textWidth,
      y: yPos,
      size: 10,
      font: activeFont,
      color,
    });
  };

  // 1. Header & Logo (Bigger Logo)
  try {
    const logoPath = path.join(process.cwd(), "public", "AF.png");
    const logoImageBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    
    // Increased size to 90x90
    page.drawImage(logoImage, { x: 50, y: 700, width: 90, height: 90 });
  } catch {
    console.log("Logo not found, using text-only header.");
  }

  // Adjusted text position to account for larger logo
  page.drawText("AUTOFLASH SERVICE CENTER", { x: 155, y: 760, size: 22, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("No 279, Chilaw Road, Wennappuwa", { x: 155, y: 742, size: 10, font });
  page.drawText("Tel: 076 824 8676 | Email: fujiautoflash@gmail.com", { x: 155, y: 728, size: 10, font });

  // 2. Document Info Bar
  page.drawRectangle({ x: 0, y: 660, width: 600, height: 30, color: rgb(0.96, 0.96, 0.96) });
  page.drawText("SERVICE QUOTATION", { x: 50, y: 670, size: 14, font: boldFont });

  if (data.quotationNumber) {
    const quoteNumberLabel = data.quotationNumber;
    const quoteNumberWidth = boldFont.widthOfTextAtSize(quoteNumberLabel, 10);
    page.drawText(quoteNumberLabel, {
      x: 550 - quoteNumberWidth,
      y: 671,
      size: 10,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.2),
    });
  }
  
  const genLabel = `Generated: ${generatedAt}`;
  const genWidth = font.widthOfTextAtSize(genLabel, 9);
  page.drawText(genLabel, { x: 550 - genWidth, y: 648, size: 9, font, color: rgb(0.3, 0.3, 0.3) });

  // 3. Information Grid
  let y = 620;
  page.drawText("CUSTOMER INFO", { x: 50, y, size: 9, font: boldFont, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("VEHICLE INFO", { x: 320, y, size: 9, font: boldFont, color: rgb(0.5, 0.5, 0.5) });
  
  y -= 18;
  page.drawText(`Name: ${data.customerName}`, { x: 50, y, size: 11, font });
  page.drawText(`Vehicle: ${data.vehicle}`, { x: 320, y, size: 11, font });
  
  y -= 15;
  page.drawText(`Mobile: ${data.mobile}`, { x: 50, y, size: 11, font });
  page.drawText(`Reg No: ${data.vehicleNumber}`, { x: 320, y, size: 11, font });

  // 4. Quotation Table
  y -= 50;
  page.drawRectangle({ x: 50, y: y - 5, width: 500, height: 20, color: rgb(0.15, 0.15, 0.2) });
  page.drawText("DESCRIPTION", { x: 70, y, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText("AMOUNT (LKR)", { x: 450, y, size: 10, font: boldFont, color: rgb(1, 1, 1) });

  y -= 25;
  data.quote.items.forEach((item) => {
    const isFree = item.name.toLowerCase().includes("scan");
    drawRow(
      item.name,
      isFree ? "FREE" : `LKR ${item.price}`,
      y,
      false,
      isFree ? rgb(1, 0, 0) : rgb(0, 0, 0),
    );
    y -= 20;
  });

  // 5. Total Section
  y -= 15;
  page.drawLine({ start: { x: 350, y }, end: { x: 550, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  
  y -= 30;
  page.drawRectangle({ x: 350, y: y - 10, width: 200, height: 35, color: rgb(0.92, 0.94, 1) });
  
  const totalVal = `LKR ${data.quote.total.toLocaleString()}`;
  page.drawText("GRAND TOTAL:", { x: 360, y, size: 12, font: boldFont });
  const totalWidth = boldFont.widthOfTextAtSize(totalVal, 12);
  page.drawText(totalVal, { x: 540 - totalWidth, y, size: 12, font: boldFont, color: rgb(0, 0, 0.5) });

  // 6. Footer Details
  y = 100;
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  
  y -= 20;
  page.drawText("Note: This quotation is valid for 14 days and based on the current service requirements.", { x: 50, y, size: 8, font});
  
  const footerText = "Thank you for your business!";
  const footWidth = font.widthOfTextAtSize(footerText, 12);
  page.drawText(footerText, { x: 300 - footWidth / 2, y: 50, size: 12, font: boldFont, color: rgb(0.4, 0.4, 0.4) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
