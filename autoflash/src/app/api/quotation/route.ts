import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const assetUrl = req.nextUrl.searchParams.get("url");
  const publicId = req.nextUrl.searchParams.get("publicId");
  const shouldDownload = req.nextUrl.searchParams.get("download") === "1";

  if (!assetUrl && !publicId) {
    return NextResponse.json({ error: "Missing quotation reference" }, { status: 400 });
  }

  let sourceUrl: string;

  if (assetUrl) {
    try {
      const parsedUrl = new URL(assetUrl);
      if (!parsedUrl.hostname.endsWith("cloudinary.com")) {
        return NextResponse.json({ error: "Invalid quotation URL" }, { status: 400 });
      }
      sourceUrl = assetUrl;
    } catch {
      return NextResponse.json({ error: "Invalid quotation URL" }, { status: 400 });
    }
  } else {
    sourceUrl = cloudinary.url(publicId!, {
      secure: true,
      resource_type: "raw",
      type: "upload",
      format: "pdf",
    });
  }

  const upstream = await fetch(sourceUrl);

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Unable to fetch quotation PDF" },
      { status: upstream.status },
    );
  }

  const pdfBuffer = await upstream.arrayBuffer();
  const fileName =
    publicId?.split("/").pop() ||
    sourceUrl?.split("/").pop()?.split("?")[0]?.replace(/\.pdf$/i, "") ||
    "quotation";

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename=\"${fileName}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
