"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, ChevronDown, ShoppingBag } from "lucide-react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { user, artisan, cartItems, searchQuery, setSearchQuery, logout } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {}
            <div className="flex shrink-0">
              <Link href="/" className="flex items-center gap-1.5">
                <span className="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-green to-brand-gold bg-clip-text text-transparent">
                  ArtisanAlley
                </span>
                <span className="hidden sm:inline-block rounded-full bg-brand-green-light px-2.5 py-0.5 text-[10px] font-bold text-brand-green border border-brand-green/10 uppercase tracking-wider">
                  Handmade
                </span>
              </Link>
            </div>

            {}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search bespoke ceramics, stitched leather, tapestries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
              />
              <div className="absolute left-3.5 top-2.5 text-slate-400">
                <Search size={16} />
              </div>
            </div>

            {}
            <div className="flex items-center gap-4">
              
              {}
              {!user && (
                <Link
                  href={artisan ? "/artisan/dashboard" : "/artisan/login"}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-green bg-brand-green-light hover:bg-brand-green/10 border border-brand-green/20 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  {artisan ? "Artisan Studio" : "Sell on ArtisanAlley"}
                </Link>
              )}

              {}
              {!artisan && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-slate-600 hover:text-brand-green rounded-full hover:bg-slate-100 transition-colors"
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-bold font-display uppercase">
                      {user.fullName?.firstName?.[0] || "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 pr-1 pl-0.5">
                      {user.fullName?.firstName || "Profile"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400 pr-1" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-[scaleUp_0.15s_ease-out]">
                      <div className="px-3 py-2 text-xs border-b border-slate-100 mb-1">
                        <p className="font-semibold text-slate-800 leading-tight">
                          {user.fullName?.firstName} {user.fullName?.lastName}
                        </p>
                        <p className="text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <ShoppingBag size={14} />
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout("user");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50/50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : artisan ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-brand-green/20 hover:border-brand-green/40 bg-brand-green-light transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-bold font-display uppercase">
                      {artisan.fullName?.firstName?.[0] || "A"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-brand-green pr-1 pl-0.5">
                      {artisan.studioName || "Artisan Studio"}
                    </span>
                    <ChevronDown size={14} className="text-brand-green pr-1" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-[scaleUp_0.15s_ease-out]">
                      <Link
                        href="/artisan/dashboard"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout("artisan");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50/50 transition-colors border-t border-slate-100/50 mt-1"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-slate-600 hover:text-brand-green px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-dark px-4 py-2 rounded-full shadow-sm transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
