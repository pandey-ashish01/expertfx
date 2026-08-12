import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const DEFAULT_MAX_MONTHS  = 24;
const REFERRAL_MAX_MONTHS = 30;

async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ userId: string; paymentId: string }> }
) {
  try {
    await connectDB();
    const { userId, paymentId } = await context.params;

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded)
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    if (decoded.userCode !== "EXPERT000")
      return NextResponse.json({ success: false, message: "Access denied. Admins only." }, { status: 403 });

    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status))
      return NextResponse.json({ success: false, message: "Invalid status. Use 'approved' or 'rejected'." }, { status: 400 });

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const payment = user.payments.id(paymentId);
    if (!payment)
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });

    if (payment.status !== "pending")
      return NextResponse.json({ success: false, message: `Payment is already ${payment.status}.` }, { status: 400 });

    payment.status = status;
    payment.updatedAt = new Date();

    if (status === "approved") {
      if (user.children && user.children.length > 0) {
        user.maxInvestmentMonths = REFERRAL_MAX_MONTHS;
      } else if (!user.maxInvestmentMonths) {
        user.maxInvestmentMonths = DEFAULT_MAX_MONTHS;
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully!`,
      data: {
        paymentId,
        status,
        userName: user.name,
        userCode: user.userCode,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error("Admin PUT payment error:", error);
    return NextResponse.json({ success: false, message: "Error updating payment" }, { status: 500 });
  }
}