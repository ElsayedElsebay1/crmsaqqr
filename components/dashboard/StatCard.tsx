import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  onClick?: () => void;
  isActive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description, onClick, isActive }) => {
  const baseClasses = "bg-slate-800/50 p-6 rounded-xl shadow-lg flex items-center gap-5 border border-slate-700 transition-all duration-300";
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-slate-800/80 hover:border-[#00B7C1]/50" : "";
  const activeClasses = isActive ? "ring-2 ring-[#00B7C1]" : "";

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${activeClasses}`} onClick={onClick}>
      <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-50 mt-1">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;