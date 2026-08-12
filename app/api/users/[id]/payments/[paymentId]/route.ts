// app/api/users/[id]/payments/[paymentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// DELETE - remove a payment
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const { id, paymentId } = await context.params;
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    if (decoded.userId !== id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const payment = user.payments.id(paymentId);
    if (!payment) return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });

    // Only allow deleting pending payments
    if (payment.status === "approved") {
      return NextResponse.json({ success: false, message: "Cannot delete an approved investment!" }, { status: 400 });
    }

    user.payments.pull({ _id: paymentId });
    await user.save();

    return NextResponse.json({ success: true, message: "Payment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json({ success: false, message: "Error deleting payment" }, { status: 500 });
  }
}