import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import { verifyAdmin } from "@/lib/verifyAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const users = await User.find({})
      .select("name mobile userCode payments")
      .lean();

    const allPayments = users.flatMap((user) => {
      const payments = user.payments || [];
      return payments.map((payment: any) => ({
        _id: payment._id,
        amount: payment.amount,
        screenshot: payment.screenshot,
        description: payment.description,
        status: payment.status,
        createdAt: payment.createdAt,
        monthlyRate: payment.monthlyRate,
        maxMonths: payment.maxMonths,
        userName: user.name,
        userCode: user.userCode,
        userMobile: user.mobile,
        userId: user._id,
      }));
    });

    // Sort by newest first
    allPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: allPayments });
  } catch (error) {
    console.error("Error fetching admin payments:", error);
    return NextResponse.json({ success: false, message: "Error fetching payments" }, { status: 500 });
  }
}