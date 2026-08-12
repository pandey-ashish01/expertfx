// api/users/[id]/payments/route.ts

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

const MONTHLY_INTEREST_RATE = 0.08;
const DAYS_PER_MONTH = 30;
const DEFAULT_MAX_MONTHS = 25;
const REFERRED_MAX_MONTHS = 35;

function calculateDailyInterest(amount: number): number {
  return (amount * MONTHLY_INTEREST_RATE) / DAYS_PER_MONTH;
}

function calculateInterestEarned(amount: number, investmentDate: Date, maxMonths: number) {
  const now = new Date();
  const maxDays = maxMonths * DAYS_PER_MONTH;
  const msElapsed = now.getTime() - investmentDate.getTime();
  const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
  const cappedDays = Math.min(daysElapsed, maxDays);
  const dailyInterest = calculateDailyInterest(amount);
  const totalInterest = dailyInterest * cappedDays;
  const maxInterest = amount * MONTHLY_INTEREST_RATE * maxMonths;
  const maturityDate = new Date(investmentDate);
  maturityDate.setDate(maturityDate.getDate() + maxDays);

  return {
    daysElapsed: cappedDays,
    dailyInterest: parseFloat(dailyInterest.toFixed(4)),
    totalInterest: parseFloat(totalInterest.toFixed(4)),
    maxInterest: parseFloat(maxInterest.toFixed(4)),
    isMatured: daysElapsed >= maxDays,
    maturityDate,
  };
}

// GET - all payments with investment calculations
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

    const user = await User.findById(id).select("payments maxInvestmentMonths parentId");
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const maxMonths = user.maxInvestmentMonths || (user.parentId ? REFERRED_MAX_MONTHS : DEFAULT_MAX_MONTHS);

    const sortedPayments = [...user.payments]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((payment: any) => {
        if (payment.status === "approved") {
          const calc = calculateInterestEarned(payment.amount, new Date(payment.createdAt), maxMonths);
          return { ...payment.toObject(), investmentCalc: calc };
        }
        return { ...payment.toObject(), investmentCalc: null };
      });

    const approvedPayments = sortedPayments.filter((p: any) => p.status === "approved");
    const totalInvested = approvedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalInterestEarned = approvedPayments.reduce((sum: number, p: any) => sum + (p.investmentCalc?.totalInterest || 0), 0);

    return NextResponse.json({
      success: true,
      data: sortedPayments,
      portfolio: {
        totalInvested: parseFloat(totalInvested.toFixed(4)),
        totalInterestEarned: parseFloat(totalInterestEarned.toFixed(4)),
        totalValue: parseFloat((totalInvested + totalInterestEarned).toFixed(4)),
        maxMonths,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ success: false, message: "Error fetching payments" }, { status: 500 });
  }
}

// POST - add new investment
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

    if (!amount || isNaN(amount)) return NextResponse.json({ success: false, message: "Valid amount is required!" }, { status: 400 });
    if (amount < 50) return NextResponse.json({ success: false, message: "Minimum investment is 50 USDT!" }, { status: 400 });
    if (amount > 5000) return NextResponse.json({ success: false, message: "Maximum investment is 5,000 USDT!" }, { status: 400 });
    if (!file) return NextResponse.json({ success: false, message: "Payment screenshot is required!" }, { status: 400 });

    // Upload to Vercel Blob
    const fileName = `payments/${randomUUID()}-${file.name}`;
    const blob = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const screenshotUrl = blob.url;

    const maxMonths = user.maxInvestmentMonths || (user.parentId ? REFERRED_MAX_MONTHS : DEFAULT_MAX_MONTHS);
    const dailyInterest = calculateDailyInterest(amount);
    const maxInterest = amount * MONTHLY_INTEREST_RATE * maxMonths;

    const newPayment = {
      amount,
      screenshot: screenshotUrl,
      description: description || "",
      status: "pending",
      dailyInterest: parseFloat(dailyInterest.toFixed(4)),
      maxInterest: parseFloat(maxInterest.toFixed(4)),
      maxMonths,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.payments.push(newPayment as any);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Investment submitted! Pending approval from admin.",
      data: {
        ...newPayment,
        note: `Daily interest will be ${dailyInterest.toFixed(4)} USDT once approved. Max return: ${maxInterest.toFixed(2)} USDT in ${maxMonths} months.`,
      },
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json({ success: false, message: "Error adding payment" }, { status: 500 });
  }
}