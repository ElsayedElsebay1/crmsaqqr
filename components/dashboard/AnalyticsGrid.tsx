import React from 'react';
import { Deal, Lead, Invoice, DealStatus, InvoiceStatus, LeadStatus } from '../../types';
import StatCard from './StatCard';
import { CurrencyIcon } from '../icons/CurrencyIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';


interface AnalyticsGridProps {
  deals: Deal[];
  leads: Lead[];
  invoices: Invoice[];
}

const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({ deals, leads, invoices }) => {
  
  // 1. Total Revenue (sum of all PAID invoices)
  const totalRevenue = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.amount, 0);

  // 2. Sales Pipeline Value (sum of all deals that are not WON or LOST)
  const pipelineValue = deals
    .filter(deal => deal.status !== DealStatus.WON && deal.status !== DealStatus.LOST)
    .reduce((sum, deal) => sum + deal.value, 0);

  // 3. Deal Win Rate
  const wonDeals = deals.filter(d => d.status === DealStatus.WON).length;
  const lostDeals = deals.filter(d => d.status === DealStatus.LOST).length;
  const totalClosedDeals = wonDeals + lostDeals;
  const winRate = totalClosedDeals > 0 ? (wonDeals / totalClosedDeals) * 100 : 0;
  
  // 4. Lead Conversion Rate
  const convertedLeads = leads.filter(l => l.status === LeadStatus.CONVERTED).length;
  const totalLeads = leads.length;
  const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<CurrencyIcon className="w-8 h-8 text-green-400" />}
        title="إجمالي الإيرادات"
        value={`${new Intl.NumberFormat('ar-SA').format(totalRevenue)} SAR`}
        description="مجموع الفواتير المدفوعة"
      />
      <StatCard
        icon={<ChartBarIcon className="w-8 h-8 text-blue-400" />}
        title="قيمة الفرص البيعية"
        value={`${new Intl.NumberFormat('ar-SA').format(pipelineValue)} SAR`}
        description="قيمة الصفقات قيد المتابعة"
      />
      <StatCard
        icon={<TrophyIcon className="w-8 h-8 text-yellow-400" />}
        title="معدل نجاح الصفقات"
        value={`${winRate.toFixed(1)}%`}
        description={`من إجمالي ${totalClosedDeals} صفقة مغلقة`}
      />
      <StatCard
        icon={<UserGroupIcon className="w-8 h-8 text-purple-400" />}
        title="معدل تحويل العملاء"
        value={`${leadConversionRate.toFixed(1)}%`}
        description={`${convertedLeads} من ${totalLeads} عميل محتمل`}
      />
    </div>
  );
};

export default AnalyticsGrid;
