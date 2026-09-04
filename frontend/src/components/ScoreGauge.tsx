import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 110,
  strokeWidth = 8,
  label = "Match Score",
  showLabel = true,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Dynamic bright color palette
  const getColor = (val: number) => {
    if (val >= 85) return { stroke: "#0F766E", glow: "rgba(15, 118, 110, 0.25)", text: "text-teal-700" };
    if (val >= 70) return { stroke: "#2563EB", glow: "rgba(37, 99, 235, 0.25)", text: "text-blue-700" };
    if (val >= 50) return { stroke: "#D97706", glow: "rgba(217, 119, 6, 0.25)", text: "text-amber-700" };
    return { stroke: "#E11D48", glow: "rgba(225, 29, 72, 0.25)", text: "text-rose-700" };
  };

  const theme = getColor(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 2px 4px ${theme.glow})` }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-bold font-mono tracking-tight ${theme.text}`}>
            {normalizedScore}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
