import React, { useState, useMemo } from 'react';
import { Deal, Lead, Project, User, Role, LeadStatus, DealStatus, ActivityLogEntry, UserRole } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipboardListIcon } from '../../components/icons/ClipboardListIcon';


interface EmployeePerformanceReportProps {
  users: User[];
  leads: Lead[];
  deals: Deal[];
  projects: Project[];
  roles: Role[];
  activityLog: ActivityLogEntry[];
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);
    const barColor = cappedPercentage >= 100 ? 'bg-green-500' : 'bg-[#00B7C1]';

    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-300 ease-in-out`} 
                style={{ width: `${cappedPercentage}%` }}
            ></div>
        </div>
    );
};

interface PerformanceMetric {
    label: string;
    value: number;
    displayValue?: string;
    target: number;
    note: string;
}

const CustomCallsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 p-3 border border-slate-700 rounded-md shadow-lg">
          <p className="label text-slate-200 font-semibold">{`${label}`}</p>
          <p className="intro text-indigo-400">{`الأنشطة المسجلة: ${data['الأنشطة']}`}</p>
          {data.target > 0 && (
            <p className="intro text-slate-400">{`الهدف: ${data.target}`}</p>
          )}
        </div>
      );
    }
    return null;
};


const EmployeePerformanceReport: React.FC<EmployeePerformanceReportProps> = ({ users, leads, deals, projects, roles, activityLog }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const rolesMap = useMemo(() => new Map(roles.map(role => [role.id, role.name])), [roles]);

    const performanceData = useMemo(() => {
        const relevantUsers = users.filter(user => user.targets && (user.targets.monthlyCalls > 0 || user.targets.monthlyDeals > 0 || user.targets.monthlyRevenue > 0));
        
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);

        return relevantUsers.map(user => {
            const roleName = rolesMap.get(user.role) || 'Unknown Role';
            const metrics: PerformanceMetric[] = [];
            
            const projectDealIdsInMonth = new Set(
                projects
                    .filter(p => {
                        const startDate = new Date(p.startDate);
                        return startDate >= startOfMonth && startDate <= endOfMonth;
                    })
                    .map(p => p.dealId)
            );

            const dealsWonThisMonth = deals.filter(d => 
                d.ownerId === user.id && projectDealIdsInMonth.has(d.id) && d.status === DealStatus.WON
            );

            if (user.targets?.monthlyDeals > 0) {
                metrics.push({
                    label: 'الصفقات الرابحة',
                    value: dealsWonThisMonth.length,
                    target: user.targets.monthlyDeals,
                    note: 'بناءً على تاريخ بدء المشروع'
                });
            }
            
            if (user.targets?.monthlyRevenue > 0) {
                 const revenueThisMonth = dealsWonThisMonth.reduce((sum, deal) => sum + deal.value, 0);
                 metrics.push({
                    label: 'الإيرادات المحققة',
                    value: revenueThisMonth,
                    displayValue: new Intl.NumberFormat('ar-SA', { notation: 'compact' }).format(revenueThisMonth),
                    target: user.targets.monthlyRevenue,
                    note: 'من الصفقات الرابحة هذا الشهر'
                });
            }

            if (user.targets?.monthlyCalls > 0) {
                const leadActivitiesThisMonth = activityLog.filter(log => 
                    log.userId === user.id &&
                    new Date(log.timestamp) >= startOfMonth &&
                    new Date(log.timestamp) <= endOfMonth &&
                    log.action.includes('العميل المحتمل')
                ).length;

                metrics.push({
                    label: 'أنشطة العملاء',
                    value: leadActivitiesThisMonth,
                    target: user.targets.monthlyCalls,
                    note: 'تحديثات وحالات تواصل مع العملاء'
                });
            }
            
            return { user, roleName, metrics };
        });

    }, [users, leads, deals, projects, rolesMap, selectedMonth, activityLog]);

    const callsChartData = useMemo(() => {
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);

        const salesUsers = users.filter(user => user.role === UserRole.Sales || user.role === UserRole.Telesales);

        return salesUsers.map(user => {
            const callsThisMonth = activityLog.filter(log =>
                log.userId === user.id &&
                new Date(log.timestamp) >= startOfMonth &&
                new Date(log.timestamp) <= endOfMonth &&
                log.action.includes('العميل المحتمل')
            ).length;

            return {
                name: user.name.split(' ')[0], // Short name for the chart
                'الأنشطة': callsThisMonth,
                target: user.targets?.monthlyCalls || 0,
            };
        }).filter(data => data.target > 0 || data['الأنشطة'] > 0);

    }, [users, activityLog, selectedMonth]);


    const changeMonth = (offset: number) => {
        setSelectedMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-100">تقرير أداء الأفراد</h2>
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    <span className="font-semibold text-center w-32">{selectedMonth.toLocaleString('ar-SA', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceData.map(({ user, roleName, metrics }) => {
                    const userActivities = activityLog
                        .filter(log => log.userId === user.id)
                        .slice(0, 5);

                    return (
                        <div key={user.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-[#00B7C1] rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-600 flex-shrink-0">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-100">{user.name}</h3>
                                    <p className="text-sm text-slate-400">{roleName}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex-grow">
                                {metrics.map(metric => (
                                    <div key={metric.label}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div>
                                                <span className="text-sm font-medium text-slate-300">{metric.label}</span>
                                                <p className="text-xs text-slate-500" title={metric.note}>({metric.note})</p>
                                            </div>
                                            <span className="text-lg font-bold text-slate-200 font-mono">
                                                {metric.displayValue ?? metric.value} 
                                                <span className="text-sm text-slate-400"> / {new Intl.NumberFormat('ar-SA', { notation: 'compact' }).format(metric.target)}</span>
                                            </span>
                                        </div>
                                        <ProgressBar value={metric.value} max={metric.target} />
                                    </div>
                                ))}
                                {metrics.length === 0 && <p className="text-center text-slate-500 pt-4">لا توجد أهداف محددة لهذا المستخدم.</p>}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <ClipboardListIcon className="w-4 h-4 text-slate-400" />
                                    آخر الأنشطة
                                </h4>
                                {userActivities.length > 0 ? (
                                    <ul className="space-y-3 text-xs text-slate-400">
                                        {userActivities.map(activity => (
                                            <li key={activity.id} className="flex items-start gap-2">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0"></div>
                                                <div>
                                                    <p className="leading-snug">{activity.action}</p>
                                                    <p className="text-slate-500 text-[10px] mt-0.5">
                                                        {new Date(activity.timestamp).toLocaleString('ar-SA', { timeStyle: 'short', dateStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-slate-500 text-xs py-2">لا توجد أنشطة مسجلة.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
                 {performanceData.length === 0 && 
                    <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-slate-500 bg-slate-800 rounded-lg">
                        <p>لا يوجد موظفين لديهم أهداف محددة لعرض أدائهم.</p>
                    </div>
                 }
            </div>

             <div className="mt-10 bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-slate-100 mb-6">أنشطة المبيعات للشهر المحدد (مكالمات وتحديثات)</h3>
                {callsChartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={callsChartData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorCallsBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.5}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomCallsTooltip />} cursor={{fill: 'rgba(71, 85, 105, 0.4)'}}/>
                                <Bar dataKey="الأنشطة" fill="url(#colorCallsBar)" name="الأنشطة المسجلة" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-md">
                        <p className="text-center text-slate-500">لا توجد بيانات أنشطة لعرضها.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeePerformanceReport;