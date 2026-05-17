"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CheckCircle2, ShieldCheck, MapPin, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmation() {
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("confirmedOrder");
    if (stored) {
      setOrder(JSON.parse(stored));
      
      sessionStorage.removeItem("confirmedOrder");
      sessionStorage.removeItem("shippingAddress");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-[fadeIn_0.4s_ease-out]">
        <div className="bg-white rounded-3xl border border-slate-200/50 p-8 sm:p-10 shadow-xl max-w-xl w-full text-center relative overflow-hidden">
          
          {}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-50 blur-3xl z-0" />
          
          <div className="relative z-10">
            {}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-emerald-50 p-5 text-brand-green border border-emerald-100 animate-[scaleUp_0.3s_ease-out] shadow-md shadow-emerald-500/5">
                <CheckCircle2 size={44} strokeWidth={2} />
              </div>
            </div>

            <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest block mb-1">
              Order Placed Successfully
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
              Your Creation is Secured!
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mb-8">
              Thank you for supporting independent artistry. We have notified the craftsman, who will pack your custom creations shortly!
            </p>

            {order ? (
              <div className="text-left bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-8 space-y-4">
                
                {}
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase block">Order Code</span>
                    <span className="font-display font-extrabold text-slate-800 text-sm tracking-wide">
                      {order.orderId || `ORD-${order._id?.slice(-6).toUpperCase()}`}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-100 text-[10px] uppercase">
                    {order.paymentMethod === "cash" ? "Cash Pending" : "Paid Securely"}
                  </span>
                </div>

                {}
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Calendar size={15} className="text-brand-green mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Estimated Studio Dispatch</span>
                    <p className="text-slate-500 leading-normal mt-0.5">
                      Expected in <strong>2 to 4 days</strong>. The artisan will assign a secure courier and shipment tracking number shortly.
                    </p>
                  </div>
                </div>

                {}
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <MapPin size={15} className="text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Shipping Location</span>
                    <p className="text-slate-500 leading-normal mt-0.5">
                      House {order.shippingAddress?.houseNo}, {order.shippingAddress?.streetAddress}, {order.shippingAddress?.town}, {order.shippingAddress?.city}
                    </p>
                  </div>
                </div>

                {}
                <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Total Billed amount</span>
                  <span className="font-display font-extrabold text-brand-green text-sm">
                    Rs. {order.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>

              </div>
            ) : (
              <div className="text-left bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-8 text-center text-xs text-slate-500 leading-relaxed">
                We are compiling the order parameters. Rest assured your checkout has completed successfully!
              </div>
            )}

            {}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 text-xs font-semibold shadow-xs transition-colors"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
