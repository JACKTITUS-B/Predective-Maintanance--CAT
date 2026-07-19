import React from "react";

interface NavbarProps {
  title: string;
  subTitle?: string;
  location?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subTitle = "Caterpillar Inc.",
  location = "PSG CAS Site A"
}) => {
  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#FFCD00] font-bold">
          {subTitle}
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 py-1.5 px-3 rounded text-stone-600 dark:text-stone-400">
        <span className="font-bold">LOCATION:</span> {location}
      </div>
    </header>
  );
};
