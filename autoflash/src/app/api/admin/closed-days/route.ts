import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ClosedDay from "@/models/closedDay";

export async function GET() {
  try {
    await connectDB();
    const days = await ClosedDay.find({});
    return NextResponse.json({ success: true, days });
  } catch (error) {
    console.error("Fetch closed days error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch closed days" },
      { status: 500 }
    );
  }
}
