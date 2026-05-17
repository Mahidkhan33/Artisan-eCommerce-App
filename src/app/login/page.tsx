"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

export default function UserLogin() {
  const router = useRouter();
  const { setUser, triggerToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Please fill in all fields", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        triggerToast("Welcome back! Login successful.", "success");
        router.push("/");
        router.refresh();
      } else if (res.status === 403 && data.userId) {
        
        triggerToast("Email is unverified. Directing to verification screen...", "warning");
        router.push(`/verify?userId=${data.userId}`);
      } else {
        triggerToast(data.message || "Invalid email or password", "error");
      }
    } catch (error) {
      triggerToast("An error occurred during authentication", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-[#FBFBFA] to-amber-50 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/40 blur-3xl z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Storefront
        </Link>
        
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 text-left">
          Harvest Customer Sign In
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 text-left">
          Log in to manage orders, schedule shipments and checkout organic baskets.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-slate-200/50 shadow-xl rounded-2xl sm:px-10">
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
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-brand-green hover:underline">
                  Forgot Password?
                </Link>
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock size={16} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-medium text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-brand-green hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
