import React, { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStatus, User } from '../../types';
import { LEAD_STATUSES } from '../../constants';
import StatCard from '../../components/dashboard/StatCard';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { DownloadIcon } from '../../components/icons/DownloadIcon';
import { FilePdfIcon } from '../../components/icons/FilePdfIcon';
import { downloadCSV } from '../../utils/csv';
import PaginationControls from '../../components/PaginationControls';

interface LeadsDetailReportProps {
  leads: Lead[];
  users: User[];
}

const getStatusChip = (status: LeadStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap";
    switch (status) {
        case LeadStatus.NEW: return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>جديد</span>;
        case LeadStatus.CONTACTED: return <span className={`${baseClasses} bg-purple-500/20 text-purple-300`}>تم التواصل</span>;
        case LeadStatus.QUALIFIED: return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>مؤهل</span>;
        case LeadStatus.NOT_INTERESTED: return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>غير مهتم</span>;
        case LeadStatus.CONVERTED: return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>تم تحويله</span>;
        default: return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
    }
};


const LeadsDetailReport: React.FC<LeadsDetailReportProps> = ({ leads, users }) => {
    const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
    const [userFilter, setUserFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const assignedUsers = useMemo(() => {
        const userIds = new Set(leads.map(lead => lead.ownerId));
        return users.filter(u => userIds.has(u.id));
    }, [leads, users]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const statusMatch = !statusFilter || lead.status === statusFilter;
            const userMatch = !userFilter || lead.ownerId === userFilter;
            return statusMatch && userMatch;
        });
    }, [leads, statusFilter, userFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, userFilter]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLeads, currentPage, itemsPerPage]);


    const totalLeads = filteredLeads.length;
    const convertedLeads = filteredLeads.filter(lead => lead.status === LeadStatus.CONVERTED).length;
    
    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            alert('لا توجد بيانات للتصدير بناءً على الفلاتر الحالية.');
            return;
        }

        const dataToExport = filteredLeads.map(lead => ({
            'اسم الشركة': lead.companyName,
            'جهة الاتصال': lead.contactPerson,
            'الحالة': LEAD_STATUSES.find(s => s.id === lead.status)?.title || lead.status,
            'المسؤول': usersMap.get(lead.ownerId)?.name || lead.ownerId,
            'المصدر': lead.source,
            'البريد الإلكتروني': lead.email,
            'الهاتف': lead.phone,
            'ملاحظات': lead.activity.map(a => `[${a.type}] ${a.content}`).join('; '),
        }));

        const today = new Date().toISOString().split('T')[0];
        downloadCSV(`leads-detail-report-${today}.csv`, dataToExport);
    };

    const handleExportPDF = async () => {
        const { downloadPDF } = await import('../../utils/pdf');
        if (filteredLeads.length === 0) {
            alert('لا توجد بيانات للتصدير بناءً على الفلاتر الحالية.');
            return;
        }
        const headers = ['المصدر', 'المسؤول', 'الحالة', 'جهة الاتصال', 'اسم الشركة'];
        const data = filteredLeads.map(lead => [
            lead.source,
            usersMap.get(lead.ownerId)?.name || lead.ownerId,
            LEAD_STATUSES.find(s => s.id === lead.status)?.title || lead.status,
            lead.contactPerson,
            lead.companyName,
        ]);
        const today = new Date().toISOString().split('T')[0];
        downloadPDF('التقرير التفصيلي للعملاء المحتملين', headers, data, `leads-detail-report-${today}.pdf`);
    };


    return (
        <div>
            <h2 className="text-xl font-bold text-slate-100 mb-6">تقرير تفاصيل العملاء المحتملين</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <StatCard 
                    icon={<UserGroupIcon className="w-8 h-8 text-purple-400" />}
                    title="إجمالي العملاء (حسب الفلتر)"
                    value={String(totalLeads)}
                    description="العدد الإجمالي للعملاء المحتملين"
                />
                 <StatCard 
                    icon={<TrophyIcon className="w-8 h-8 text-green-400" />}
                    title="العملاء المحولون (حسب الفلتر)"
                    value={String(convertedLeads)}
                    description="العملاء الذين تحولوا إلى فرص بيعية"
                />
            </div>

            <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4 border border-slate-700">
                <span className="font-semibold text-slate-200 flex-shrink-0">تصفية النتائج:</span>
                <div className="w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">كل الحالات</option>
                        {LEAD_STATUSES.map(status => (
                            <option key={status.id} value={status.id}>{status.title}</option>
                        ))}
                    </select>
                </div>
                 <div className="w-full sm:w-auto">
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">كل المسؤولين</option>
                        {assignedUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                 <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="btn btn-secondary"
                    >
                        <DownloadIcon className="h-5 w-5" />
                        <span>CSV</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="btn btn-secondary"
                    >
                        <FilePdfIcon className="h-5 w-5" />
                        <span>PDF</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">اسم الشركة</th>
                                <th scope="col" className="px-6 py-3">جهة الاتصال</th>
                                <th scope="col" className="px-6 py-3">الحالة</th>
                                <th scope="col" className="px-6 py-3">المسؤول</th>
                                <th scope="col" className="px-6 py-3">المصدر</th>
                                <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeads.map(lead => (
                                <tr key={lead.id} className="border-b border-slate-700">
                                    <td className="px-6 py-4 font-medium text-slate-100">{lead.companyName}</td>
                                    <td className="px-6 py-4">{lead.contactPerson}</td>
                                    <td className="px-6 py-4">{getStatusChip(lead.status)}</td>
                                    <td className="px-6 py-4">{usersMap.get(lead.ownerId)?.name || lead.ownerId}</td>
                                    <td className="px-6 py-4">{lead.source}</td>
                                    <td className="px-6 py-4">{lead.email}</td>
                                </tr>
                            ))}
                             {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500">
                                        لا توجد بيانات تطابق معايير البحث.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        totalItems={filteredLeads.length}
                        pageSizeOptions={[15, 30, 50]}
                    />
                )}
            </div>
        </div>
    );
};

export default LeadsDetailReport;