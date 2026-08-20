//api/admin/payments/[userid]/[paymentid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import { verifyAdmin } from "@/lib/verifyAdmin";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ userId: string; paymentId: string }> }
) {
  try {
    await connectDB();
    const { userId, paymentId } = await context.params;

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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