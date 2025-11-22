import React, { useState } from 'react';
import { useStore } from '../store/store';
import SalesPerformanceReport from './reports/SalesPerformanceReport';
import LeadSourceEffectivenessReport from './reports/LeadSourceEffectivenessReport';
import ProjectCompletionReport from './reports/ProjectCompletionReport';
import LeadsDetailReport from './reports/LeadsDetailReport';
import EmployeePerformanceReport from './reports/EmployeePerformanceReport';
import TeamPerformanceReport from './reports/TeamPerformanceReport';
import MonthlyRevenueReport from './reports/MonthlyRevenueReport';
import UserActivityLog from './reports/UserActivityLog';
import ContactActivityReport from './reports/ContactActivityReport';
import SalesFunnelReport from './reports/SalesFunnelReport';

type ReportType = 'sales' | 'salesFunnel' | 'monthlyRevenue' | 'employee' | 'teamPerformance' | 'leads' | 'leadsDetail' | 'projects' | 'userActivity' | 'contactActivity';

const ReportsPage: React.FC = () => {
  const { deals, leads, projects, invoices, users, roles, activityLog, groups } = useStore(state => ({
    deals: state.deals,
    leads: state.leads,
    projects: state.projects,
    invoices: state.invoices,
    users: state.users,
    roles: state.roles,
    activityLog: state.activityLog,
    groups: state.groups,
  }));
  
  const [activeReport, setActiveReport] = useState<ReportType>('sales');

  const renderReport = () => {
    switch (activeReport) {
      case 'sales':
        return <SalesPerformanceReport deals={deals} invoices={invoices} users={users} />;
      case 'salesFunnel':
        return <SalesFunnelReport deals={deals} />;
      case 'monthlyRevenue':
        return <MonthlyRevenueReport invoices={invoices} />;
      case 'employee':
        return <EmployeePerformanceReport users={users} leads={leads} deals={deals} projects={projects} roles={roles} activityLog={activityLog} />;
      case 'teamPerformance':
        return <TeamPerformanceReport users={users} groups={groups} deals={deals} projects={projects} />;
      case 'leads':
        return <LeadSourceEffectivenessReport leads={leads} />;
      case 'leadsDetail':
        return <LeadsDetailReport leads={leads} users={users} />;
      case 'projects':
        return <ProjectCompletionReport projects={projects} />;
      case 'userActivity':
        return <UserActivityLog log={activityLog} users={users} roles={roles} />;
      case 'contactActivity':
        return <ContactActivityReport users={users} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">التقارير التحليلية</h1>
        <p className="text-slate-400">تحليلات معمقة لمساعدتك على اتخاذ قرارات أفضل.</p>
      </div>

      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-xl flex-wrap">
        <button
          onClick={() => setActiveReport('sales')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'sales' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          أداء المبيعات
        </button>
        <button
          onClick={() => setActiveReport('salesFunnel')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'salesFunnel' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          تحليل مسار المبيعات
        </button>
        <button
          onClick={() => setActiveReport('monthlyRevenue')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'monthlyRevenue' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          تفاصيل الإيرادات
        </button>
         <button
          onClick={() => setActiveReport('contactActivity')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'contactActivity' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          نشاط التواصل
        </button>
        <button
          onClick={() => setActiveReport('employee')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'employee' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          أداء الأفراد
        </button>
        <button
          onClick={() => setActiveReport('teamPerformance')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'teamPerformance' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          أداء الفرق
        </button>
        <button
          onClick={() => setActiveReport('leads')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'leads' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          مصادر العملاء
        </button>
         <button
          onClick={() => setActiveReport('leadsDetail')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'leadsDetail' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          تفاصيل العملاء
        </button>
        <button
          onClick={() => setActiveReport('projects')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'projects' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          إنجاز المشاريع
        </button>
        <button
          onClick={() => setActiveReport('userActivity')}
          className={`flex-grow px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeReport === 'userActivity' ? 'bg-[#00B7C1] text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          سجل نشاط المستخدمين
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl shadow-lg p-6">
        {renderReport()}
      </div>
    </div>
  );
};

export default ReportsPage;