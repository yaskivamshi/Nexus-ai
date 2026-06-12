// src/components/ui/NexusLogo.jsx
import React from 'react';

export const NexusLogo = ({ className = "h-8", showText = true, variant = "primary" }) => {
  const isLight = variant === "light";
  const primaryColor = "#3B82F6";
  const secondaryColor = isLight ? "#0F172A" : "#FFFFFF";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Premium Monogram Icon: Interconnected Neural Nodes */}
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 30V10L22 25V10M30 10V30" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="2.5" fill={primaryColor} />
        <circle cx="10" cy="30" r="2.5" fill={primaryColor} />
        <circle cx="22" cy="25" r="2.5" fill={primaryColor} />
        <circle cx="30" cy="10" r="2.5" fill={primaryColor} />
        <circle cx="30" cy="30" r="2.5" fill={primaryColor} />
        <path d="M10 10L30 30" stroke={primaryColor} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      </svg>
      
      {showText && (
        <span className={`font-bold tracking-tight text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
          NEXUS <span className="text-[#3B82F6]">AI</span>
        </span>
      )}
    </div>
  );
};