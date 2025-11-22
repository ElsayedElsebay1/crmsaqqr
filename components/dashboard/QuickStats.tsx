import React from 'react';
import { Deal, Invoice, Task, DealStatus, InvoiceStatus, TaskStatus } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { useStore } from '../../store/store';

interface QuickStatsProps {
  deals: Deal[];
  invoices: Invoice[];
  tasks: Task[];
}

const StatItem: React.FC<{ icon: React.ReactNode; value: number; label: string; onClick: () => void; }> = ({ icon, value, label, onClick }) => (
  <button onClick={onClick} className="w-full text-right flex-1 flex items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700 gap-4 hover:bg-slate-800/80 hover:border-[var(--color-primary)] transition-all">
    <div className="p-3 rounded-lg bg-slate-700/50">
      {icon}
    </div>
    <div className="mr-2">
      <p className="text-3xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </button>
);

const QuickStats: React.FC<QuickStatsProps> = ({ deals, invoices, tasks }) => {
  const navigateToWithFilter = useStore(state => state.navigateToWithFilter);

  const openDeals = deals.filter(d => d.status !== DealStatus.WON && d.status !== DealStatus.LOST);
  const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;
  const today = new Date().toISOString().split('T')[0];
  const tasksDueToday = tasks.filter(t => t.status !== TaskStatus.DONE && t.dueDate === today).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatItem
        icon={<BriefcaseIcon className="w-7 h-7 text-blue-400" />}
        value={openDeals.length}
        label="فرص مفتوحة"
        onClick={() => navigateToWithFilter('deals', { statuses: openDeals.map(d => d.status) })}
      />
      <StatItem
        icon={<DocumentTextIcon className="w-7 h-7 text-red-400" />}
        value={overdueInvoices}
        label="فواتير متأخرة"
        onClick={() => navigateToWithFilter('financials', { status: InvoiceStatus.OVERDUE })}
      />
      <StatItem
        icon={<ClipboardListIcon className="w-7 h-7 text-yellow-400" />}
        value={tasksDueToday}
        label="مهام مستحقة اليوم"
        onClick={() => navigateToWithFilter('projects', { tasksDue: 'today' })}
      />
    </div>
  );
};

export default QuickStats;