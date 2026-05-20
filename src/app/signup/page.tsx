"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from "lucide-react";

export default function UserSignup() {
  const router = useRouter();
  const { triggerToast } = useApp();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) {
      triggerToast("Please fill in all fields", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: { firstName, lastName },
          email,
          phoneNumber: phone,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerToast("Account registered successfully! An OTP has been sent to your email.", "success");
        router.push(`/verify?userId=${data.user._id}`);
      } else {
        triggerToast(data.message || "Failed to register user", "error");
      }
    } catch (error) {
      triggerToast("An error occurred during account registration", "error");
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
          Artisan Alley Customer Sign Up
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 text-left">
          Create a customer account to start ordering handcrafted bespoke goods.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 border border-slate-200/50 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ali"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Khan"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
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
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Phone size={16} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3 mt-2 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
            >
              {loading ? "Creating account..." : "Sign Up"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-green hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
