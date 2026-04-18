import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/user";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, phone, password } = await req.json();

    // 🔍 Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 💾 Create new user
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        message: "Signup error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}