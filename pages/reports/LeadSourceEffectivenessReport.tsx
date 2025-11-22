
import React from 'react';
import { Lead, LeadStatus } from '../../types';

interface LeadSourceEffectivenessReportProps {
  leads: Lead[];
}

const LeadSourceEffectivenessReport: React.FC<LeadSourceEffectivenessReportProps> = ({ leads }) => {
  const sources = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    if (!acc[source]) {
      acc[source] = { total: 0, converted: 0 };
    }
    acc[source].total += 1;
    if (lead.status === LeadStatus.CONVERTED) {
      acc[source].converted += 1;
    }
    return acc;
  }, {} as Record<string, { total: number, converted: number }>);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">تقرير فعالية مصادر العملاء</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">المصدر</th>
              <th scope="col" className="px-6 py-3">إجمالي العملاء المحتملين</th>
              <th scope="col" className="px-6 py-3">العملاء المحولون</th>
              <th scope="col" className="px-6 py-3">معدل التحويل</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(sources).map((source) => {
              const data = sources[source];
              const conversionRate = data.total > 0 ? (data.converted / data.total) * 100 : 0;
              return (
                <tr key={source} className="border-b border-slate-700">
                  <td className="px-6 py-4 font-medium text-slate-100">{source}</td>
                  <td className="px-6 py-4">{data.total}</td>
                  <td className="px-6 py-4">{data.converted}</td>
                  <td className="px-6 py-4">{conversionRate.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadSourceEffectivenessReport;
