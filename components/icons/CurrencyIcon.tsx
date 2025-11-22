import React from 'react';

export const CurrencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <circle cx="12" cy="12" r="8"></circle>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="12" y1="3" x2="12" y2="21"></line>
    </svg>
);