"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ArtisanForgotPassword() {
  const { triggerToast } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      triggerToast("Please enter your email", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/artisans/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSubmitted(true);
        triggerToast("Password reset link sent!", "success");
      } else {
        triggerToast(data.message || "Failed to process request", "error");
      }
    } catch (error) {
      triggerToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-[#FBFBFA] to-purple-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-3xl z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/artisan/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Artisan Login
        </Link>
        
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 text-left">
          Artisan Password Reset
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 text-left">
          Enter your email address to reset your artisan account password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-slate-200/50 shadow-xl rounded-2xl sm:px-10">
          {!submitted ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artisan@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <div className="absolute left-3.5 top-3.5 text-slate-400">
                    <Mail size={16} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-semibold shadow-md shadow-indigo-500/10 transition-colors focus:outline-none cursor-pointer"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Check your email</h3>
              <p className="text-sm text-slate-600 mb-6">
                We've sent a password reset link to <span className="font-semibold text-indigo-600">{email}</span>.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
