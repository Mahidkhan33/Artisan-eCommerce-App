"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 md:px-0">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconColor = "text-emerald-500";
        let bgColor = "bg-white/95 border-emerald-100";
        let shadowColor = "shadow-emerald-500/5";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          iconColor = "text-emerald-600";
          bgColor = "bg-emerald-50/95 border-emerald-200/50";
        } else if (toast.type === "error") {
          Icon = XCircle;
          iconColor = "text-rose-500";
          bgColor = "bg-rose-50/95 border-rose-200/50";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          iconColor = "text-amber-500";
          bgColor = "bg-amber-50/95 border-amber-200/50";
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${bgColor} ${shadowColor} animate-[slideIn_0.3s_ease-out] transition-all`}
          >
            <div className={`shrink-0 ${iconColor}`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            
            <p className="flex-1 text-sm font-medium text-slate-800 tracking-tight leading-snug">
              {toast.text}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100/50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
