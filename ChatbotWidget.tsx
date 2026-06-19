import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({ className = '', iconOnly = false, size = 'md' }: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', subtext: 'text-[8px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg sm:text-xl', subtext: 'text-[9.5px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl sm:text-3xl', subtext: 'text-[11px]' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl sm:text-4xl', subtext: 'text-xs' }
  };

  const activeSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Icon portion using custom stylized SVG resembling the brand identity */}
      <div className={`shrink-0 ${activeSize.icon} relative filter drop-shadow-[0_2px_8px_rgba(24,119,242,0.15)]`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="logoBlueArrow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1877F2" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
            <linearGradient id="logoGoldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Growth Bars */}
          <rect x="22" y="24" width="7" height="12" rx="1.5" fill="#f97316" />
          <rect x="33" y="18" width="7" height="18" rx="1.5" fill="#f59e0b" />
          <rect x="44" y="12" width="7" height="24" rx="1.5" fill="#2ecc71" stroke="#27ae60" strokeWidth="0.5" />

          {/* Blue Trend Line Sweep & Arrowhead */}
          <path d="M 16,35 C 28,32 50,22 68,14" fill="none" stroke="url(#logoBlueArrow)" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="65,9 75,12 70,21" fill="url(#logoBlueArrow)" />

          {/* Stack of Banknotes */}
          <path d="M 12,50 C 12,46 16,42 66,42 C 68,42 72,46 72,50 L 72,70 C 72,74 68,78 66,78 C 16,78 12,74 12,70 Z" fill="#27ae60" stroke="#219a52" strokeWidth="2" />
          <path d="M 15,53 C 15,50 18,46 63,46 C 65,46 68,50 68,53 L 68,67 C 68,70 65,74 63,74 C 18,74 15,70 15,67 Z" fill="#2ecc71" stroke="#27ae60" strokeWidth="1.5" />
          
          <circle cx="22" cy="60" r="3.5" fill="#27ae60" opacity="0.6"/>
          <circle cx="61" cy="60" r="3.5" fill="#27ae60" opacity="0.6"/>

          {/* Centered Golden Taka Coin */}
          <circle cx="41" cy="60" r="11" fill="url(#logoGoldCoin)" stroke="#ea580c" strokeWidth="1.5" />
          <text x="41.5" y="64.5" fontFamily="'Inter', system-ui, sans-serif" fontSize="13" fontWeight="900" fill="#ffffff" textAnchor="middle">৳</text>
        </svg>
      </div>

      {/* Text portion */}
      {!iconOnly && (
        <div className="flex flex-col">
          <div className={`${activeSize.text} font-black tracking-tight leading-none font-sans flex items-center gap-1`}>
            <span className="text-[#1877F2]">SUPER</span>
            <span className="text-[#ff6600]">EARNING</span>
            <span className="text-[#2ecc71] font-bold">BD</span>
          </div>
          <span className={`${activeSize.subtext} text-blue-600 font-sans tracking-wide uppercase font-black mt-0.5 opacity-80 z-10`}>
            ডিপ্লাপার ইমন ভেরিফাইড প্রজেক্ট
          </span>
        </div>
      )}
    </div>
  );
}
