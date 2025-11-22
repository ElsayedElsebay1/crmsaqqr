import React from 'react';

const ThinkingSpinner: React.FC = () => (
    <div className="flex items-center space-x-1">
        <span className="text-sm text-slate-400 animate-pulse" style={{ animationDelay: '0s' }}>يفكر</span>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
);

export default ThinkingSpinner;
