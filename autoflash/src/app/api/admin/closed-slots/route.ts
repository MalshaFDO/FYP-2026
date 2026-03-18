import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ClosedSlot from "@/models/ClosedSlot";

export async function GET() {
  try {
    await connectDB();
    const slots = await ClosedSlot.find({});
    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error("Fetch closed slots error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch closed slots" },
      { status: 500 }
    );
  }
}
