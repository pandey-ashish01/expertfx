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

    // Wallet fields
    walletNetwork: { type: String, default: "" }, // e.g., "USDT-BEP20"
    walletAddress: { type: String, default: "" },

    // MT5 fields
    mt5Email: { type: String, default: "", trim: true, lowercase: true },
    mt5Account: { type: String, default: "" },

    // NEW: running wallet balance, credited by profit distribution
    walletBalance: { type: Number, default: 0 },

    pan: { type: String, default: "" },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    payments: [PaymentSchema],
    maxInvestmentMonths: { type: Number, default: 25 },
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