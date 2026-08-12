import mongoose, { Schema, models, model } from "mongoose";

const distributionEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    personalInvestment: { type: Number, required: true },
    downlineInvestment: { type: Number, required: true },
    branchInvestment: { type: Number, required: true },
    ratio: { type: Number, required: true },
    income: { type: Number, required: true },
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
    entries: [distributionEntrySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Distribution || model("Distribution", distributionSchema);