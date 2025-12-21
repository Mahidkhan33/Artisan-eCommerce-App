import React from "react";
import { cn } from "@/lib/utils";

interface FooterLogoProps {
  className?: string;
  description?: string;
  showIcon?: boolean;
  onClick?: () => void;
}
const FooterLogo: React.FC<FooterLogoProps> = ({
  className,
  description = "Connecting communities with local organic farmers fresh, sustainable produce without intermediaries",
  showIcon = true,
  onClick,
}) => {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "flex items-center gap-3",
          onClick && "cursor-pointer"
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
          <div className="w-10 h-10 rounded-full bg-white shrink-0" >
            <img src="/assets/Logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
        <span className="text-xl font-bold text-green-500">FarmSeGhar</span>
      </div>
      {description && (
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
};
export default FooterLogo;
