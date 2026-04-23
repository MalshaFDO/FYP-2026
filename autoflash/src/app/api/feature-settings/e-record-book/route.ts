import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import FeatureSetting from "@/models/featureSetting";

const FEATURE_KEY = "e-record-book";

export async function GET() {
  try {
    await connectDB();

    const setting = await FeatureSetting.findOne({ key: FEATURE_KEY }).lean();

    return NextResponse.json({
      success: true,
      enabled: Boolean(setting?.enabled),
    });
  } catch (error: any) {
    console.error("E-RECORD-BOOK FEATURE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        enabled: false,
        message: "Failed to load e-record book status",
      },
      { status: 500 }
    );
  }
}
