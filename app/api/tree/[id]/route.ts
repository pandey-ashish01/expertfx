// app/api/tree/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const MONTHLY_RATE = 0.08;
const DAYS_PER_MONTH = 30;
const DEFAULT_MAX_MONTHS = 24;

async function verifyToken(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

interface PaymentSummary {
  totalInvested: number;
  approvedCount: number;
  pendingCount: number;
  totalInterestEarned: number;
}

interface UserNode {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  userCode?: string;
  referralToken: string;
  parentId: string | null;
  children: UserNode[];
  level: number;
  paymentSummary: PaymentSummary;
}

function calcInterestEarned(payments: any[]): number {
  const approved = payments.filter((p: any) => p.status === "approved");
  return approved.reduce((sum: number, p: any) => {
    const approvedAt = new Date(p.updatedAt || p.createdAt).getTime();
    const now = Date.now();
    const daysElapsed = Math.max(
      0,
      Math.floor((now - approvedAt) / (1000 * 60 * 60 * 24))
    );
    const dailyInterest = (p.amount * MONTHLY_RATE) / DAYS_PER_MONTH;
    const maxMonths = p.maxMonths || DEFAULT_MAX_MONTHS;
    const maxInterest = p.amount * MONTHLY_RATE * maxMonths;
    return sum + Math.min(daysElapsed * dailyInterest, maxInterest);
  }, 0);
}

async function buildTreeFromParentId(
  rootId: string,
  allUsers: any[],
  currentDepth: number = 0,
  maxDepth: number = 20
): Promise<UserNode | null> {
  if (currentDepth >= maxDepth) return null;

  const user = allUsers.find((u) => u._id.toString() === rootId.toString());
  if (!user) return null;

  const payments = user.payments || [];
  const approvedPayments = payments.filter((p: any) => p.status === "approved");
  const pendingPayments = payments.filter((p: any) => p.status === "pending");

  const paymentSummary: PaymentSummary = {
    totalInvested: approvedPayments.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    ),
    approvedCount: approvedPayments.length,
    pendingCount: pendingPayments.length,
    totalInterestEarned: calcInterestEarned(payments),
  };

  // Find children by parentId
  const childUsers = allUsers.filter(
    (u) => u.parentId && u.parentId.toString() === user._id.toString()
  );

  const children = (
    await Promise.all(
      childUsers.map((child) =>
        buildTreeFromParentId(
          child._id.toString(),
          allUsers,
          currentDepth + 1,
          maxDepth
        )
      )
    )
  ).filter((c): c is UserNode => c !== null);

  return {
    _id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || "",
    userCode: user.userCode || "",
    referralToken: user.referralToken || "",
    parentId: user.parentId ? user.parentId.toString() : null,
    children,
    level: currentDepth,
    paymentSummary,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const SUPER_ADMIN_CODE = "ZENO000";

    const requestingUser = await User.findById(decoded.userId)
      .select("userCode")
      .lean() as any;
    const isAdmin = requestingUser?.userCode === SUPER_ADMIN_CODE;

    if (!isAdmin && decoded.userId !== id) {
      return NextResponse.json(
        { success: false, message: "You can only view your own hierarchy" },
        { status: 403 }
      );
    }

    // Fetch ALL users in one query
    const allUsers = await User.find({})
      .select("name mobile email userCode referralToken parentId children payments maxInvestmentMonths")
      .lean();

    const tree = await buildTreeFromParentId(id, allUsers);

    if (!tree) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error("Error fetching user tree:", error);
    return NextResponse.json(
      { success: false, message: "Error building user tree" },
      { status: 500 }
    );
  }
}