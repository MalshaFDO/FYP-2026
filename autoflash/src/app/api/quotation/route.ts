import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  const assetUrl = req.nextUrl.searchParams.get("url");
  const publicId = req.nextUrl.searchParams.get("publicId");
  const requestedFileName = req.nextUrl.searchParams.get("filename");
  const shouldDownload = req.nextUrl.searchParams.get("download") === "1";

  if (!assetUrl && !publicId) {
    return NextResponse.json({ error: "Missing quotation reference" }, { status: 400 });
  }

  let sourceUrls: string[];

  if (assetUrl) {
    try {
      const parsedUrl = new URL(assetUrl);
      if (!parsedUrl.hostname.endsWith("cloudinary.com")) {
        return NextResponse.json({ error: "Invalid quotation URL" }, { status: 400 });
      }
      sourceUrls = [assetUrl];
    } catch {
      return NextResponse.json({ error: "Invalid quotation URL" }, { status: 400 });
    }
  } else {
    sourceUrls = [
      cloudinary.url(publicId!, {
        secure: true,
        resource_type: "image",
        type: "upload",
        format: "pdf",
      }),
      cloudinary.url(publicId!, {
        secure: true,
        resource_type: "raw",
        type: "upload",
        format: "pdf",
      }),
    ];
  }

  let upstream: Response | null = null;
  let sourceUrl = sourceUrls[0];

  for (const candidateUrl of sourceUrls) {
    const response = await fetch(candidateUrl);
    if (response.ok) {
      upstream = response;
      sourceUrl = candidateUrl;
      break;
    }
  }

  if (!upstream) {
    return NextResponse.json(
      { error: "Unable to fetch quotation PDF" },
      { status: 404 },
    );
  }

  const pdfBuffer = await upstream.arrayBuffer();
  const fileName = (
    requestedFileName ||
    publicId?.split("/").pop() ||
    sourceUrl?.split("/").pop()?.split("?")[0]?.replace(/\.pdf$/i, "") ||
    "quotation"
  ).replace(/[^\w\s.-]/g, "").trim() || "quotation";

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename=\"${fileName}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
