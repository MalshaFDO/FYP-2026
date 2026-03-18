import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ClosedDay from "@/models/closedDay";

export async function GET() {
  await connectDB();
  const days = await ClosedDay.find({});
  return NextResponse.json({ success: true, days });
}

export async function POST(req: Request) {
  await connectDB();
  const { date, reason } = await req.json();

  await ClosedDay.create({ date, reason });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const { date } = await req.json();

  await ClosedDay.deleteOne({ date });

  return NextResponse.json({ success: true });
}