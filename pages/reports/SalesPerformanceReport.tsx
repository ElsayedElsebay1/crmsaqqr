import React, { useMemo, useState } from 'react';
import { Deal, DealStatus, Invoice, InvoiceStatus, User } from '../../types';
import { FilePdfIcon } from '../../components/icons/FilePdfIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesPerformanceReportProps {
  deals: Deal[];
  invoices: Invoice[];
  users: User[]; // Add users to props
}

const formatCurrencyShort = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-3 border border-slate-700 rounded-md shadow-lg">
          <p className="label text-slate-200 font-semibold">{`${label}`}</p>
          <p className="intro text-teal-400">{`الإيرادات : ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

const SalesPerformanceReport: React.FC<SalesPerformanceReportProps> = ({ deals, invoices, users }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

  const { filteredWonDeals, filteredPaidInvoices } = useMemo(() => {
    const allWonDeals = deals.filter(d => d.status === DealStatus.WON);
    const allPaidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);

    if (!startDate || !endDate) {
        return { 
            filteredWonDeals: allWonDeals,
            filteredPaidInvoices: allPaidInvoices
        };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day in the range

    const paidInvoicesInRange = allPaidInvoices.filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= start && issueDate <= end;
    });

    const dealIdsFromInvoices = new Set(paidInvoicesInRange.map(inv => inv.dealId).filter(id => id !== null));

    // A won deal is considered within the period if its corresponding paid invoice was issued in that period.
    const wonDealsInRange = allWonDeals.filter(deal => 
        dealIdsFromInvoices.has(deal.id)
    );

    return {
        filteredWonDeals: wonDealsInRange,
        filteredPaidInvoices: paidInvoicesInRange
    };
  }, [deals, invoices, startDate, endDate]);

  const allTimeLostDealsCount = deals.filter(d => d.status === DealStatus.LOST).length;
  
  // Stats for the selected period
  const totalRevenue = filteredPaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const dealsWonInPeriod = filteredWonDeals.length;
  const averageDealSize = dealsWonInPeriod > 0 ? filteredWonDeals.reduce((sum, deal) => sum + deal.value, 0) / dealsWonInPeriod : 0;


  const monthlyRevenueData = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    filteredPaidInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      // Format as "YYYY-MM" to group by month
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + inv.amount;
    });
    
    // Sort and format for the chart
    return Object.keys(monthlyData)
      .sort()
      .map((key) => {
          const [year, month] = key.split('-');
          const date = new Date(Number(year), Number(month) - 1, 15); // Use day 15 to avoid timezone issues
          const monthName = date.toLocaleString('ar-SA', { month: 'long' });
          return {
              label: `${monthName} ${year}`,
              revenue: monthlyData[key]
          };
      });
  }, [filteredPaidInvoices]);

  const handleExportPDF = async () => {
    const { downloadPDF } = await import('../../utils/pdf');
    if (filteredWonDeals.length === 0) {
        alert('لا توجد بيانات للصفقات الرابحة في الفترة المحددة للتصدير.');
        return;
    }
    const headers = ['مدير المشروع', 'جهة الاتصال', 'قيمة الصفقة (SAR)', 'الشركة', 'عنوان الفرصة'];
    const data = filteredWonDeals.map(deal => [
        usersMap.get(deal.projectManagerId || '')?.name || 'N/A',
        deal.contactPerson,
        new Intl.NumberFormat('ar-SA').format(deal.value),
        deal.companyName,
        deal.title,
    ]);
    const period = (startDate && endDate) ? `${startDate}_to_${endDate}` : 'all-time';
    const filename = `sales-performance-report-${period}.pdf`;
    const title = `تقرير أداء المبيعات ${startDate && endDate ? `من ${startDate} إلى ${endDate}`: '(كل الأوقات)'}`;
    downloadPDF(title, headers, data, filename);
  };


  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">تقرير أداء المبيعات</h2>
      
      <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4 border border-slate-700">
        <span className="font-semibold text-slate-200 flex-shrink-0">تصفية حسب تاريخ الفاتورة:</span>
        <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-sm text-slate-400">من</label>
            <input 
                type="date" 
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-sm text-slate-400">إلى</label>
            <input 
                type="date" 
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
        {(startDate || endDate) && (
            <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm"
            >
                مسح
            </button>
        )}
         <button
            onClick={handleExportPDF}
            className="ml-auto btn btn-secondary !p-2 flex items-center gap-2"
            title="تصدير كملف PDF"
        >
            <FilePdfIcon className="h-5 w-5" />
            <span className="hidden sm:inline">تصدير</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">الإيرادات في الفترة المحددة</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(totalRevenue)}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">الصفقات الرابحة في الفترة</p>
          <p className="text-3xl font-bold text-teal-400 mt-2">{dealsWonInPeriod}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">متوسط قيمة الصفقة (في الفترة)</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(averageDealSize)}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">الصفقات الخاسرة (الإجمالي)</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{allTimeLostDealsCount}</p>
        </div>
      </div>
      
      <div className="mt-10 bg-slate-800 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-slate-100 mb-6">اتجاه الإيرادات الشهرية (الفواتير المدفوعة)</h3>
        {monthlyRevenueData.length > 0 ? (
           <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
                <BarChart
                    data={monthlyRevenueData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.5}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickFormatter={formatCurrencyShort} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(71, 85, 105, 0.4)'}}/>
                    <Bar dataKey="revenue" name="الإيرادات" fill="url(#colorRevenueBar)" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-md">
            <p className="text-center text-slate-500">لا توجد بيانات إيرادات في الفترة المحددة لعرضها.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPerformanceReport;