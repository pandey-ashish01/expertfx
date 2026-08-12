// app/api/users/referrer/[userCode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/config/db";
import User from "@/lib/models/User";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userCode: string }> }
) {
  try {
    await connectDB();
    const { userCode } = await context.params;

    const user = (await User.findOne({ userCode: userCode.toUpperCase() })
      .select("name userCode")
      .lean()) as { name: string; userCode: string } | null;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Referrer not found!" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        userCode: user.userCode,
      },
    });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong!" },
      { status: 500 }
    );
  }
}