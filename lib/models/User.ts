import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  screenshot: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  monthlyRate: { type: Number, required: true, default: 0.08 },
  maxMonths: { type: Number, required: true, default: 25 },
  dailyInterestRate: { type: Number, default: null },
  maxInterest: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      default: "",
      set: function (v: string) {
        if (!v) return "";
        return String(v).replace(/\D/g, "").replace(/^0+/, "");
      },
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^\d{10}$/.test(v);
        },
        message: "Please enter a valid 10-digit mobile number",
      },
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    country: { type: String, default: "" },
    password: { type: String, required: true, select: false },
    userCode: { type: String, default: "", unique: true, sparse: true },
    referralToken: { type: String, default: "" },

    walletNetwork: { type: String, default: "" },
    walletAddress: { type: String, default: "" },
    mt5Email: { type: String, default: "", trim: true, lowercase: true },
    mt5Account: { type: String, default: "" },

    walletBalance: { type: Number, default: 0, min: 0 },
    pan: { type: String, default: "" },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    payments: [PaymentSchema],

    isSalaryEligible: { type: Boolean, default: false },
    isLeadershipEligible: { type: Boolean, default: false },
    leadershipRank: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ mobile: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

UserSchema.pre("validate", function (next) {
  if (!this.mobile && !this.email) {
    return next(new Error("Either mobile number or email is required"));
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);