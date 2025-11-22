import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import * as api from '../../services/api';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { FireIcon } from '../../components/icons/FireIcon';

interface ContactActivityReportProps {
  users: User[];
}

const HeatmapCell: React.FC<{ count: number }> = ({ count }) => {
    const getColor = () => {
        if (count === 0) return 'bg-slate-700/30 hover:bg-slate-700/60';
        if (count <= 2) return 'bg-teal-900 hover:bg-teal-800';
        if (count <= 5) return 'bg-teal-700 hover:bg-teal-600';
        if (count <= 10) return 'bg-teal-500 hover:bg-teal-400';
        return 'bg-teal-300 hover:bg-teal-200';
    };

    return (
        <div 
            className={`w-full h-8 rounded-md flex items-center justify-center transition-colors ${getColor()}`}
            title={`${count} ${count > 0 ? 'نشاطات' : 'نشاط'}`}
        >
            {count > 0 && <span className="text-xs font-bold text-white mix-blend-difference">{count}</span>}
        </div>
    );
};

const ContactActivityReport: React.FC<ContactActivityReportProps> = ({ users }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [activityData, setActivityData] = useState<Record<string, Record<string, number>>>({});
    const [isLoading, setIsLoading] = useState(true);

    const salesUsers = useMemo(() => 
        users.filter(u => u.role === UserRole.Sales || u.role === UserRole.Telesales)
        .sort((a,b) => a.name.localeCompare(b.name)), 
    [users]);

    useEffect(() => {
        const fetchActivity = async () => {
            setIsLoading(true);
            const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
            const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
            try {
                const data = await api.fetchContactActivity(startOfMonth, endOfMonth);
                setActivityData(data);
            } catch (error) {
                console.error("Failed to fetch contact activity:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivity();
    }, [selectedMonth]);
    
    const daysInMonth = useMemo(() => 
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate(),
    [selectedMonth]);

    const changeMonth = (offset: number) => {
        setSelectedMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const calendarGrid = useMemo(() => {
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        return salesUsers.map(user => {
            const userActivity = activityData[user.id] || {};
            return {
                user,
                activities: days.map(day => {
                    const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return userActivity[dateKey] || 0;
                })
            };
        });
    }, [salesUsers, activityData, daysInMonth, selectedMonth]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <FireIcon className="w-6 h-6 text-orange-400" />
                    <span>خريطة نشاط التواصل</span>
                </h2>
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    <span className="font-semibold text-center w-32">{selectedMonth.toLocaleString('ar-SA', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <p className="text-sm text-slate-400 mb-4">
                عرض بياني لعدد الأنشطة (تحديث الملاحظات، تغيير الحالة، إلخ) على العملاء المحتملين والفرص لكل موظف خلال الشهر.
            </p>

            <div className="overflow-x-auto bg-slate-800/50 p-4 rounded-lg">
                <table className="w-full border-separate border-spacing-x-0.5 border-spacing-y-1">
                    <thead>
                        <tr>
                            <th className="p-2 text-right text-sm font-semibold text-slate-300 w-48 sticky left-0 bg-slate-800/50 z-10">الموظف</th>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                <th key={day} className="p-1 text-center text-xs font-normal text-slate-400 min-w-[32px]">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                             [...Array(salesUsers.length || 3)].map((_, userIndex) => (
                                <tr key={userIndex}>
                                    <td className="sticky left-0 bg-slate-800/50 z-10">
                                        <div className="h-8 bg-slate-700 rounded-md animate-pulse"></div>
                                    </td>
                                    {[...Array(daysInMonth)].map((_, dayIndex) => (
                                        <td key={dayIndex}><div className="h-8 bg-slate-700/50 rounded-md animate-pulse"></div></td>
                                    ))}
                                </tr>
                            ))
                        ) : calendarGrid.map(({ user, activities }) => (
                            <tr key={user.id}>
                                <td className="p-2 text-sm font-semibold text-slate-200 w-48 sticky left-0 bg-slate-800/50 z-10">{user.name}</td>
                                {activities.map((count, index) => (
                                    <td key={index} className="min-w-[32px]">
                                        <HeatmapCell count={count} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {salesUsers.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-slate-500">
                        <p>لا يوجد موظفو مبيعات أو Telesales لعرض نشاطهم.</p>
                    </div>
                )}
            </div>
             <div className="mt-4 flex justify-end items-center gap-4 text-sm">
                <span className="font-semibold text-slate-300">مفتاح الخريطة:</span>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-slate-700/30"></div>
                    <span className="text-slate-400">لا يوجد</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-teal-900"></div>
                    <span className="text-slate-400">قليل</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-teal-500"></div>
                    <span className="text-slate-400">متوسط</span>
                </div>
                 <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-teal-300"></div>
                    <span className="text-slate-400">مرتفع</span>
                </div>
            </div>
        </div>
    );
};

export default ContactActivityReport;