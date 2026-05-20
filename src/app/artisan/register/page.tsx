"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, User, Phone, Briefcase, Landmark, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export default function ArtisanRegister() {
  const router = useRouter();
  const { triggerToast } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [studioName, setStudioName] = useState("");
  const [studioLocation, setStudioLocation] = useState("");
  const [studioDescription, setStudioDescription] = useState("");
  const [cnic, setCnic] = useState("");

  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !studioName ||
      !studioLocation ||
      !cnic ||
      !accountHolderName ||
      !bankAccountNumber
    ) {
      triggerToast("Please fill in all required fields", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/artisans/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: { firstName, lastName },
          email,
          phoneNumber,
          password,
          studioName,
          studioLocation,
          studioDescription,
          cnic,
          accountHolderName,
          bankAccountNumber,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        triggerToast("Artisan account registered successfully! An OTP has been dispatched to your email.", "success");
        router.push(`/artisan/verify?artisanId=${data.artisan._id}`);
      } else {
        triggerToast(data.message || "Failed to register artisan account", "error");
      }
    } catch (error) {
      triggerToast("An error occurred during partner registration", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-[#FBFBFA] to-amber-50 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-100/40 blur-3xl z-0" />

      <div className="mx-auto w-full max-w-2xl relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Storefront
        </Link>
        
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-800 text-left">
          Artisan Partner Registration
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 text-left">
          Join ArtisanAlley to sell bespoke creations directly to collectors, unlock analytics and manage studio sales.
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-2xl relative z-10">
        <div className="bg-white/80 backdrop-blur-md py-8 px-6 border border-slate-200/50 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {}
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <User size={16} className="text-brand-green" />
                1. Artisan Coordinates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Muhammad"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ahmed"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="artisan@artisanalley.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                    <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="03001234567"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                    <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Account Password *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 pt-2">
                <Briefcase size={16} className="text-brand-green" />
                2. Workshop Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Workshop / Studio Name *</label>
                  <input
                    type="text"
                    required
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    placeholder="TerraGlaze Ceramic Studio"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">CNIC Number (13 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value.replace(/[^\d-]/g, ""))}
                    placeholder="34101-1234567-1"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Studio Location (City/District) *</label>
                  <input
                    type="text"
                    required
                    value={studioLocation}
                    onChange={(e) => setStudioLocation(e.target.value)}
                    placeholder="Sargodha Road, Faisalabad, Punjab"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Studio Description</label>
                  <textarea
                    rows={2}
                    value={studioDescription}
                    onChange={(e) => setStudioDescription(e.target.value)}
                    placeholder="Tell buyers about your clay glazes, tanned leather, timber logs, weaving looms..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {}
            <div>
              <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 pt-2">
                <Landmark size={16} className="text-brand-green" />
                3. Financial Transfer Setup
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Bank Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Muhammad Ahmed"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">IBAN / Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="PK99ALPH01012345678901"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
            >
              {loading ? "Registering partner details..." : "Complete Registration"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs font-medium text-slate-500">
            Already have a partner account?{" "}
            <Link href="/artisan/login" className="font-semibold text-brand-green hover:underline">
              Access Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
