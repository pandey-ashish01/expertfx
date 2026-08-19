// app/api/tree/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import Distribution from "@/lib/models/Distribution";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

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

/**
 * Builds a map of userId -> total real income earned from all past
 * profit distributions. This replaces the old formula-based
 * calcInterestEarned() which fabricated numbers from time elapsed.
 */
async function buildIncomeMap(): Promise<Map<string, number>> {
  const distributions = await Distribution.find({}).select("entries").lean();
  const map = new Map<string, number>();
  for (const dist of distributions as any[]) {
    for (const entry of dist.entries || []) {
      const uid = entry.userId?.toString();
      if (!uid) continue;
      map.set(uid, (map.get(uid) || 0) + (entry.income || 0));
    }
  }
  return map;
}

async function buildTreeFromParentId(
  rootId: string,
  allUsers: any[],
  incomeMap: Map<string, number>,
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
    // ⭐ REAL data from Distribution records — not a formula
    totalInterestEarned: incomeMap.get(user._id.toString()) || 0,
  };

  const childUsers = allUsers.filter(
    (u) => u.parentId && u.parentId.toString() === user._id.toString()
  );

  const children = (
    await Promise.all(
      childUsers.map((child) =>
        buildTreeFromParentId(
          child._id.toString(),
          allUsers,
          incomeMap,
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

    // ⭐ Build real income map from Distribution collection
    const incomeMap = await buildIncomeMap();

    const tree = await buildTreeFromParentId(id, allUsers, incomeMap);

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