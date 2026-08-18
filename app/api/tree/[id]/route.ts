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

async function buildUserTree(userId: string) {
  const user = await User.findById(userId)
    .populate({
      path: "children",
      populate: {
        path: "children",
        populate: {
          path: "children",
          populate: {
            path: "children",
            populate: {
              path: "children",
            },
          },
        },
      },
    })
    .lean();

  if (!user) return null;

  // Recursive function to compute payment summary
  function enrichNode(node: any, level: number): any {
    const payments = node.payments || [];
    const approved = payments.filter((p: any) => p.status === "approved");
    const totalInvested = approved.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalInterest = approved.reduce((sum: number, p: any) => {
      const rate = p.monthlyRate ?? 0.08;
      const days = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const daily = (p.amount * rate) / 30;
      return sum + daily * Math.min(days, (p.maxMonths ?? 25) * 30);
    }, 0);

    const children = (node.children || []).map((c: any) => enrichNode(c, level + 1));

    return {
      _id: node._id,
      name: node.name,
      mobile: node.mobile,
      email: node.email,
      userCode: node.userCode,
      parentId: node.parentId,
      level,
      createdAt: node.createdAt,
      payments: payments.map((p: any) => ({
        _id: p._id,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
        monthlyRate: p.monthlyRate,
        maxMonths: p.maxMonths,
      })),
      paymentSummary: {
        totalInvested,
        approvedCount: approved.length,
        pendingCount: payments.filter((p: any) => p.status === "pending").length,
        totalInterestEarned: totalInterest,
      },
      children,
    };
  }

  return enrichNode(user, 0);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    // Allow self or admin
    if (decoded.userId !== userId) {
      const user = await User.findById(decoded.userId).select("userCode");
      if (!user || user.userCode !== "EXPERT000") {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
      }
    }

    const tree = await buildUserTree(userId);
    if (!tree) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error("Error fetching tree:", error);
    return NextResponse.json({ success: false, message: "Error fetching tree" }, { status: 500 });
  }
}