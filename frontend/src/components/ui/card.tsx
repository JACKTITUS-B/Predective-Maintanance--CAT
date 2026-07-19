import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-5 pb-3 border-b border-stone-100 dark:border-stone-800/50 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-xs text-stone-500 mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-5 pt-3 border-t border-stone-100 dark:border-stone-800/50 bg-stone-50/50 dark:bg-stone-950/20 ${className}`} {...props}>
      {children}
    </div>
  );
};
