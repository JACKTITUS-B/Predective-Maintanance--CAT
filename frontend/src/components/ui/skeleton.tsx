import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular"
}) => {
  const baseClass = "bg-stone-200 dark:bg-stone-800 animate-pulse";
  
  const variantClasses = {
    text: "h-3 w-3/4 rounded",
    circular: "rounded-full",
    rectangular: "rounded"
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading placeholder"
    />
  );
};
