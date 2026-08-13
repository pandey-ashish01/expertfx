import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const DEFAULT_MAX_MONTHS = 24;

// ─── यहाँ प्रीफिक्स EFX है ──────────────────────────────────────────────
async function generateUserCode(): Promise<string> {
  const PREFIX = "EFX";
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    const lastUser = await User.findOne(
      { userCode: new RegExp(`^${PREFIX}\\d+$`) },
      { userCode: 1 }
    ).sort({ userCode: -1 });

    let nextNum = 1;
    if (lastUser?.userCode) {
      const lastNum = parseInt(lastUser.userCode.replace(PREFIX, ""), 10);
      nextNum = lastNum + 1;
    }

    code = `${PREFIX}${String(nextNum).padStart(3, "0")}`;
    const existing = await User.findOne({ userCode: code });
    if (!existing) isUnique = true;
  }

  return code;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ referralToken: string }> }
) {
  try {
    await connectDB();
    const { referralToken } = await context.params;

    const parentUser = await User.findOne({ userCode: referralToken });
    if (!parentUser) {
      return NextResponse.json(
        { success: false, message: "Invalid referral link! Referrer not found." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, mobile, email, pan, password, confirmPassword } = body;

    const cleanMobile = String(mobile || "").replace(/\D/g, "").replace(/^0+/, "");
    const cleanEmail = String(email || "").trim();

    // ─── Validations ─────────────────────────────────────────────────────────

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required!" },
        { status: 400 }
      );
    }

    if (!cleanMobile && !cleanEmail) {
      return NextResponse.json(
        { success: false, message: "Either mobile number or email is required!" },
        { status: 400 }
      );
    }

    if (cleanMobile && !/^\d{10}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit mobile number required!" },
        { status: 400 }
      );
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format!" },
        { status: 400 }
      );
    }

    if (password && password.trim()) {
      if (password !== confirmPassword) {
        return NextResponse.json(
          { success: false, message: "Passwords do not match!" },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters!" },
          { status: 400 }
        );
      }
    }

    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid PAN format! Example: ABCDE1234F" },
        { status: 400 }
      );
    }

    // ─── Duplicate checks ─────────────────────────────────────────────────────

    if (cleanMobile) {
      const mobileCount = await User.countDocuments({ mobile: cleanMobile });
      if (mobileCount >= 3) {
        return NextResponse.json(
          { success: false, message: "This mobile number has already been used 3 times!" },
          { status: 400 }
        );
      }
    }

    if (cleanEmail) {
      const emailCount = await User.countDocuments({ email: cleanEmail.toLowerCase() });
      if (emailCount >= 3) {
        return NextResponse.json(
          { success: false, message: "This email has already been used 3 times!" },
          { status: 400 }
        );
      }
    }

    if (pan) {
      const panCount = await User.countDocuments({ pan: pan.toUpperCase() });
      if (panCount >= 3) {
        return NextResponse.json(
          { success: false, message: "This PAN has already been used 3 times!" },
          { status: 400 }
        );
      }
    }

    // ─── Password — default "123456" if not provided ──────────────────────────

    const finalPassword =
      password && password.trim() ? password.trim() : "123456";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    // ─── Create user ──────────────────────────────────────────────────────────

    const userCode = await generateUserCode();

    const newUser = await User.create({
      name: name.trim(),
      mobile: cleanMobile || "",
      email: cleanEmail ? cleanEmail.toLowerCase() : "",
      pan: pan ? pan.toUpperCase() : "",
      password: hashedPassword,
      userCode,
      referralToken: userCode,
      parentId: parentUser._id,
      maxInvestmentMonths: DEFAULT_MAX_MONTHS,
      payments: [],
      children: [],
      createdAt: new Date(),
    });

    await User.findByIdAndUpdate(
      parentUser._id,
      { $push: { children: newUser._id } }
    );

    const usedDefault = !password || !password.trim();

    return NextResponse.json({
      success: true,
      message: `Registration successful! Your User ID is ${userCode}.${
        usedDefault
          ? " Default password is 123456 — please change it after login."
          : ""
      }`,
      data: {
        _id: newUser._id,
        name: newUser.name,
        userCode: newUser.userCode,
        mobile: newUser.mobile,
        email: newUser.email,
        usedDefaultPassword: usedDefault,
      },
    });
  } catch (error: any) {
    console.error("Error while registering user:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return NextResponse.json(
        { success: false, message: `${field} already exists!` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}