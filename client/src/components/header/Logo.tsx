import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
}
const Logo: React.FC<LogoProps> = ({ className, showIcon = true, onClick }) => (
  <div
    className={cn(
      "flex items-center gap-3 cursor-pointer",
      className
    )}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {showIcon && (
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 " >
        <img src={new URL('../../assets/Logo.png', import.meta.url).href} alt="Logo" className="w-full h-full object-cover rounded-full" />
      </div>
    )}
    <span className="text-xl font-bold text-gray-900">FarmSeGhar</span>
  </div>
);
export default Logo;
