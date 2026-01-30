import React from 'react';

export const Logo = ({ variant = 'dark', size = 'md', withAppSuffix = true }) => {
  // Colors based on variant
  const iconColor = variant === 'light' ? '#2dd4bf' : '#0d9488'; // teal-400 : teal-600
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-600';
  const appTextColor = variant === 'light' ? 'text-slate-300' : 'text-slate-400';
  const dividerColor = variant === 'light' ? 'bg-teal-400' : 'bg-teal-500';

  // Sizing mappings
  const sizePx = {
    sm: 24,
    md: 42,
    lg: 64
  };

  const fontSize = {
    sm: 'text-lg',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const dividerStyle = {
    sm: { width: '1.5px', height: '16px' },
    md: { width: '2.5px', height: '32px' },
    lg: { width: '4px', height: '48px' }
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon - Custom SVG matching the Amatia pentagon shutter */}
      <svg 
        width={sizePx[size]} 
        height={sizePx[size]} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer Pentagon with Curved Corners */}
        <path 
          d="M50 5 L93 36 L77 88 L23 88 L7 36 Z" 
          stroke={iconColor} 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Inner Shutter Spirals - Abstracted from image */}
        <path d="M50 5 Q65 45 93 36" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M93 36 Q60 60 77 88" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M77 88 Q35 70 23 88" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M23 88 Q30 40 7 36" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
        <path d="M7 36 Q45 35 50 5" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
      </svg>
      
      {/* Text Group */}
      <div className={`flex items-center leading-none ${textColor} tracking-tight`}>
        <span className={`font-sans ${fontSize[size]} font-normal`}>
          amatia
        </span>
        
        {withAppSuffix && (
          <>
            {/* Vertical Divider */}
            <div className={`mx-2.5 ${dividerColor} rounded-full`} 
                 style={dividerStyle[size]} 
            />
            
            <span className={`font-sans ${fontSize[size]} font-light ${appTextColor}`}>
              app
            </span>
          </>
        )}
      </div>
    </div>
  );
};
