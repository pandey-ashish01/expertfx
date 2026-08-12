import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/lib/models/Distribution";
import { verifyAdmin } from "@/lib/verifyAdmin";
import { connectDB } from "@/lib/config/db";

export async function GET(req: NextRequest) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const distributions = await Distribution.find({})
    .sort({ createdAt: -1 })
    .populate("entries.userId", "name userCode mobile")
    .limit(20)
    .lean();

  return NextResponse.json({ success: true, data: distributions });
}