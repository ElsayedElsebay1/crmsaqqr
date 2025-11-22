import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.2 15.75L3 17.25l1.5 1.5 1.5-1.5M15 4.5l-1.5 1.5-1.5-1.5M12 9l-1.5 1.5-1.5-1.5M19.8 12l-1.5 1.5-1.5-1.5M17.25 15l-1.5 1.5-1.5-1.5M8.25 12l-1.5 1.5-1.5-1.5M12 15l-1.5 1.5-1.5-1.5M15 19.8l-1.5-1.5-1.5 1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 21l-4.5-4.5V3.75m1.5-1.5h6" />
  </svg>
);