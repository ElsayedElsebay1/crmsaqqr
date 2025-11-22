import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Invoice, InvoiceStatus, NotificationType, UserRole, Quote, QuoteStatus } from '../../types';
import InvoicesTable from '../components/financials/InvoicesTable';
import QuotesTable from '../components/financials/QuotesTable';
import PaginationControls from '../components/PaginationControls';
import StatCard from '../components/dashboard/StatCard';
import { INVOICE_STATUSES, QUOTE_STATUSES } from '../../constants';
import { CurrencyIcon } from '../components/icons/CurrencyIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { ExclamationTriangleIcon } from '../components/icons/ExclamationTriangleIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { useStore } from '../store/store';
import { XCircleIcon } from '../components/icons/XCircleIcon';

type CardFilter = 'paid' | 'outstanding' | 'overdue' | null;
type ActiveTab = 'invoices' | 'quotes';

const FinancialsPage: React.FC = () => {
  const { 
    invoices, 
    quotes,
    deals,
    projects,
    currentUser,
    users,
    groups,
    permissions,
    searchQuery,
    initialFilter,
    clearInitialFilter,
    navigateToWithFilter,
    openInvoiceModal,
  } = useStore(state => ({
    invoices: state.invoices,
    quotes: state.quotes,
    deals: state.deals,
    projects: state.projects,
    currentUser: state.currentUser!,
    users: state.users,
    groups: state.groups,
    permissions: state.permissions!,
    searchQuery: state.searchQuery,
    initialFilter: state.initialFilter,
    clearInitialFilter: state.clearInitialFilter,
    navigateToWithFilter: state.navigateToWithFilter,
    openInvoiceModal: state.openInvoiceModal,
  }));

  const [activeTab, setActiveTab] = useState<ActiveTab>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'issueDate', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (initialFilter && initialFilter.page === 'financials') {
      const { status } = initialFilter.filter;
      if (status) {
        setActiveTab('invoices');
        setStatusFilter(status);
      }
      clearInitialFilter();
    }
  }, [initialFilter, clearInitialFilter]);

  const { visibleInvoices, visibleQuotes } = useMemo(() => {
    const userRole = currentUser.role;
    if (userRole === UserRole.Admin || userRole === UserRole.Finance) {
        return { visibleInvoices: invoices, visibleQuotes: quotes };
    }

    const isManager = userRole === UserRole.Manager;
    const managerGroupMembers = isManager 
        ? users.filter(u => u.groupId === currentUser.groupId).map(u => u.id)
        : [];

    const visibleDealIds = new Set(deals.filter(deal => {
        if (currentUser.scope !== 'ALL' && deal.scope !== currentUser.scope) return false;
        if (isManager) return managerGroupMembers.includes(deal.ownerId);
        return deal.ownerId === currentUser.id;
    }).map(d => d.id));

    const visibleProjectIds = new Set(projects.filter(project => {
        if (currentUser.scope !== 'ALL' && project.scope !== currentUser.scope) return false;
        if (isManager && project.projectManagerId) return managerGroupMembers.includes(project.projectManagerId);
        if (userRole === UserRole.ProjectManager) return project.projectManagerId === currentUser.id;
        if (project.dealId) return visibleDealIds.has(project.dealId);
        return false;
    }).map(p => p.id));
    
    const visInvoices = invoices.filter(inv => {
        if (inv.dealId && visibleDealIds.has(inv.dealId)) return true;
        if (inv.projectId && visibleProjectIds.has(inv.projectId)) return true;
        if (inv.ownerId === currentUser.id) return true;
        return false;
    });

    const visQuotes = quotes.filter(q => q.dealId && visibleDealIds.has(q.dealId));

    return { visibleInvoices: visInvoices, visibleQuotes: visQuotes };
  }, [invoices, quotes, deals, projects, currentUser, users, groups]);
  
  const { totalRevenue, totalOutstanding, totalOverdue, totalPendingQuotes } = useMemo(() => {
    let revenue = 0, outstanding = 0, overdue = 0;
    
    visibleInvoices.forEach(inv => {
        if (inv.status === InvoiceStatus.PAID) revenue += inv.amount;
        else if (inv.status === InvoiceStatus.OVERDUE) overdue += inv.amount;
        else if (inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.DRAFT) outstanding += inv.amount;
    });

    const pendingQuotes = visibleQuotes
        .filter(q => q.status === QuoteStatus.DRAFT || q.status === QuoteStatus.SENT)
        .reduce((sum, q) => sum + q.total, 0);
    
    return { totalRevenue: revenue, totalOutstanding: outstanding, totalOverdue: overdue, totalPendingQuotes: pendingQuotes };
  }, [visibleInvoices, visibleQuotes]);


  const { filteredItems, totalItems } = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (activeTab === 'invoices') {
        const filtered = visibleInvoices.filter(inv => {
            const searchMatch = !lowercasedQuery || inv.clientName.toLowerCase().includes(lowercasedQuery) || inv.id.toLowerCase().includes(lowercasedQuery);
            const statusMatch = !statusFilter || inv.status === statusFilter;
            return statusMatch && searchMatch;
        });
        return { filteredItems: filtered, totalItems: filtered.length };
    } else { // quotes
        const filtered = visibleQuotes.filter(q => {
            const searchMatch = !lowercasedQuery || q.clientName.toLowerCase().includes(lowercasedQuery) || q.quoteNumber.toLowerCase().includes(lowercasedQuery);
            const statusMatch = !statusFilter || q.status === statusFilter;
            return statusMatch && searchMatch;
        });
        return { filteredItems: filtered, totalItems: filtered.length };
    }
  }, [visibleInvoices, visibleQuotes, statusFilter, searchQuery, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
    setSortConfig({ key: 'issueDate', direction: 'descending' });
    if (!initialFilter) { // Don't clear filter if we just navigated here
        setStatusFilter('');
    }
  }, [activeTab, searchQuery]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof (Invoice | Quote)];
        const bValue = b[sortConfig.key as keyof (Invoice | Quote)];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleCardClick = (filter: InvoiceStatus) => {
    setActiveTab('invoices');
    setStatusFilter(prev => prev === filter ? '' : filter);
  };

  const statusOptions = activeTab === 'invoices' ? INVOICE_STATUSES : QUOTE_STATUSES;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">نظرة عامة على المالية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<CurrencyIcon className="w-8 h-8 text-green-400" />} title="إجمالي الإيرادات" value={`${new Intl.NumberFormat('ar-SA').format(totalRevenue)} SAR`} description="مجموع الفواتير المدفوعة" onClick={() => handleCardClick(InvoiceStatus.PAID)} isActive={statusFilter === InvoiceStatus.PAID && activeTab === 'invoices'} />
            <StatCard icon={<ClockIcon className="w-8 h-8 text-yellow-400" />} title="المبالغ المستحقة" value={`${new Intl.NumberFormat('ar-SA').format(totalOutstanding)} SAR`} description="فواتير مرسلة أو مسودات" onClick={() => handleCardClick(InvoiceStatus.SENT)} isActive={statusFilter === InvoiceStatus.SENT && activeTab === 'invoices'} />
            <StatCard icon={<ExclamationTriangleIcon className="w-8 h-8 text-red-400" />} title="المبالغ المتأخرة" value={`${new Intl.NumberFormat('ar-SA').format(totalOverdue)} SAR`} description="فواتير تجاوزت الاستحقاق" onClick={() => handleCardClick(InvoiceStatus.OVERDUE)} isActive={statusFilter === InvoiceStatus.OVERDUE && activeTab === 'invoices'} />
            <StatCard icon={<DocumentTextIcon className="w-8 h-8 text-blue-400" />} title="قيمة عروض الأسعار" value={`${new Intl.NumberFormat('ar-SA').format(totalPendingQuotes)} SAR`} description="عروض أسعار بانتظار الموافقة" />
        </div>
      </div>
      
      <div className="flex border-b border-[#2C3E5F] mb-6">
        <button onClick={() => setActiveTab('invoices')} className={`py-3 px-6 text-sm font-semibold transition-colors ${activeTab === 'invoices' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-slate-400 hover:text-white'}`}>الفواتير</button>
        <button onClick={() => setActiveTab('quotes')} className={`py-3 px-6 text-sm font-semibold transition-colors ${activeTab === 'quotes' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-slate-400 hover:text-white'}`}>عروض الأسعار</button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]">
            <option value="">كل الحالات</option>
            {statusOptions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="flex items-center gap-1 text-sm text-[#00B7C1] hover:underline">
                <XCircleIcon className="w-4 h-4"/>
                <span>إلغاء الفلتر</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeTab === 'invoices' && permissions.invoices.create && (
                <button onClick={() => openInvoiceModal(null, true)} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span className="hidden sm:inline">إنشاء فاتورة</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
        {activeTab === 'invoices' ? (
            <InvoicesTable invoices={paginatedItems as Invoice[]} onEdit={openInvoiceModal} requestSort={requestSort} sortConfig={sortConfig as any} />
        ) : (
            <QuotesTable quotes={paginatedItems as Quote[]} requestSort={requestSort} sortConfig={sortConfig as any} />
        )}
        {totalPages > 0 && (
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }} totalItems={totalItems} />
        )}
      </div>
    </>
  );
};

export default FinancialsPage;