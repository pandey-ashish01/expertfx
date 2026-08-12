// app/api/admin/reconcile/route.ts
// ─── Run this ONCE to fix children[] arrays for all existing users ────────────
// Call: POST /api/admin/reconcile  (with admin token)
// After running, tree will show all 26 users correctly.

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const SUPER_ADMIN_CODE = "ZENO000";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Auth check — only super admin can run this
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, message: "No token" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const adminUser = await User.findById(decoded.userId).select("userCode").lean() as any;
    if (!adminUser || adminUser.userCode !== SUPER_ADMIN_CODE) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Fetch all users
    const allUsers = await User.find({}).select("_id parentId userCode").lean() as any[];

    // Reset all children arrays
    await User.updateMany({}, { $set: { children: [] } });

    // Rebuild from parentId
    let fixed = 0;
    const errors: string[] = [];

    for (const user of allUsers) {
      if (user.parentId) {
        try {
          await User.findByIdAndUpdate(user.parentId, {
            $addToSet: { children: user._id },
          });
          fixed++;
        } catch (e) {
          errors.push(`${user.userCode}: ${e}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reconciliation complete. ${fixed} users linked to parents.`,
      data: {
        totalUsers: allUsers.length,
        usersWithParent: fixed,
        rootUsers: allUsers.length - fixed,
        errors,
      },
    });
  } catch (error) {
    console.error("Reconcile error:", error);
    return NextResponse.json(
      { success: false, message: "Reconciliation failed" },
      { status: 500 }
    );
  }
}