import React from 'react';

export const HandshakeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M11 17a2 2 0 0 1 2 2v2" />
        <path d="M15 17a2 2 0 0 0 2 2v2" />
        <path d="M2 14.5A2.5 2.5 0 0 1 4.5 12H6a2 2 0 0 1 2 2v2" />
        <path d="M22 14.5a2.5 2.5 0 0 0-2.5-2.5H18a2 2 0 0 0-2 2v2" />
        <path d="m14 12-2-2-2 2" />
        <path d="M14 16h-4" />
    </svg>
);