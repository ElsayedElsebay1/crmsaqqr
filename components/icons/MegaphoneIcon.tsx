import React from 'react';

export const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M3 11l5 5" />
    <path d="M12 4l5 5" />
    <path d="M14 10l-2 2" />
    <path d="M12.5 14.5a3.5 3.5 0 0 1-5 0" />
    <path d="M17 5h-2a2 2 0 0 0-2 2v1" />
    <path d="m14 14-4.5 4.5" />
    <path d="M19 10v1a2 2 0 0 1-2 2h-2" />
  </svg>
);