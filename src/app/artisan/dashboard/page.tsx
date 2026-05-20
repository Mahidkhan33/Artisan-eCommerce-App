"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard,
  Sprout,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Camera,
  X
} from "lucide-react";

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
}

interface OrderType {
  _id: string;
  orderId: string;
  customerId: {
    fullName: {
      firstName: string;
      lastName: string;
    };
    phoneNumber: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }>;
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

export default function ArtisanDashboard() {
  const router = useRouter();
  const { artisan, triggerToast } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "harvests" | "orders">("overview");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeOrdersCount: 0,
    listedProduceCount: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  const [pDescription, setPDescription] = useState("");
  const [pCategory, setPCategory] = useState("Ceramics");
  const [pPrice, setPPrice] = useState("");
  const [pQuantity, setPQuantity] = useState("");
  const [pUnit, setPUnit] = useState("kg");
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [pImagePreview, setPImagePreview] = useState("");
  const [pIsAvailable, setPIsAvailable] = useState(true);
  
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    if (!artisan) {
      triggerToast("Access denied. Please log in as a partner artisan", "warning");
      router.push("/artisan/login");
    } else {
      fetchDashboardData();
    }
  }, [artisan]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const prodRes = await fetch("/api/artisans/products");
      let prodList: ProductType[] = [];
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success) {
          prodList = prodData.data || [];
          setProducts(prodList);
        }
      }

      const orderRes = await fetch("/api/artisans/orders");
      let orderList: OrderType[] = [];
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.success) {
          orderList = orderData.data || [];
          setOrders(orderList);
        }
      }

      const totalEarnings = orderList
        .filter((o) => o.status === "delivered")
        .reduce((acc, o) => acc + o.totalAmount, 0);

      const activeOrdersCount = orderList.filter(
        (o) => o.status !== "delivered" && o.status !== "cancelled"
      ).length;

      setStats({
        totalEarnings,
        activeOrdersCount,
        listedProduceCount: prodList.length,
      });

    } catch (err) {
      console.error(err);
      triggerToast("Failed to restore dashboard parameters", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setPName("");
    setPDescription("");
    setPCategory("Ceramics");
    setPPrice("");
    setPQuantity("");
    setPUnit("piece");
    setPImageFile(null);
    setPImagePreview("");
    setPIsAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductType) => {
    setEditingProduct(product);
    setPName(product.name);
    setPDescription(product.description);
    setPCategory(product.category);
    setPPrice(product.price.toString());
    setPQuantity(product.quantity.toString());
    setPUnit(product.unit);
    setPImageFile(null);
    setPImagePreview(product.images?.[0] || "");
    setPIsAvailable(product.isAvailable);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/artisans/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("Creation listing deleted successfully", "info");
        fetchDashboardData();
      } else {
        triggerToast(data.message || "Failed to delete listing", "error");
      }
    } catch (err) {
      triggerToast("Failed to delete product", "error");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pQuantity) {
      triggerToast("Please complete required creation fields", "warning");
      return;
    }

    try {
      setSubmittingProduct(true);
      let imageUrl = pImagePreview;

      if (pImageFile) {
        const formData = new FormData();
        formData.append("image", pImageFile);
        formData.append("folder", "products");

        const uploadRes = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          imageUrl = uploadData.image.url;
        } else {
          triggerToast("Image upload failed. Using fallback placeholder.", "warning");
        }
      }

      const payload = {
        name: pName,
        description: pDescription,
        category: pCategory,
        price: Number(pPrice),
        quantity: Number(pQuantity),
        unit: pUnit,
        images: imageUrl ? [imageUrl] : [],
        isAvailable: pIsAvailable,
      };

      let res;
      if (editingProduct) {
        
        res = await fetch(`/api/artisans/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        
        res = await fetch("/api/artisans/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(
          editingProduct ? "Creation updated successfully!" : "New masterpiece listed successfully!",
          "success"
        );
        setIsModalOpen(false);
        fetchDashboardData();
      } else {
        triggerToast(data.message || "Failed to save masterpiece", "error");
      }
    } catch (err) {
      triggerToast("Failed to save creation details", "error");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Order status updated to '${newStatus}'`, "success");
        fetchDashboardData();
      } else {
        triggerToast(data.message || "Failed to update order status", "error");
      }
    } catch (err) {
      triggerToast("Failed to update status", "error");
    }
  };

  if (!artisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA]">
        <p className="text-slate-500 text-sm font-semibold animate-pulse">
          Validating authorization profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6 mb-8">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
              {artisan.studioName} Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, <strong>{artisan.fullName?.firstName}</strong>. Manage your artisan workshop operations.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "overview"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              <LayoutDashboard size={14} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("harvests")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "harvests"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              <Sprout size={14} />
              Creations
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                activeTab === "orders"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              <ShoppingBag size={14} />
              Orders
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-slate-400 text-sm font-semibold animate-pulse">
              Hydrating dashboard state...
            </p>
          </div>
        ) : (
          <>
            {}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                {}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {}
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3.5 rounded-xl bg-emerald-50 text-brand-green">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivered Sales</span>
                      <h3 className="font-display font-extrabold text-slate-800 text-xl mt-0.5">
                        Rs. {stats.totalEarnings.toFixed(2)}
                      </h3>
                    </div>
                  </div>

                  {}
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3.5 rounded-xl bg-amber-50 text-brand-gold">
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Orders</span>
                      <h3 className="font-display font-extrabold text-slate-800 text-xl mt-0.5">
                        {stats.activeOrdersCount} in queue
                      </h3>
                    </div>
                  </div>

                  {}
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-6 flex items-center gap-4 shadow-sm">
                    <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
                      <Sprout size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Showroom</span>
                      <h3 className="font-display font-extrabold text-slate-800 text-xl mt-0.5">
                        {stats.listedProduceCount} masterpieces
                      </h3>
                    </div>
                  </div>

                </div>

                {}
                <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
                  <h3 className="font-display font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">
                    Recent Fulfillment Queue
                  </h3>

                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No orders placed with your studio yet. Once orders are made, they will populate here!
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 4).map((order) => (
                        <div key={order._id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {order.orderId || `ORD-${order._id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {order.items.length} items • Rs. {order.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : order.status === "cancelled"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-amber-50 text-brand-gold border-amber-100"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {}
            {activeTab === "harvests" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                
                {}
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-slate-800 text-base">Creations Showroom Catalog</h3>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1 bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add New Creation
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center shadow-sm">
                    <span className="text-3xl mb-2 block">✨</span>
                    <h4 className="font-display font-bold text-slate-700 mb-1">No creations listed</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal mb-5">
                      You haven't listed any artisan creations yet. Create crops so consumers can buy!
                    </p>
                    <button
                      onClick={handleOpenAddModal}
                      className="rounded-full bg-brand-green text-white px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Create First Listing
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Creation</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock Level</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                          {products.map((prod) => (
                            <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                                  <img
                                    src={prod.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80"}
                                    alt={prod.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{prod.name}</span>
                              </td>
                              <td className="px-6 py-4">{prod.category}</td>
                              <td className="px-6 py-4 font-display font-semibold text-slate-800">
                                Rs. {prod.price} <span className="text-[10px] text-slate-400 font-normal">/ {prod.unit}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-bold ${prod.quantity <= 3 ? "text-amber-500" : "text-slate-600"}`}>
                                  {prod.quantity} {prod.unit}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                                  prod.isAvailable
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-slate-50 text-slate-400 border border-slate-100"
                                }`}>
                                  {prod.isAvailable ? "Active" : "Archived"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(prod)}
                                  className="text-slate-400 hover:text-brand-green p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {}
            {activeTab === "orders" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="font-display font-bold text-slate-800 text-base">Incoming Fulfillment Queue</h3>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/50 p-12 text-center shadow-sm">
                    <span className="text-3xl mb-2 block">📦</span>
                    <h4 className="font-display font-bold text-slate-700 mb-1">Queue is empty</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                      No order items have been requested from your studio yet. Once purchased, they will stream here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm space-y-4 hover:border-emerald-100 transition-all"
                      >
                        
                        {}
                        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3.5 text-xs">
                          <div>
                            <span className="font-display font-extrabold text-slate-800 text-sm tracking-wide">
                              {ord.orderId || `ORD-${ord._id.slice(-6).toUpperCase()}`}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Status Fulfillment</span>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-brand-green"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-700 block mb-0.5">Customer Coordinates</span>
                            <p>{ord.customerId?.fullName?.firstName} {ord.customerId?.fullName?.lastName}</p>
                            <p className="text-slate-400 font-semibold mt-0.5">{ord.customerId?.phoneNumber}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block mb-0.5">Shipping Destination</span>
                            <p className="flex items-center gap-1 truncate text-slate-500">
                              <MapPin size={12} className="text-rose-400 shrink-0" />
                              House {ord.shippingAddress?.houseNo}, {ord.shippingAddress?.streetAddress}, {ord.shippingAddress?.town}, {ord.shippingAddress?.city}
                            </p>
                          </div>
                        </div>

                        {}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-650 space-y-2">
                          {ord.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{item.productName} <strong>x {item.quantity} {item.unit}</strong></span>
                              <span className="font-display font-semibold text-slate-700">Rs. {item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {}
                        <div className="flex justify-between items-center border-t border-slate-150/60 pt-3 text-xs">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Payment: <strong className="text-slate-600 uppercase font-bold">{ord.paymentMethod}</strong>
                          </span>
                          <span className="font-display font-extrabold text-brand-green text-sm">
                            Rs. {ord.totalAmount.toFixed(2)}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative z-10 animate-[scaleUp_0.2s_ease-out]">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>

            <h3 className="font-display text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-1.5">
              <Sprout className="text-brand-green" size={20} />
              {editingProduct ? "Modify Creation Listing" : "Add Bespoke Creation Listing"}
            </h3>

            <form className="space-y-4" onSubmit={handleSaveProduct}>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Creation Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Hand-thrown Speckled Mug"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all font-medium text-slate-700"
                  >
                    <option value="Ceramics">Ceramics</option>
                    <option value="Leathercraft">Leathercraft</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pricing Unit *</label>
                  <select
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all font-medium text-slate-700"
                  >
                    <option value="piece">Per Piece</option>
                    <option value="set">Per Set</option>
                    <option value="batch">Per Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Available Stock *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pQuantity}
                    onChange={(e) => setPQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Creation Description</label>
                <textarea
                  rows={2}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Tell buyers about materials, handcrafting process, glazes..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-brand-green transition-all resize-none"
                />
              </div>

              {}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Creation Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {pImagePreview ? (
                      <img src={pImagePreview} alt="crop" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="text-slate-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-brand-green hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">
                      Directly uploads to Cloudinary secure artisan CDN.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={pIsAvailable}
                  onChange={(e) => setPIsAvailable(e.target.checked)}
                  className="rounded text-brand-green focus:ring-brand-green/20"
                />
                <label htmlFor="avail" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                  Make creation active and visible on storefront listing
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white py-3 text-xs font-semibold shadow-md shadow-emerald-500/10 transition-colors focus:outline-none cursor-pointer"
              >
                {submittingProduct ? "Saving Creation details..." : "Save Creation Masterpiece"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
