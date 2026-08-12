"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const verifySecretKey = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/verify-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      });

      const data = await res.json();
      if (res.ok && data.userId) {
        toast.success("✅ Secret Key Verified!");
        setTimeout(() => {
          router.push(`/change-password/${data.userId}`);
        }, 1000);
      } else {
        toast.error(data.message || "❌ Invalid Secret Key");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center relative overflow-hidden transition-colors duration-700"
      style={{
        backgroundImage: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
      }}
    >
      <ToastContainer position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/70 dark:bg-slate-950/60 
        border border-sky-200 dark:border-blue-800/40 
        rounded-2xl shadow-2xl p-10 max-w-md w-full text-center 
        backdrop-blur-xl transition-all duration-500"
      >
        <h1
          className="text-3xl font-semibold bg-gradient-to-r 
          from-sky-600 via-blue-500 to-blue-700 
          bg-clip-text text-transparent mb-6"
        >
          Enter Secret Key
        </h1>

        <p className="text-sky-800 dark:text-blue-200 text-sm mb-6">
          Enter your{" "}
          <span className="text-sky-600 font-medium">6-letter secret key</span>{" "}
          to verify your account.
        </p>

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            onChange={(v) => setSecretKey(v.toUpperCase())}
            value={secretKey}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={verifySecretKey}
          disabled={loading || secretKey.length !== 6}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-500 
          hover:from-sky-600 hover:to-blue-600 text-white font-medium py-3 
          rounded-xl shadow-lg transition-all duration-200"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </motion.div>
    </div>
  );
}
