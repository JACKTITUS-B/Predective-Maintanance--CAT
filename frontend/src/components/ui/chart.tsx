import React from "react";

interface DataPoint {
  time: number;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  maxScale?: number;
  strokeColor?: string;
  height?: number;
  width?: number;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  maxScale = 100,
  strokeColor = "#FFCD00",
  height = 150,
  width = 500
}) => {
  if (data.length === 0) {
    return (
      <div className="w-full bg-stone-50 dark:bg-stone-950 flex items-center justify-center text-xs text-stone-500 rounded border border-dashed border-stone-200 dark:border-stone-800" style={{ height }}>
        NO TELEMETRY LOGS AVAILABLE
      </div>
    );
  }

  // Draw continuous SVG path
  const pathData = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (point.value / maxScale) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const latestY = height - (data[data.length - 1].value / maxScale) * height;

  return (
    <div className="bg-stone-50 dark:bg-stone-950/80 rounded border border-stone-200/60 dark:border-stone-800/80 p-2 relative overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" style={{ height }}>
        {/* Horizontal gridlines */}
        <line x1="0" y1="0" x2={width} y2="0" stroke="currentColor" className="text-stone-200 dark:text-stone-800/50" strokeWidth="0.5" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-stone-200 dark:text-stone-800/50" strokeWidth="0.5" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-stone-200 dark:text-stone-800/50" strokeWidth="0.5" />

        {/* The line path */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Flashing tracker point */}
        <circle cx={width} cy={latestY} r="4" fill={strokeColor} className="animate-pulse" />
      </svg>
    </div>
  );
};
