import React from 'react';

export const CalendarAlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M5.75 3a.75.75 0 01.75.75v.5h7V3.75a.75.75 0 011.5 0v.5h.5a3 3 0 013 3v8.5a3 3 0 01-3 3H4a3 3 0 01-3-3V7a3 3 0 013-3h.5v-.5A.75.75 0 015.75 3zM4.5 7a1.5 1.5 0 00-1.5 1.5v8.5a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5V8.5A1.5 1.5 0 0015.5 7h-11z"
      clipRule="evenodd"
    />
    <path d="M10 10.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75z" />
    <path
      fillRule="evenodd"
      d="M10 12a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V12.75A.75.75 0 0110 12z"
      clipRule="evenodd"
    />
  </svg>
);
