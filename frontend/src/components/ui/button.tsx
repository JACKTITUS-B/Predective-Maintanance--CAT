import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded";

  const variants = {
    primary: "bg-[#FFCD00] hover:bg-[#E5B800] text-black shadow-sm",
    secondary: "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700",
    outline: "border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-sm",
    ghost: "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-5 py-2.5 text-sm"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
