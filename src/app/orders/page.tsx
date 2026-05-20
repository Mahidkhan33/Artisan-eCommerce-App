"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Package, MapPin, Calendar, CreditCard, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: {
    streetAddress: string;
    houseNo: string;
    town: string;
    city: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, triggerToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      triggerToast("Please log in to view your orders", "warning");
      router.push("/login");
    } else {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        } else {
          triggerToast(data.message || "Failed to load orders", "error");
        }
      } else {
        triggerToast("Network response was not ok", "error");
      }
    } catch (err) {
      triggerToast("Failed to fetch order history", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "cancelled":
        return "bg-rose-50 text-rose-600 border-rose-200";
      case "processing":
      case "confirmed":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      default:
        return "bg-amber-50 text-brand-gold border-amber-200";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Validating session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-[fadeIn_0.3s_ease-out]">
        <div className="mb-8 border-b border-slate-200/60 pb-6 flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200/50 text-brand-green">
            <Package size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
              My Artisan Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track the fulfillment and shipment of your bespoke purchases.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">Loading order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/50 p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-display font-bold text-slate-800 text-lg mb-2">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
              You haven't placed any artisan orders yet. Explore the showroom to find unique handcrafted creations.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand-green hover:bg-brand-green-dark text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-colors"
            >
              Explore Showroom
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:border-emerald-200 transition-colors"
              >
                {/* Order Header */}
                <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Order Placed
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Total Amount
                      </span>
                      <span className="text-xs font-bold text-brand-green">
                        Rs. {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Order ID
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {order.orderId || `ORD-${order._id.slice(-6).toUpperCase()}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-5 flex flex-col md:flex-row gap-6">
                  {/* Items List */}
                  <div className="flex-1 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Purchased Items
                    </h4>
                    <ul className="space-y-3">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <ShoppingBag size={16} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                                {item.productName}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Qty: {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            Rs. {item.total.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Details */}
                  <div className="w-full md:w-64 shrink-0 bg-slate-50/50 rounded-xl border border-slate-100 p-4 space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <MapPin size={12} className="text-rose-400" /> Shipping Address
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        House {order.shippingAddress?.houseNo}, {order.shippingAddress?.streetAddress}
                        <br />
                        {order.shippingAddress?.town}, {order.shippingAddress?.city}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CreditCard size={12} className="text-blue-400" /> Payment Method
                      </h4>
                      <p className="text-xs text-slate-600 capitalize font-semibold">
                        {order.paymentMethod === "cash" ? "Cash on Delivery" : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
