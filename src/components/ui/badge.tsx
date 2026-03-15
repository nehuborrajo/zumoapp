import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
        success: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
        premium: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm",
        xp: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm",
        coins: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm",
        streak: "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
