"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { MapPin, ShoppingBag, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cartItems, cartTotals, triggerToast } = useApp();

  const [streetAddress, setStreetAddress] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("Faisalabad");
  const [country, setCountry] = useState("Pakistan");
  const [postalCode, setPostalCode] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      triggerToast("Please log in as a customer to access checkout", "warning");
      router.push("/login");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!streetAddress || !houseNo || !town || !city || !country || !postalCode) {
      triggerToast("Please fill in all shipping fields", "warning");
      return;
    }

    const address = {
      streetAddress,
      houseNo,
      town,
      city,
      country,
      postalCode,
    };

    sessionStorage.setItem("shippingAddress", JSON.stringify(address));
    router.push("/payment");
  };

  if (!user || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="rounded-full bg-slate-100 p-6 text-slate-400 mb-4 animate-pulse">
            <ShoppingBag size={48} />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Your basket is empty</h2>
          <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed mb-6">
            Please add handcrafted masterpieces to your basket before trying to checkout.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-brand-green hover:bg-brand-green-dark text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
            Delivery Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide your shipping coordinates to complete your artisan purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/50 p-6 sm:p-8 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
                <MapPin className="text-brand-green" size={20} />
                Shipping Destination Details
              </h2>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">House / Apartment No *</label>
                    <input
                      type="text"
                      required
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="House # 12-A, Floor 2"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Town / Sector *</label>
                    <input
                      type="text"
                      required
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      placeholder="Eden Garden / Peoples Colony"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street # 4, Main Commercial Boulevard"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Faisalabad"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Pakistan"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Postal / ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="38000"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3.5 mt-6 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
                >
                  Proceed to Payment Selection
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-850 text-sm mb-4 border-b border-slate-100 pb-2.5">
                Basket Checkout Summary
              </h3>

              <div className="flex flex-col gap-3.5 mb-6 overflow-y-auto max-h-56 pr-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start gap-4 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.quantity} x Rs. {item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-display font-semibold text-slate-700">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs text-slate-500 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-display font-medium text-slate-700">Rs. {cartTotals.subtotal.toFixed(2)}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-brand-green font-medium">
                    <span>10% Collector Savings</span>
                    <span className="font-display">-Rs. {cartTotals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  {cartTotals.deliveryFee > 0 ? (
                    <span className="font-display font-medium text-slate-700">Rs. {cartTotals.deliveryFee.toFixed(2)}</span>
                  ) : (
                    <span className="font-bold text-brand-green uppercase bg-brand-green-light px-2 py-0.5 rounded-md text-[10px] border border-brand-green/20">
                      Free
                    </span>
                  )}
                </div>
                <div className="border-t border-slate-100/80 my-1" />
                <div className="flex justify-between text-sm font-bold text-slate-800">
                  <span>Grand Total</span>
                  <span className="font-display text-base text-brand-green">Rs. {cartTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
