import React from 'react';

export const FilePdfIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    {/* P */}
    <path d="M10 12H8v6"></path>
    <path d="M8 15h2a1 1 0 0 0 0-2H8"></path>
    {/* D */}
    <path d="M13 18v-6h1.5a1.5 1.5 0 0 1 0 3A1.5 1.5 0 0 1 13 18Z"></path>
    {/* F */}
    <path d="M17 12h2.5"></path>
    <path d="M17 15h2"></path>
    <path d="M17 12v6"></path>
  </svg>
);