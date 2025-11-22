import React from 'react';

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348A4.5 4.5 0 0112 4.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5c2.485 0 4.5-2.015 4.5-4.5V6.75M19.5 12A7.5 7.5 0 1112 4.5" />
    </svg>
);