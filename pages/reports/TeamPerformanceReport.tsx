import React, { useMemo, useState } from 'react';
import { Deal, DealStatus, Group, Project, User } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CurrencyIcon } from '../../components/icons/CurrencyIcon';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';

interface TeamPerformanceReportProps {
  users: User[];
  groups: Group[];
  deals: Deal[];
  projects: Project[];
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

const TeamPerformanceReport: React.FC<TeamPerformanceReportProps> = ({ users, groups, deals, projects }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const teamPerformanceData = useMemo(() => {
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);

        return groups.map(group => {
            const memberIds = users.filter(u => u.groupId === group.id).map(u => u.id);
            if (!memberIds.includes(group.managerId)) {
                memberIds.push(group.managerId);
            }

            const projectDealIdsInMonth = new Set(
                projects
                    .filter(p => {
                        const startDate = new Date(p.startDate);
                        return startDate >= startOfMonth && startDate <= endOfMonth;
                    })
                    .map(p => p.dealId)
            );

            const dealsWonByTeam = deals.filter(d => 
                memberIds.includes(d.ownerId) &&
                d.status === DealStatus.WON &&
                projectDealIdsInMonth.has(d.id)
            );

            const totalRevenue = dealsWonByTeam.reduce((sum, deal) => sum + deal.value, 0);
            const dealsWonCount = dealsWonByTeam.length;
            const avgDealValue = dealsWonCount > 0 ? totalRevenue / dealsWonCount : 0;

            const memberPerformance = memberIds.map(id => {
                const memberDealsValue = dealsWonByTeam
                    .filter(d => d.ownerId === id)
                    .reduce((sum, d) => sum + d.value, 0);
                return { userId: id, totalValue: memberDealsValue };
            }).sort((a, b) => b.totalValue - a.totalValue);

            const topPerformerId = memberPerformance.length > 0 && memberPerformance[0].totalValue > 0 ? memberPerformance[0].userId : null;
            const topPerformer = topPerformerId ? users.find(u => u.id === topPerformerId) : null;

            return {
                group,
                manager: users.find(u => u.id === group.managerId),
                totalRevenue,
                dealsWonCount,
                avgDealValue,
                topPerformer
            };
        });
    }, [groups, users, deals, projects, selectedMonth]);

    const changeMonth = (offset: number) => {
        setSelectedMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const chartData = teamPerformanceData.map(team => ({
        name: team.group.name,
        الإيرادات: team.totalRevenue,
    }));

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-100">تقرير أداء الفرق</h2>
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    <span className="font-semibold text-center w-32">{selectedMonth.toLocaleString('ar-SA', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="mb-8 bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-6">مقارنة إيرادات الفرق</h3>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                 <defs>
                                    <linearGradient id="colorTeamRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.5}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tickFormatter={formatCurrencyShort} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(71, 85, 105, 0.4)'}}/>
                                <Bar dataKey="الإيرادات" fill="url(#colorTeamRevenue)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-10">لا توجد بيانات لعرضها في المخطط.</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamPerformanceData.map(({ group, manager, totalRevenue, dealsWonCount, avgDealValue, topPerformer }) => (
                    <div key={group.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-slate-100">{group.name}</h3>
                                <p className="text-sm text-slate-400">المدير: {manager?.name || 'غير محدد'}</p>
                            </div>
                            <UsersIcon className="w-8 h-8 text-slate-500" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                                <p className="text-sm text-slate-400">إجمالي الإيرادات</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrencyShort(totalRevenue)}</p>
                            </div>
                             <div className="bg-slate-900/50 p-3 rounded-lg">
                                <p className="text-sm text-slate-400">الصفقات الرابحة</p>
                                <p className="text-2xl font-bold text-[#00B7C1] mt-1">{dealsWonCount}</p>
                            </div>
                             <div className="bg-slate-900/50 p-3 rounded-lg">
                                <p className="text-sm text-slate-400">متوسط الصفقة</p>
                                <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrencyShort(avgDealValue)}</p>
                            </div>
                        </div>

                        {topPerformer && (
                            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3">
                                <TrophyIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-300">الأفضل أداءً هذا الشهر</p>
                                    <p className="text-sm text-slate-100">{topPerformer.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPerformanceReport;