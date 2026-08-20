import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";

const SUPER_ADMIN_CODE = "EFX0000";


function getUserIdFromPayload(decoded: any): string | null {
  return decoded?.id || decoded?._id || decoded?.userId || decoded?.user_id || null;
}

export async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // ✅ अब चाहे Login API ने id, _id, या userId डाला हो, सब काम करेगा
    const userId = getUserIdFromPayload(decoded);
    if (!userId) {
      console.error("❌ verifyAdmin: Token में User ID नहीं मिली", decoded);
      return null;
    }

    const user = await User.findById(userId);
    if (!user || user.userCode !== SUPER_ADMIN_CODE) return null;
    return user;
  } catch (error) {
    console.error("❌ verifyAdmin: Token Verification Failed", error);
    return null;
  }
}

export async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // ✅ यहाँ भी वही Smart Logic
    const userId = getUserIdFromPayload(decoded);
    if (!userId) {
      console.error("❌ verifyUser: Token में User ID नहीं मिली", decoded);
      return null;
    }

    const user = await User.findById(userId);
    return user || null;
  } catch (error) {
    console.error("❌ verifyUser: Token Verification Failed", error);
    return null;
  }
}