"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "subtle" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline: "bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-100 focus:ring-gray-400",
      subtle: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-100",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100 focus:ring-gray-400",
      link: "bg-transparent underline-offset-4 hover:underline text-indigo-600 hover:bg-transparent dark:text-indigo-400 focus:ring-indigo-500",
    };

    const sizeStyles = {
      default: "h-10 py-2 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };