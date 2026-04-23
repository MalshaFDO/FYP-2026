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
    console.error("ADMIN E-RECORD-BOOK FEATURE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        enabled: false,
        error: "Failed to load e-record book status",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const enabled = Boolean(body?.enabled);

    const setting = await FeatureSetting.findOneAndUpdate(
      { key: FEATURE_KEY },
      {
        $set: {
          key: FEATURE_KEY,
          enabled,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      enabled: Boolean(setting?.enabled),
    });
  } catch (error: any) {
    console.error("ADMIN E-RECORD-BOOK FEATURE PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update e-record book status",
      },
      { status: 500 }
    );
  }
}
