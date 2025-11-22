import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Lead, LeadStatus, User, UserRole } from '../types';
import LeadsTable, { LeadColumnKey, ALL_LEAD_COLUMNS } from '../components/leads/LeadsTable';
import PaginationControls from '../components/PaginationControls';
import { LEAD_STATUSES, MARKETING_SERVICES } from '../constants';
import { downloadCSV } from '../utils/csv';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { FilePdfIcon } from '../components/icons/FilePdfIcon';
import { LinkIcon } from '../components/icons/LinkIcon';
import { useStore } from '../store/store';
import { TableCellsIcon } from '../components/icons/TableCellsIcon';
import { Bars3Icon } from '../components/icons/Bars3Icon';

const LEADS_TABLE_SETTINGS_KEY = 'saqqr_leads_table_settings';

type SortableLeadKey = Exclude<LeadColumnKey, 'actions'>;

interface LeadsTableSettings {
  sortConfig: { key: SortableLeadKey; direction: 'ascending' | 'descending' } | null;
  visibleColumns: Record<LeadColumnKey, boolean>;
  columnOrder: LeadColumnKey[];
}

const LEAD_STATUS_ORDER = LEAD_STATUSES.map(s => s.id);

const LeadsPage: React.FC = () => {
  const { 
    leads, 
    users, 
    currentUser, 
    permissions,
    saveLead,
    searchQuery,
    openLeadModal,
    openReassignLeadModal,
  } = useStore(state => ({
    leads: state.leads,
    users: state.users,
    currentUser: state.currentUser!,
    permissions: state.permissions!,
    saveLead: state.saveLead,
    searchQuery: state.searchQuery,
    openLeadModal: state.openLeadModal,
    openReassignLeadModal: state.openReassignLeadModal,
  }));

  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [conversionFilter, setConversionFilter] = useState<'all' | 'converted' | 'not_converted'>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for table settings
  const [sortConfig, setSortConfig] = useState<{ key: SortableLeadKey; direction: 'ascending' | 'descending' } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<LeadColumnKey, boolean>>(
    Object.keys(ALL_LEAD_COLUMNS).reduce((acc, key) => ({ ...acc, [key as LeadColumnKey]: true }), {} as Record<LeadColumnKey, boolean>)
  );
  const [columnOrder, setColumnOrder] = useState<LeadColumnKey[]>(
    Object.keys(ALL_LEAD_COLUMNS) as LeadColumnKey[]
  );
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const columnSelectorRef = useRef<HTMLDivElement>(null);
  const telesalesRoundRobinIndex = useRef(0);
  const dragItem = useRef<LeadColumnKey | null>(null);
  const dragOverItem = useRef<LeadColumnKey | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(LEADS_TABLE_SETTINGS_KEY);
      if (savedSettings) {
        const { sortConfig: savedSort, visibleColumns: savedColumns, columnOrder: savedOrder } = JSON.parse(savedSettings) as LeadsTableSettings;
        if (savedSort) setSortConfig(savedSort as any); // cast as any to handle old format
        if (savedColumns) {
           const newVisibleColumns = { ...visibleColumns };
           for (const key in savedColumns) {
             if (key in newVisibleColumns) {
               newVisibleColumns[key as LeadColumnKey] = savedColumns[key as LeadColumnKey];
             }
           }
           setVisibleColumns(newVisibleColumns);
        }
        if (savedOrder) {
            const allKeys = Object.keys(ALL_LEAD_COLUMNS) as LeadColumnKey[];
            const validSavedOrder = savedOrder.filter(key => allKeys.includes(key));
            const newKeys = allKeys.filter(key => !validSavedOrder.includes(key));
            setColumnOrder([...validSavedOrder, ...newKeys]);
        }
      }
    } catch (error) {
        console.error("Failed to load table settings from localStorage", error);
    }
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    try {
        const settings: LeadsTableSettings = { sortConfig, visibleColumns, columnOrder };
        localStorage.setItem(LEADS_TABLE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save table settings to localStorage", error);
    }
  }, [sortConfig, visibleColumns, columnOrder]);
  
  // Close column selector on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
            setIsColumnSelectorOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);
  
  const visibleLeads = useMemo(() => {
    if (currentUser.role === UserRole.Admin) return leads;
    const isManager = currentUser.role === UserRole.Manager;
    const managerGroupMembers = isManager ? users.filter(u => u.groupId === currentUser.groupId).map(u => u.id) : [];
    return leads.filter(lead => {
        if (currentUser.scope !== 'ALL' && lead.scope !== currentUser.scope) return false;
        if (isManager) return managerGroupMembers.includes(lead.ownerId);
        return lead.ownerId === currentUser.id;
    });
  }, [leads, currentUser, users]);

  const salesAndTelesalesUsers = useMemo(() => {
    return users.filter(u => u.role === UserRole.Sales || u.role === UserRole.Telesales);
  }, [users]);

  const filteredLeads = useMemo(() => {
    return visibleLeads.filter(lead => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        const statusMatch = !statusFilter || lead.status === statusFilter;
        const userMatch = !userFilter || lead.ownerId === userFilter;
        const conversionMatch = conversionFilter === 'all' ||
            (conversionFilter === 'converted' && lead.status === LeadStatus.CONVERTED) ||
            (conversionFilter === 'not_converted' && lead.status !== LeadStatus.CONVERTED);
        const searchMatch = !lowercasedQuery ||
            lead.companyName.toLowerCase().includes(lowercasedQuery) ||
            lead.contactPerson.toLowerCase().includes(lowercasedQuery);
        return statusMatch && userMatch && searchMatch && conversionMatch;
    });
  }, [visibleLeads, statusFilter, userFilter, searchQuery, conversionFilter]);

  const sortedLeads = useMemo(() => {
    let sortableItems = [...filteredLeads];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        let aValue: any;
        let bValue: any;

        switch (key) {
          case 'ownerId':
            aValue = usersMap.get(a.ownerId)?.name || '';
            bValue = usersMap.get(b.ownerId)?.name || '';
            break;
          case 'status':
            aValue = LEAD_STATUS_ORDER.indexOf(a.status);
            bValue = LEAD_STATUS_ORDER.indexOf(b.status);
            break;
          default:
            aValue = a[key];
            bValue = b[key];
            break;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue, 'ar') * direction;
        }

        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredLeads, sortConfig, usersMap]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, userFilter, searchQuery, conversionFilter]);
  
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  const handleSimulateNewLead = useCallback(() => {
    const telesalesUsers = users.filter(u => u.isActive && u.role === UserRole.Telesales && u.scope === currentUser.scope);
    if (telesalesUsers.length === 0) {
        alert("لا يوجد موظفو Telesales نشطون في نطاقك لإسناد العميل إليهم.");
        return;
    }
    const assignedUser = telesalesUsers[telesalesRoundRobinIndex.current % telesalesUsers.length];
    telesalesRoundRobinIndex.current += 1;
    const newLead: Lead = { id: `temp-${Date.now()}`, companyName: `شركة جديدة ${Math.floor(Math.random() * 1000)}`, contactPerson: 'شخص افتراضي', email: `contact@newcorp${Date.now()}.com`, phone: '05' + Math.random().toString().slice(2, 10), source: 'Website', status: LeadStatus.NEW, ownerId: assignedUser.id, scope: assignedUser.scope, services: ['seo'], activity: [{ id: `act-${Date.now()}`, type: 'NOTE', content: 'هذا العميل تم إنشاؤه تلقائيًا للمحاكاة من موقع الويب.', userId: 'system', timestamp: new Date().toISOString() }], lastUpdatedAt: new Date().toISOString() };
    saveLead(newLead, true);
  }, [users, saveLead, currentUser.scope]);

  const handleExportCSV = () => {
    const servicesMap = new Map(MARKETING_SERVICES.map(s => [s.id, s.name]));
    const dataToExport = sortedLeads.map(lead => {
        const owner = usersMap.get(lead.ownerId);
        return {
            'اسم الشركة': lead.companyName,
            'جهة الاتصال': lead.contactPerson,
            'البريد الإلكتروني': lead.email,
            'الهاتف': lead.phone,
            'المصدر': lead.source,
            'الحالة': LEAD_STATUSES.find(s => s.id === lead.status)?.title || lead.status,
            'المسؤول': owner ? owner.name : lead.ownerId,
            'الخدمات المطلوبة': lead.services.map(s_id => servicesMap.get(s_id) || s_id).join('; '),
            'الملاحظات': lead.activity.map(a => `[${a.type}] ${a.content}`).join('; '),
            'سبب عدم الاهتمام': lead.notInterestedReason || ''
        };
    });
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(`saqqr-crm-leads-${today}.csv`, dataToExport);
  };

  const handleExportPDF = async () => {
    const { downloadPDF } = await import('../utils/pdf');
    const servicesMap = new Map(MARKETING_SERVICES.map(s => [s.id, s.name]));
    const headers = ['الخدمات', 'المسؤول', 'الحالة', 'المصدر', 'جهة الاتصال', 'اسم الشركة'];
    const data = sortedLeads.map(lead => {
        const owner = usersMap.get(lead.ownerId);
        return [
            lead.services.map(s_id => servicesMap.get(s_id) || s_id).join(', '),
            owner ? owner.name : lead.ownerId,
            LEAD_STATUSES.find(s => s.id === lead.status)?.title || lead.status,
            lead.source,
            lead.contactPerson,
            lead.companyName,
        ];
    });
    const today = new Date().toISOString().split('T')[0];
    downloadPDF('تقرير العملاء المحتملين', headers, data, `saqqr-crm-leads-${today}.pdf`);
  };

  const requestSort = useCallback((key: LeadColumnKey) => {
    if (key === 'actions') return;

    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const toggleColumnVisibility = (key: LeadColumnKey) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleColumnDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
        dragItem.current = null;
        dragOverItem.current = null;
        return;
    };

    setColumnOrder(prevOrder => {
        const newOrder = [...prevOrder];
        const dragItemIndex = newOrder.indexOf(dragItem.current!);
        const dragOverItemIndex = newOrder.indexOf(dragOverItem.current!);

        const [reorderedItem] = newOrder.splice(dragItemIndex, 1);
        newOrder.splice(dragOverItemIndex, 0, reorderedItem);
        
        return newOrder;
    });

    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <>
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
        {/* Left side: Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full">
            <select
                id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
                className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
            >
                <option value="">كل الحالات</option>
                {LEAD_STATUSES.map(status => (<option key={status.id} value={status.id}>{status.title}</option>))}
            </select>
             <select
                id="conversion-filter" value={conversionFilter} onChange={(e) => setConversionFilter(e.target.value as any)}
                className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
            >
                <option value="all">كل حالات التحويل</option>
                <option value="converted">محول</option>
                <option value="not_converted">غير محول</option>
            </select>
            {currentUser.role !== UserRole.Telesales && (
              <select
                  id="user-filter" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
              >
                  <option value="">كل المسؤولين</option>
                  {salesAndTelesalesUsers.map(user => (<option key={user.id} value={user.id}>{user.name}</option>))}
              </select>
            )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-end flex-shrink-0">
            <button onClick={handleSimulateNewLead} className="btn btn-secondary !p-2" title="محاكاة وصول عميل جديد من الموقع"><LinkIcon className="h-5 w-5" /></button>
            <button onClick={handleExportCSV} className="btn btn-secondary !p-2" title="تصدير CSV"><DownloadIcon className="h-5 w-5" /></button>
            <button onClick={handleExportPDF} className="btn btn-secondary !p-2" title="تصدير PDF"><FilePdfIcon className="h-5 w-5" /></button>
            <div className="relative" ref={columnSelectorRef}>
                <button onClick={() => setIsColumnSelectorOpen(prev => !prev)} className="btn btn-secondary !p-2" title="تخصيص الأعمدة"><TableCellsIcon className="h-5 w-5" /></button>
                {isColumnSelectorOpen && (
                    <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-[#1A2B4D] border border-[#3E527B] rounded-lg shadow-2xl p-2 z-10">
                        <p className="text-sm font-semibold px-2 pb-2 border-b border-[#3E527B]">الأعمدة المعروضة</p>
                        <div className="mt-2 space-y-1">
                            {columnOrder.map((key) => {
                                const { label } = ALL_LEAD_COLUMNS[key];
                                return (
                                    <div
                                        key={key}
                                        draggable
                                        onDragStart={() => (dragItem.current = key)}
                                        onDragEnter={() => (dragOverItem.current = key)}
                                        onDragEnd={handleColumnDragSort}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2C3E5F] cursor-grab group"
                                    >
                                        <Bars3Icon className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                                        <label className="flex items-center gap-2 cursor-pointer w-full">
                                            <input type="checkbox" checked={visibleColumns[key]} onChange={() => toggleColumnVisibility(key)} className="w-4 h-4 text-[#00B7C1] bg-slate-600 border-slate-500 rounded focus:ring-offset-[#1A2B4D] focus:ring-[#00B7C1]" />
                                            <span className="text-sm">{label}</span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {permissions.leads.create && (
                <button onClick={() => openLeadModal(null, true)} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span className="hidden sm:inline">إضافة عميل</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
        <LeadsTable 
            leads={paginatedLeads} 
            visibleColumns={visibleColumns}
            columnOrder={columnOrder}
            sortConfig={sortConfig}
            requestSort={requestSort}
            onEdit={openLeadModal}
            onReassignRequest={openReassignLeadModal}
        />
        {totalPages > 0 && (
          <PaginationControls
              currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage} onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
              totalItems={sortedLeads.length}
          />
        )}
      </div>
    </>
  );
};

export default LeadsPage;