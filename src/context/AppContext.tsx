"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface AppContextType {
  user: any | null;
  artisan: any | null;
  loading: boolean;
  cartItems: CartItem[];
  cartTotals: CartTotals;
  searchQuery: string;
  toasts: ToastMessage[];
  setSearchQuery: (q: string) => void;
  setUser: (u: any | null) => void;
  setArtisan: (f: any | null) => void;
  fetchSession: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateCartQty: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  triggerToast: (text: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  logout: (role: "user" | "artisan") => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<any | null>(null);
  const [artisan, setArtisanState] = useState<any | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [cartTotals, setCartTotals] = useState<CartTotals>({
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
  });

  const triggerToast = (text: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setUser = (u: any | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
    } else {
      localStorage.removeItem("user");
    }
  };

  const setArtisan = (f: any | null) => {
    setArtisanState(f);
    if (f) {
      localStorage.setItem("artisan", JSON.stringify(f));
    } else {
      localStorage.removeItem("artisan");
    }
  };

  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal > 1500 ? subtotal * 0.1 : 0; 
    const deliveryFee = subtotal > 0 && subtotal < 2000 ? 150 : 0; 
    const total = subtotal - discount + deliveryFee;

    setCartTotals({ subtotal, discount, deliveryFee, total });
  }, [cartItems]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      
      const userRes = await fetch("/api/customers/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          
          const cartRes = await fetch("/api/cart");
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            if (cartData.success && cartData.cart) {
              setCartItems(cartData.cart.items || []);
            }
          }
          setLoading(false);
          return;
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      const artisanRes = await fetch("/api/artisans/me");
      if (artisanRes.ok) {
        const artisanData = await artisanRes.json();
        if (artisanData.success && artisanData.artisan) {
          setArtisan(artisanData.artisan);
        } else {
          setArtisan(null);
        }
      } else {
        setArtisan(null);
      }
    } catch (error) {
      console.error("Session restoration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    const storedUser = localStorage.getItem("user");
    const storedArtisan = localStorage.getItem("artisan");
    
    setTimeout(() => {
      if (storedUser) setUserState(JSON.parse(storedUser));
      if (storedArtisan) setArtisanState(JSON.parse(storedArtisan));
    }, 0);

    fetchSession();
  }, []);

  const addToCart = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) {
      triggerToast("Please log in as a customer to add items to cart", "warning");
      return false;
    }
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart.items || []);
        triggerToast("Product added to cart successfully!", "success");
        return true;
      } else {
        triggerToast(data.message || "Failed to add product to cart", "error");
        return false;
      }
    } catch (err: any) {
      triggerToast("Failed to communicate with shopping cart", "error");
      return false;
    }
  };

  const updateCartQty = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart.items || []);
        return true;
      } else {
        triggerToast(data.message || "Failed to update item quantity", "error");
        return false;
      }
    } catch (err) {
      triggerToast("Failed to update cart details", "error");
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`/api/cart/items/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart.items || []);
        triggerToast("Product removed from cart", "info");
        return true;
      } else {
        triggerToast(data.message || "Failed to remove item", "error");
        return false;
      }
    } catch (err) {
      triggerToast("Failed to update cart details", "error");
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/cart/clear", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCartItems([]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to clear cart:", err);
      return false;
    }
  };

  const logout = async (role: "user" | "artisan") => {
    try {
      const url = role === "user" ? "/api/customers/logout" : "/api/artisans/logout";
      await fetch(url, { method: "POST" });
      if (role === "user") {
        setUser(null);
        setCartItems([]);
      } else {
        setArtisan(null);
      }
      triggerToast("Logged out successfully", "info");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        artisan,
        loading,
        cartItems,
        cartTotals,
        searchQuery,
        toasts,
        setSearchQuery,
        setUser,
        setArtisan,
        fetchSession,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        triggerToast,
        removeToast,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
