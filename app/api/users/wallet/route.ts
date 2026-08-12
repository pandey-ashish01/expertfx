import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import Distribution from "@/lib/models/Distribution";
import { verifyUser } from "@/lib/verifyAdmin";

export async function GET(req: NextRequest) {
  await connectDB();

  const user = await verifyUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const freshUser = await User.findById(user._id).select("walletBalance").lean();

  const distributions = await Distribution.find({
    "entries.userId": user._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const history = distributions.map((d: any) => {
    const myEntry = d.entries.find(
      (e: any) => e.userId.toString() === user._id.toString()
    );
    return {
      distributionId: d._id,
      date: d.createdAt,
      totalTradingProfit: d.totalTradingProfit,
      level: myEntry?.level,
      personalInvestment: myEntry?.personalInvestment,
      downlineInvestment: myEntry?.downlineInvestment,
      branchInvestment: myEntry?.branchInvestment,
      ratio: myEntry?.ratio,
      income: myEntry?.income,
    };
  });

  return NextResponse.json({
    success: true,
    walletBalance: (freshUser as any)?.walletBalance || 0,
    history,
  });
}