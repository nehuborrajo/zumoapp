import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "xp" | "health" | "streak" | "success";
  size?: "sm" | "default" | "lg";
  showValue?: boolean;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value,
    max = 100,
    variant = "default",
    size = "default",
    showValue = false,
    animated = true,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantStyles = {
      default: "bg-gradient-to-r from-indigo-500 to-purple-600",
      xp: "bg-gradient-to-r from-purple-500 to-pink-500",
      health: "bg-gradient-to-r from-green-500 to-emerald-500",
      streak: "bg-gradient-to-r from-orange-500 to-red-500",
      success: "bg-gradient-to-r from-green-400 to-emerald-500",
    };

    const sizeStyles = {
      sm: "h-1.5",
      default: "h-2.5",
      lg: "h-4",
    };

    return (
      <div className="w-full">
        <div
          ref={ref}
          className={cn(
            "w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantStyles[variant],
              animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
