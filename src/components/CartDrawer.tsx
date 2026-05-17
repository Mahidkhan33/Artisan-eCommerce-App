"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartTotals, updateCartQty, removeFromCart } = useApp();

  if (!isOpen) return null;

  return (
    <>
      {}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[190] bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]"
      />

      {}
      <div className="fixed inset-y-0 right-0 z-[200] flex w-full max-w-md flex-col bg-white shadow-2xl animate-[slideIn_0.3s_ease-out]">
        {}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-brand-green" size={20} />
            <h2 className="font-display text-lg font-bold text-slate-800">Your Basket</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-brand-green-light p-6 text-brand-green mb-4">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-bold text-slate-700 mb-1">Your basket is empty</h3>
              <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mb-6">
                Add hand-thrown pottery, hand-stitched leather satchels, and craft masterpieces to your collection!
              </p>
              <button
                onClick={onClose}
                className="rounded-full bg-brand-green hover:bg-brand-green-dark text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 hover:border-slate-200/80 transition-all"
                >
                  {}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&q=80"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-semibold text-slate-800 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 mb-1.5">{item.unit}</p>
                    <p className="font-display text-xs font-bold text-slate-800">
                      Rs. {item.price.toFixed(2)}
                    </p>
                  </div>

                  {}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>

                    {}
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/50 p-1">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateCartQty(item.productId, item.quantity - 1);
                          } else {
                            removeFromCart(item.productId);
                          }
                        }}
                        className="rounded-full p-0.5 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-display text-xs font-semibold text-slate-700">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="rounded-full p-0.5 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/70 p-6">
            <div className="flex flex-col gap-2.5 mb-6 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-display font-medium text-slate-700">Rs. {cartTotals.subtotal.toFixed(2)}</span>
              </div>
              
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-brand-green font-medium">
                  <span>Collector Savings (10%)</span>
                  <span className="font-display">-Rs. {cartTotals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge</span>
                {cartTotals.deliveryFee > 0 ? (
                  <span className="font-display font-medium text-slate-700">Rs. {cartTotals.deliveryFee.toFixed(2)}</span>
                ) : (
                  <span className="font-semibold text-brand-green text-xs uppercase bg-brand-green-light px-2 py-0.5 rounded-md border border-brand-green/20">
                    Free
                  </span>
                )}
              </div>

              <div className="border-t border-slate-200/60 my-2" />

              <div className="flex justify-between text-base font-bold text-slate-800">
                <span>Grand Total</span>
                <span className="font-display text-lg text-brand-green">Rs. {cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-green hover:bg-brand-green-dark text-white py-3.5 text-sm font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
