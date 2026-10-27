import React from 'react';

interface NexoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
}

export const NexoLogo: React.FC<NexoLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  light = false 
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size];

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight'
  }[size];

  return (
    <div className="flex items-center gap-3">
      {/* Geometric Connected Modules Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconDimensions}`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          {/* Outer circular orbital track representing 360 connectivity */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke={light ? 'rgba(53, 208, 186, 0.35)' : 'rgba(16, 24, 32, 0.15)'} 
            strokeWidth="2.5" 
            strokeDasharray="4 4"
          />

          {/* Connected Network Bridge Lines */}
          <path 
            d="M50 18 L78 35 L78 65 L50 82 L22 65 L22 35 Z" 
            stroke={light ? '#35D0BA' : '#101820'} 
            strokeWidth="3.5" 
            strokeLinejoin="round"
            className="opacity-70"
          />

          {/* Intersecting Diamond Core Lines */}
          <path 
            d="M50 18 L50 82 M22 35 L78 65 M22 65 L78 35" 
            stroke={light ? 'rgba(245, 166, 35, 0.6)' : 'rgba(245, 166, 35, 0.7)'} 
            strokeWidth="2" 
            strokeLinecap="round"
          />

          {/* 4 Connected Functional Nodes (Stock, Sales, Clients, Finance) */}
          {/* Top Node: Inventario (Turquesa) */}
          <circle cx="50" cy="18" r="6" fill="#35D0BA" />
          <circle cx="50" cy="18" r="2.5" fill="#101820" />

          {/* Right Node: Ventas (Ámbar) */}
          <circle cx="78" cy="50" r="6" fill="#F5A623" />
          <circle cx="78" cy="50" r="2.5" fill="#FFFFFF" />

          {/* Bottom Node: Clientes (Turquesa) */}
          <circle cx="50" cy="82" r="6" fill="#35D0BA" />
          <circle cx="50" cy="82" r="2.5" fill="#101820" />

          {/* Left Node: Finanzas / Gastos (Ámbar) */}
          <circle cx="22" cy="50" r="6" fill="#F5A623" />
          <circle cx="22" cy="50" r="2.5" fill="#FFFFFF" />

          {/* Center Nexus Pulse - The 360 Core */}
          <circle cx="50" cy="50" r="10" fill="#101820" stroke="#35D0BA" strokeWidth="2.5" />
          <polygon points="50,44 55,53 45,53" fill="#F5A623" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${titleSizes} ${light ? 'text-[#F2F4F6]' : 'text-[#101820]'}`}>
            NEXO
          </span>
          <span className="font-extrabold text-[#35D0BA] px-1.5 py-0.5 rounded text-xs tracking-wider bg-[#101820]/10 dark:bg-white/10 uppercase">
            360
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] leading-tight font-medium ${light ? 'text-gray-300' : 'text-gray-500'}`}>
            Tu negocio conectado. Cada movimiento bajo control.
          </span>
        )}
      </div>
    </div>
  );
};
