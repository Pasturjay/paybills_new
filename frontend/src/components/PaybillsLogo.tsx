import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'primary' | 'white' | 'monochrome';
}

export function PaybillsLogo({ className = "w-8 h-8", variant = 'primary' }: LogoProps) {
    const primaryColor = variant === 'white' ? '#FFFFFF' : '#003366';

    return (
        <svg
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* 
              The 'P' shape + top of the card 
              Starts top left, goes down forming the P stem, loops around shaping the card top.
            */}
            <path
                d="M30 15 
                   C 30 15, 30 10, 45 10 
                   H 125 
                   C 145 10, 150 20, 150 35 
                   V 55 
                   C 150 65, 145 70, 135 70 
                   H 70 
                   V 55 
                   H 115 
                   V 35 
                   H 65 
                   C 50 35, 50 45, 50 55 
                   V 110 
                   H 30 
                   Z"
                fill={primaryColor}
            />

            {/* 
              The bottom part of the card 
              A rounded rectangle shifted to the right, sitting below the top gap.
            */}
            <path
                d="M55 80 
                   H 135 
                   C 145 80, 150 85, 150 95 
                   V 115 
                   H 55 
                   Z"
                fill={primaryColor}
            />

            {/* 
              The small horizontal chip/slider detail on the right side of the card
            */}
            <rect
                x="115"
                y="35"
                width="20"
                height="8"
                rx="4"
                fill={variant === 'primary' ? '#FFFFFF' : '#003366'}
                className={variant === 'white' ? 'fill-[#003366]' : ''}
            />
        </svg>
    );
}

// Full Text Logo
export function PaybillsFullLogo({ className = "h-8", variant = 'primary' }: { className?: string, variant?: 'primary' | 'white' | 'monochrome' }) {
    const textColor = variant === 'white' ? 'text-white' : 'text-[#003366]';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <PaybillsLogo className="h-full w-auto" variant={variant} />
            <span className={`font-black tracking-tight ${textColor}`} style={{ fontSize: '1.25em', fontFamily: 'system-ui, sans-serif' }}>
                PayBills
            </span>
        </div>
    );
}
