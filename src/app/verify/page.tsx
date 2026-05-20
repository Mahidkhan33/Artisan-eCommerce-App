"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const { triggerToast } = useApp();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      triggerToast("Invalid verification session context", "error");
      return;
    }
    if (otp.length < 6) {
      triggerToast("Verification code must be 6 digits", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/customers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerToast("Account verified successfully! You can now log in.", "success");
        router.push("/login");
      } else {
        triggerToast(data.message || "Failed to verify account", "error");
      }
    } catch (error) {
      triggerToast("An error occurred during verification", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-slate-200/50 shadow-xl rounded-2xl sm:px-10">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-emerald-50 p-4 text-brand-green border border-emerald-100">
          <ShieldCheck size={36} strokeWidth={1.5} />
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="otp" className="block text-center text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Enter 6-Digit OTP Verification Code
          </label>
          <div className="relative">
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] text-lg font-bold py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
            />
            <div className="absolute left-4 top-4 text-slate-400">
              <KeyRound size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center leading-normal mt-2.5">
            Check your mailbox for the secure 6-digit verification code.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
        >
          {loading ? "Verifying..." : "Verify & Activate"}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-medium text-slate-500">
        Having issues?{" "}
        <Link href="/login" className="font-semibold text-brand-green hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function UserVerify() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-[#FBFBFA] to-amber-50 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/40 blur-3xl z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-8">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
          Verify Your Identity
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
          We have sent a verification passcode to your registered email to secure your account.
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Suspense fallback={
          <div className="bg-white/85 p-8 rounded-2xl text-center text-sm font-semibold text-slate-500 animate-pulse">
            Loading verification context...
          </div>
        }>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
