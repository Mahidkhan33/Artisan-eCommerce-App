"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { CreditCard, Truck, AlertCircle, ShieldCheck, ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { user, cartItems, cartTotals, clearCart, triggerToast } = useApp();

  const [address, setAddress] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("cash");
  const [loading, setLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    
    const stored = sessionStorage.getItem("shippingAddress");
    if (!stored) {
      triggerToast("Please complete your delivery address first", "warning");
      router.push("/checkout");
      return;
    }
    setAddress(JSON.parse(stored));

    if (!user || cartItems.length === 0) {
      router.push("/");
    }
  }, [user, cartItems.length]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      setLoading(true);

      const intentRes = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok || !intentData.success) {
        triggerToast(intentData.message || "Failed to initialize payment process", "error");
        setLoading(false);
        return;
      }

      const { paymentIntentId } = intentData;

      const confirmRes = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          shippingAddress: address,
        }),
      });

      const confirmData = await confirmRes.json();
      if (confirmRes.ok && confirmData.success) {
        triggerToast("Order placed successfully! Redirecting...", "success");

        sessionStorage.setItem("confirmedOrder", JSON.stringify(confirmData.order));

        await clearCart();
        
        router.push("/order-confirmation");
      } else {
        triggerToast(confirmData.message || "Order placement failed", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during order confirmation", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0 || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Validating checkout coordinates...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8">
          <button
            onClick={() => router.push("/checkout")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-green mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Modify Shipping Address
          </button>
          
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-800">
            Payment Selection
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose your payment method and finalize your organic order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/50 p-6 sm:p-8 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
                <CreditCard className="text-brand-green" size={20} />
                Select Payment Mode
              </h2>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                
                {}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                    paymentMethod === "cash"
                      ? "border-brand-green bg-emerald-50/30 ring-2 ring-emerald-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === "cash" ? "bg-brand-green text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-sm">Cash on Delivery</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Pay Rs. {cartTotals.total.toFixed(2)} when the courier arrives at your doorstep.
                    </p>
                  </div>
                </button>

                {}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                    paymentMethod === "card"
                      ? "border-brand-green bg-emerald-50/30 ring-2 ring-emerald-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === "card" ? "bg-brand-green text-white" : "bg-slate-100 text-slate-500"}`}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-sm">Credit / Debit Card</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Pay online instantly using secure card encryption with Stripe verification.
                    </p>
                  </div>
                </button>

              </div>

              {}
              <form onSubmit={handlePlaceOrder}>
                {paymentMethod === "cash" ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 text-xs text-slate-600 flex items-start gap-3">
                      <ShieldCheck className="text-brand-green shrink-0 mt-0.5" size={16} />
                      <p className="leading-relaxed">
                        <strong>Cash checkout:</strong> Your order will be immediately registered as pending. Stock levels will be updated, and the artisan will begin preparing your hand-packed creations. Please ensure accurate cash amounts are available upon arrival.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3.5 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
                    >
                      {loading ? "Confirming Order..." : "Confirm & Place CoD Order"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    
                    {}
                    <div className="rounded-xl bg-amber-50 border border-amber-200/50 p-4 text-xs text-amber-800 flex items-start gap-3">
                      <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                      <p className="leading-relaxed">
                        <strong>Developer notice:</strong> Stripe gateway requires active publishable APIs. We have deployed a self-healing card mockup interface below. Typing card digits will execute full backend state reductions and order masterpieces!
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Muhammad Ahmed"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Card Number</label>
                        <input
                          type="text"
                          required={paymentMethod === "card"}
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Expiration Date</label>
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.replace(/[^\d/]/g, ""))}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Security Code (CVC)</label>
                          <input
                            type="password"
                            required={paymentMethod === "card"}
                            maxLength={3}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3.5 mt-6 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
                    >
                      {loading ? "Decrypting Credentials..." : `Securely Pay Rs. ${cartTotals.total.toFixed(2)}`}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-850 text-sm mb-4 border-b border-slate-100 pb-2.5">
                Delivery Summary
              </h3>

              <div className="text-xs text-slate-500 space-y-3 mb-6">
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Shipping Destination</span>
                  <p className="leading-relaxed">
                    House {address.houseNo}, {address.streetAddress}, {address.town}, {address.city}, {address.postalCode}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Purchaser Info</span>
                  <p>{user.fullName?.firstName} {user.fullName?.lastName} ({user.phoneNumber})</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-xs text-slate-500">
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
