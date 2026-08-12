import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userCode, password } = await req.json();

    if (!userCode || !password) {
      return NextResponse.json(
        { success: false, message: "User Code, mobile, or email and password are required!" },
        { status: 400 }
      );
    }

    const identifier = String(userCode).trim();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const cleanedAsMobile = identifier.replace(/\D/g, "").replace(/^0+/, "");
    const isMobile = /^\d{10}$/.test(cleanedAsMobile);

    let query;
    if (isEmail) {
      query = { email: identifier.toLowerCase() };
    } else if (isMobile) {
      query = { mobile: cleanedAsMobile };
    } else {
      query = { userCode: identifier.toUpperCase() };
    }

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials!" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials!" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        userCode: user.userCode,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      pan: user.pan,
      country: user.country,
      userCode: user.userCode,
      walletType: user.walletType,
      walletAddress: user.walletAddress,
      mt5Email: user.mt5Email,
      referralToken: user.referralToken,
      parentId: user.parentId,
      children: user.children,
      payments: user.payments,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      data: { user: userResponse, token },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}