import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import Distribution from "@/lib/models/Distribution";
import { verifyAdmin } from "@/lib/verifyAdmin";
import {
  buildTree,
  computeBranchInvestment,
  groupByLevelForRoot,
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
  if (!totalTradingProfit || totalTradingProfit <= 0 || !Number.isFinite(totalTradingProfit)) {
    return NextResponse.json(
      { success: false, message: "Invalid profit amount" },
      { status: 400 }
    );
  }

  const allUsers = await User.find({}).lean();
  if (!allUsers.length) {
    return NextResponse.json({ success: false, message: "No users found" }, { status: 400 });
  }

  const { roots } = buildTree(allUsers as any);

  // ── Single-root guard ──────────────────────────────────────────────
  if (roots.length !== 1) {
    console.error(
      `❌ Distribution blocked: expected exactly 1 root user, found ${roots.length}.`,
      roots.map((r) => r._id.toString())
    );
    return NextResponse.json(
      {
        success: false,
        message: `Distribution blocked: expected exactly 1 root user (no parentId), but found ${roots.length}. Fix orphan user(s) before distributing.`,
        rootUserIds: roots.map((r) => r._id.toString()),
      },
      { status: 400 }
    );
  }

  roots.forEach((root) => computeBranchInvestment(root));

  const compensationPool = totalTradingProfit * COMPENSATION_PERCENT;
  const levelIncomePool = compensationPool * LEVEL_INCOME_PERCENT;
  const salaryPool = compensationPool * SALARY_PERCENT;
  const leadershipPool = compensationPool * LEADERSHIP_PERCENT;

  const entries: any[] = [];

  // ── Level Income — per-root, no cross-tree contamination ──
  for (const root of roots) {
    const levelsForThisRoot = groupByLevelForRoot(root);

    for (const levelStr in levelsForThisRoot) {
      const level = parseInt(levelStr, 10);
      const percent = LEVEL_PERCENTAGES[level - 1] || 0;
      const levelPool = levelIncomePool * percent;
      if (levelPool <= 0) continue;

      const nodes = levelsForThisRoot[level];
      const totalBranch = nodes.reduce((sum, n) => sum + n.branchInvestment, 0);
      if (!totalBranch || !Number.isFinite(totalBranch) || totalBranch <= 0) continue;

      for (const node of nodes) {
        if (node.branchInvestment <= 0) continue;
        const ratio = node.branchInvestment / totalBranch;
        const income = levelPool * ratio;
        if (!Number.isFinite(income) || income <= 0) continue;

        entries.push({
          userId: node._id,
          level,
          levelType: "level",
          personalInvestment: node.personalInvestment,
          downlineInvestment: node.downlineInvestment,
          branchInvestment: node.branchInvestment,
          ratio,
          income,
          incomeType: "level",
        });
      }
    }
  }

  // ── Salary Pool — eligible users ke beech equal split ──
  const salaryEligibleUsers = allUsers.filter((u: any) => u.isSalaryEligible === true);
  let unallocatedSalaryAmount = 0;

  if (salaryEligibleUsers.length > 0 && salaryPool > 0) {
    const perUserSalary = salaryPool / salaryEligibleUsers.length;
    if (Number.isFinite(perUserSalary) && perUserSalary > 0) {
      for (const u of salaryEligibleUsers) {
        entries.push({
          userId: u._id,
          level: 0,
          levelType: "pool",
          personalInvestment: 0,
          downlineInvestment: 0,
          branchInvestment: 0,
          ratio: 1 / salaryEligibleUsers.length,
          income: perUserSalary,
          incomeType: "salary",
        });
      }
    } else {
      unallocatedSalaryAmount = salaryPool;
    }
  } else {
    unallocatedSalaryAmount = salaryPool;
  }

  // ── Leadership Pool — rank-weighted ──
  const leadershipEligibleUsers = allUsers.filter(
    (u: any) => u.isLeadershipEligible === true && (u.leadershipRank || 0) > 0
  );
  let unallocatedLeadershipAmount = 0;

  if (leadershipEligibleUsers.length > 0 && leadershipPool > 0) {
    const totalRankWeight = leadershipEligibleUsers.reduce(
      (sum: number, u: any) => sum + (u.leadershipRank || 0),
      0
    );
    if (totalRankWeight > 0) {
      for (const u of leadershipEligibleUsers) {
        const weight = (u as any).leadershipRank / totalRankWeight;
        const income = leadershipPool * weight;
        if (!Number.isFinite(income) || income <= 0) continue;
        entries.push({
          userId: u._id,
          level: 0,
          levelType: "pool",
          personalInvestment: 0,
          downlineInvestment: 0,
          branchInvestment: 0,
          ratio: weight,
          income,
          incomeType: "leadership",
        });
      }
    } else {
      unallocatedLeadershipAmount = leadershipPool;
    }
  } else {
    unallocatedLeadershipAmount = leadershipPool;
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { success: false, message: "No eligible investments found to distribute" },
      { status: 400 }
    );
  }

  // ⭐ PRODUCTION: transaction restored. Requires a replica-set MongoDB
  // (MongoDB Atlas provides this by default). Do NOT deploy this against
  // a standalone mongod — bulkWrite() with a session will throw
  // "Transaction numbers are only allowed on a replica set member or
  // mongos" exactly like it did locally.
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const bulkOps = entries
      .filter((e) => e.income > 0 && Number.isFinite(e.income))
      .map((e) => ({
        updateOne: {
          filter: { _id: e.userId },
          update: { $inc: { walletBalance: e.income } },
        },
      }));

    let modifiedCount = 0;
    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps, { session });
      modifiedCount = result.modifiedCount;
    }

    const [distributionDoc] = await Distribution.create(
      [
        {
          totalTradingProfit,
          compensationPool,
          levelIncomePool,
          salaryPool,
          leadershipPool,
          unallocatedSalaryAmount,
          unallocatedLeadershipAmount,
          entries,
          createdBy: admin._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log(`✅ ${modifiedCount} users' wallets updated. Distribution ID: ${distributionDoc._id}`);

    return NextResponse.json({
      success: true,
      message: "Profit distributed successfully",
      entriesCount: entries.length,
      distributionId: distributionDoc._id,
      compensationPool,
      levelIncomePool,
      salaryPool,
      leadershipPool,
      unallocatedSalaryAmount,
      unallocatedLeadershipAmount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Distribution Error (rolled back):", error);
    return NextResponse.json(
      { success: false, message: "Distribution failed and was rolled back. Check server logs." },
      { status: 500 }
    );
  }
}