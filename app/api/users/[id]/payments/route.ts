
///api/users/[id]/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * ⭐ This function ONLY computes time-based progress info
 * (days elapsed, maturity date, matured flag). It does NOT
 * calculate or fabricate any dollar interest amount anymore.
 * Real earnings come exclusively from the Distribution collection
 * via user.walletBalance, credited by /api/admin/distribute-profit.
 */
function calculateProgress(investmentDate: Date, maxMonths: number) {
  const now = new Date();
  const maxDays = maxMonths * 30;
  const msElapsed = now.getTime() - investmentDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));
  const cappedDays = Math.min(daysElapsed, maxDays);
  const maturityDate = new Date(investmentDate);
  maturityDate.setDate(maturityDate.getDate() + maxDays);

  return {
    daysElapsed: cappedDays,
    isMatured: daysElapsed >= maxDays,
    maturityDate,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    // ⭐ walletBalance fetched — this IS the real earned amount
    const user = await User.findById(id).select("payments walletBalance");
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const sortedPayments = [...user.payments]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((payment: any) => {
        if (payment.status === "approved") {
          const maxMonths = payment.maxMonths ?? 25;
          // ⭐ Only progress/timeline data — no dollar amounts
          const progress = calculateProgress(new Date(payment.createdAt), maxMonths);
          return { ...payment.toObject(), investmentCalc: progress };
        }
        return { ...payment.toObject(), investmentCalc: null };
      });

    const approvedPayments = sortedPayments.filter((p: any) => p.status === "approved");
    const totalInvested = approvedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    // ⭐ REAL interest earned = walletBalance credited by admin distributions
    const totalInterestEarned = parseFloat((user.walletBalance || 0).toFixed(4));

    return NextResponse.json({
      success: true,
      data: sortedPayments,
      portfolio: {
        totalInvested: parseFloat(totalInvested.toFixed(4)),
        totalInterestEarned,
        totalValue: parseFloat((totalInvested + totalInterestEarned).toFixed(4)),
        maxMonths: 25,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ success: false, message: "Error fetching payments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    if (decoded.userId !== id) {
      return NextResponse.json({ success: false, message: "You can only add payments for yourself" }, { status: 403 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const file = formData.get("screenshot") as File;

    let monthlyRate = parseFloat(formData.get("monthlyRate") as string);
    if (isNaN(monthlyRate) || monthlyRate <= 0) monthlyRate = 0.08;

    let maxMonths = parseInt(formData.get("maxMonths") as string);
    if (isNaN(maxMonths) || maxMonths <= 0) maxMonths = 25;

    if (!amount || isNaN(amount)) return NextResponse.json({ success: false, message: "Valid amount is required!" }, { status: 400 });
    if (amount < 50) return NextResponse.json({ success: false, message: "Minimum investment is 50 USDT!" }, { status: 400 });
    if (amount > 5000) return NextResponse.json({ success: false, message: "Maximum investment is 5,000 USDT!" }, { status: 400 });
    if (!file) return NextResponse.json({ success: false, message: "Payment screenshot is required!" }, { status: 400 });

    const fileName = `payments/${randomUUID()}-${file.name}`;
    const blob = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const screenshotUrl = blob.url;

    const newPayment = {
      amount,
      screenshot: screenshotUrl,
      description: description || "",
      status: "pending",
      monthlyRate,
      maxMonths,
      dailyInterestRate: null,
      maxInterest: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.payments.push(newPayment as any);
    await user.save();

    // ⭐ Removed misleading "Daily interest will be X USDT" projection.
    // Real income only appears after an admin profit distribution.
    return NextResponse.json({
      success: true,
      message: "Investment submitted! Pending approval from admin.",
      data: {
        ...newPayment,
        note: "Your investment is now pending approval. Once approved, it will be included in future profit distributions.",
      },
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json({ success: false, message: "Error adding payment" }, { status: 500 });
  }
}