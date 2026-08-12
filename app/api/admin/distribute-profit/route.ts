import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import Distribution from "@/lib/models/Distribution";
import { verifyAdmin } from "@/lib/verifyAdmin";
import {
  buildTree,
  computeBranchInvestment,
  groupByLevel,
} from "@/lib/calculateBranchInvestment";

const LEVEL_PERCENTAGES = [0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.005];
const COMPENSATION_PERCENT = 0.30;
const LEVEL_INCOME_PERCENT = 0.50;
const SALARY_PERCENT = 0.25;
const LEADERSHIP_PERCENT = 0.25;

export async function POST(req: NextRequest) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const totalTradingProfit = Number(body.totalTradingProfit);
  if (!totalTradingProfit || totalTradingProfit <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid profit amount" },
      { status: 400 }
    );
  }

  // 1. Sab users lao
  const allUsers = await User.find({}).lean();
  if (!allUsers.length) {
    return NextResponse.json({ success: false, message: "No users found" }, { status: 400 });
  }

  // 2. Tree banao aur RECURSIVE branch investment calculate karo
  const { roots } = buildTree(allUsers as any);
  roots.forEach((root) => computeBranchInvestment(root));

  // 3. Pools nikaalo
  const compensationPool = totalTradingProfit * COMPENSATION_PERCENT;
  const levelIncomePool = compensationPool * LEVEL_INCOME_PERCENT;
  const salaryPool = compensationPool * SALARY_PERCENT;
  const leadershipPool = compensationPool * LEADERSHIP_PERCENT;

  // 4. Level-wise ratio-based distribution
  const levels = groupByLevel(roots);
  const entries: any[] = [];

  for (const levelStr in levels) {
    const level = parseInt(levelStr, 10);
    const percent = LEVEL_PERCENTAGES[level - 1] || 0;
    const levelPool = levelIncomePool * percent;
    if (levelPool === 0) continue;

    const nodes = levels[level];
    const totalBranch = nodes.reduce((sum, n) => sum + n.branchInvestment, 0);
    if (totalBranch === 0) continue;

    for (const node of nodes) {
      const ratio = node.branchInvestment / totalBranch;
      const income = levelPool * ratio;

      entries.push({
        userId: node._id,
        level,
        personalInvestment: node.personalInvestment,
        downlineInvestment: node.downlineInvestment,
        branchInvestment: node.branchInvestment,
        ratio,
        income,
      });
    }
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { success: false, message: "No eligible investments found to distribute" },
      { status: 400 }
    );
  }

  // ==================================================
  // ✅ 🔥 TRANSACTIONS HATAAO – Direct Updates
  // ==================================================

  try {
    // 🥇 STEP A: Pehle sab users ke Wallet Balance Update karo
    const bulkOps = entries.map((e) => ({
      updateOne: {
        filter: { _id: e.userId },
        update: { $inc: { walletBalance: e.income } },
      },
    }));

    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps);
      console.log(`✅ ${result.modifiedCount} users' wallets updated.`);
    }

    // 🥈 STEP B: Ab Distribution History (Record) Save karo
    await Distribution.create({
      totalTradingProfit,
      compensationPool,
      levelIncomePool,
      salaryPool,
      leadershipPool,
      entries,
      createdBy: admin._id,
    });

    // ✅ Success Response
    return NextResponse.json({
      success: true,
      message: "Profit distributed successfully",
      entriesCount: entries.length,
      compensationPool,
      levelIncomePool,
      salaryPool,
      leadershipPool,
    });
  } catch (error) {
    console.error("❌ Distribution Error:", error);
    return NextResponse.json(
      { success: false, message: "Distribution failed. Check server logs." },
      { status: 500 }
    );
  }
}