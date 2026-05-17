"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, Star, ShoppingCart, SlidersHorizontal, Eye } from "lucide-react";

interface ProductType {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  unit: string;
  images: string[];
  isAvailable: boolean;
  sellerName: string;
  location: string;
  artisanImage?: string;
  rating: number;
  artisan: {
    studioName: string;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Creations", icon: "✨" },
  { id: "Ceramics", label: "Ceramics", icon: "🏺" },
  { id: "Leathercraft", label: "Leathercraft", icon: "💼" },
  { id: "Textiles", label: "Textiles", icon: "🧶" },
  { id: "Woodwork", label: "Woodwork", icon: "🪵" },
];

export default function Storefront() {
  const { searchQuery, addToCart, triggerToast } = useApp();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public/products");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;

    const matchesPrice = product.price <= priceRange;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFA]">
      <Navbar />

      {}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-green-deep to-emerald-900 text-white py-16 sm:py-24">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-brand-green/20 px-3 py-1 text-xs font-semibold text-brand-green border border-brand-green/30 mb-4 animate-[fadeIn_0.5s_ease-out]">
              ✨ 100% Handcrafted & Unique
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Bespoke Artisan Goods <br />
              <span className="text-orange-400">Direct From Local Studios</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-350 leading-relaxed max-w-lg mb-8">
              Skip the industrial production. Purchase hand-thrown clay mugs, vegetable-tanned stitched satchels, and premium oak woodcarvings direct from independent local artists.
            </p>

            {}
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-brand-green text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-400"
                      : "bg-white/10 hover:bg-white/15 text-slate-200 backdrop-blur-xs border border-white/5"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {}
          <aside className="w-full lg:w-64 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 mb-4"
            >
              <SlidersHorizontal size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <div className={`flex-col gap-6 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm ${
              showFilters ? "flex" : "hidden lg:flex"
            }`}>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Refine Price Range</h3>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-green"
                />
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mt-2">
                  <span>Min: Rs. 50</span>
                  <span className="text-brand-green font-bold">Max: Rs. {priceRange}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Workshop Locations</h3>
                <div className="flex flex-col gap-2">
                  {["Faisalabad, Punjab", "Sargodha, Punjab", "Okara, Punjab"].map((loc) => (
                    <label key={loc} className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-brand-green focus:ring-brand-green/20" />
                      {loc}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                  ArtisanAlley Guarantee
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Every product listed is verified, authentic, and hand-selected by real independent local craftsmen.
                </p>
              </div>
            </div>
          </aside>

          {}
          <div className="flex-1">
            <div className="flex justify-between items-center gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-800 tracking-tight">
                  Featured Artisan Creations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredProducts.length} verified masterpieces
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200/50 bg-white p-4 animate-pulse">
                    <div className="h-44 rounded-xl bg-slate-100 mb-4" />
                    <div className="h-4 w-2/3 bg-slate-100 rounded mb-2.5" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-1/4 bg-slate-100 rounded" />
                      <div className="h-8 w-1/3 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200/60 shadow-xs max-w-lg mx-auto mt-6">
                <span className="text-4xl mb-3">✨</span>
                <h3 className="font-display font-bold text-slate-700 mb-1">No creations match your filters</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                  Try adjusting your search queries or resetting categories to explore other bespoke craft collections.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setPriceRange(3000);
                  }}
                  className="rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-2 text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity > 0 && product.quantity <= 3;
                  const isOutOfStock = product.quantity === 0;

                  return (
                    <div
                      key={product._id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/50 bg-white overflow-hidden hover:shadow-xl hover:border-emerald-100/50 transition-all duration-300 animate-[fadeIn_0.3s_ease-out]"
                    >
                      {}
                      <div className="relative h-48 bg-slate-50 overflow-hidden shrink-0">
                        <img
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {}
                        {isLowStock && (
                          <span className="absolute top-3 left-3 bg-amber-500/90 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                            Only {product.quantity} left
                          </span>
                        )}

                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-600 px-2 py-0.5 rounded-md border border-slate-100/30">
                          {product.category}
                        </span>
                      </div>

                      {}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          {}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                            <span className="text-emerald-600 truncate max-w-[120px]">
                              {product.artisan?.studioName || product.sellerName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin size={9} className="text-rose-400" />
                              {product.location.split(",")[0]}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-slate-800 text-base leading-snug group-hover:text-brand-green transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1.5">
                            {product.description}
                          </p>
                        </div>

                        {}
                        <div className="border-t border-slate-100 pt-4">
                          <div className="flex justify-between items-center gap-2 mb-3">
                            <div className="flex flex-col">
                              <span className="font-display text-lg font-extrabold text-slate-800">
                                Rs. {product.price}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                Per {product.unit}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-brand-green text-[10px] font-bold shrink-0">
                              <Star size={11} className="fill-emerald-500 stroke-emerald-500" />
                              <span>{product.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart(product._id, 1)}
                            disabled={isOutOfStock}
                            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                              isOutOfStock
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-brand-green hover:bg-brand-green-dark text-white shadow-emerald-500/5"
                            }`}
                          >
                            <ShoppingCart size={13} />
                            {isOutOfStock ? "Out of Stock" : "Add to Basket"}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                ArtisanAlley
              </span>
              <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
                Empowering independent local makers with direct collector connections, delivering premium-grade handcrafted masterpieces direct from active workshop studios.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-white text-sm mb-1">Creations Showrooms</h4>
              <span className="text-xs hover:text-white transition-colors cursor-pointer">🏺 Speckled Stoneware & Ceramics</span>
              <span className="text-xs hover:text-white transition-colors cursor-pointer">💼 Hand-stitched Leather Satchels</span>
              <span className="text-xs hover:text-white transition-colors cursor-pointer">🧶 Handwoven Indigo Tapestries</span>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-2">Sustainable Artistry</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                By purchasing on ArtisanAlley, you direct 100% of profit margins back to independent creators, funding active design studios and traditional handicrafts.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 mt-10 pt-6 text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} ArtisanAlley Inc. Designed for visual and structural excellence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
