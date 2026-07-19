import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full text-sm bg-stone-50 dark:bg-stone-950 border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#FFCD00] transition-colors cursor-pointer ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : "border-stone-300 dark:border-stone-800"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[10px] text-red-500 font-bold mt-0.5 block">
          {error}
        </span>
      )}
    </div>
  );
};
