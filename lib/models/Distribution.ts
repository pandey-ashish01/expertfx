import mongoose, { Schema, models, model } from "mongoose";

const distributionEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    // level-income entries ke liye "level", salary/leadership ke liye "pool"
    // — isse level:0 ka ambiguity clash nahi hota kisi future level-based query se
    levelType: {
      type: String,
      enum: ["level", "pool"],
      default: "level",
      required: true,
    },
    personalInvestment: { type: Number, required: true },
    downlineInvestment: { type: Number, required: true },
    branchInvestment: { type: Number, required: true },
    ratio: { type: Number, required: true },
    income: { type: Number, required: true, min: 0 },
    incomeType: {
      type: String,
      enum: ["level", "salary", "leadership"],
      default: "level",
      required: true,
    },
  },
  { _id: false }
);

const distributionSchema = new Schema(
  {
    totalTradingProfit: { type: Number, required: true },
    compensationPool: { type: Number, required: true },
    levelIncomePool: { type: Number, required: true },
    salaryPool: { type: Number, required: true },
    leadershipPool: { type: Number, required: true },
    unallocatedSalaryAmount: { type: Number, default: 0 },
    unallocatedLeadershipAmount: { type: Number, default: 0 },
    entries: [distributionEntrySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Distribution || model("Distribution", distributionSchema);