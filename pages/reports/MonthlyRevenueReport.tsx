import React, { useMemo, useState } from 'react';
import { Invoice, InvoiceStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilePdfIcon } from '../../components/icons/FilePdfIcon';

interface MonthlyRevenueReportProps {
  invoices: Invoice[];
}

const formatCurrencyShort = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return value.toString();
};

const MonthlyRevenueReport: React.FC<MonthlyRevenueReportProps> = ({ invoices }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredPaidInvoices = useMemo(() => {
    const allPaidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);

    if (!startDate || !endDate) {
        return allPaidInvoices;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    return allPaidInvoices.filter(inv => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= start && issueDate <= end;
    });
  }, [invoices, startDate, endDate]);

  const totalRevenue = filteredPaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const monthlyRevenueData = useMemo(() => {
    const monthlyData: Record<string, number> = {};

    filteredPaidInvoices.forEach(inv => {
      const date = new Date(inv.issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + inv.amount;
    });
    
    return Object.keys(monthlyData)
      .sort()
      .map((key) => {
          const [year, month] = key.split('-');
          const date = new Date(Number(year), Number(month) - 1, 15);
          const monthName = date.toLocaleString('ar-SA', { month: 'long' });
          return {
              label: `${monthName} ${year}`,
              revenue: monthlyData[key]
          };
      });
  }, [filteredPaidInvoices]);
  
  const handleExportPDF = async () => {
    const { downloadPDF } = await import('../../utils/pdf');
    if (filteredPaidInvoices.length === 0) {
        alert('لا توجد فواتير مدفوعة في الفترة المحددة للتصدير.');
        return;
    }
    const headers = ['تاريخ الاستحقاق', 'تاريخ الإصدار', 'المبلغ (SAR)', 'العميل', 'رقم الفاتورة'];
    const data = filteredPaidInvoices.map(inv => [
        inv.dueDate,
        inv.issueDate,
        new Intl.NumberFormat('ar-SA').format(inv.amount),
        inv.clientName,
        inv.id.toUpperCase(),
    ]);
    const period = (startDate && endDate) ? `${startDate}_to_${endDate}` : 'all-time';
    const filename = `monthly-revenue-report-${period}.pdf`;
    const title = `تقرير الإيرادات الشهرية ${startDate && endDate ? `من ${startDate} إلى ${endDate}` : '(كل الأوقات)'}`;
    downloadPDF(title, headers, data, filename);
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

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">تقرير الإيرادات الشهرية</h2>
      
      <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4 border border-slate-700">
        <span className="font-semibold text-slate-200 flex-shrink-0">تصفية حسب تاريخ الفاتورة:</span>
        <div className="flex items-center gap-2">
            <label htmlFor="revStartDate" className="text-sm text-slate-400">من</label>
            <input 
                type="date" 
                id="revStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="revEndDate" className="text-sm text-slate-400">إلى</label>
            <input 
                type="date" 
                id="revEndDate"
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

      <div className="bg-slate-800 p-4 rounded-lg mb-8">
          <p className="text-sm text-slate-400 text-center">الإيرادات في الفترة المحددة</p>
          <p className="text-4xl font-bold text-green-400 mt-2 text-center">
            {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(totalRevenue)}
          </p>
      </div>
      
      <div className="mt-10 bg-slate-800 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-slate-100 mb-6">مخطط الإيرادات الشهرية</h3>
        {monthlyRevenueData.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart
                data={monthlyRevenueData}
                margin={{ top: 5, right: 20, left: 10, bottom: 50 }}
              >
                <defs>
                    <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} angle={-35} textAnchor="end" height={60} interval={0} />
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

export default MonthlyRevenueReport;