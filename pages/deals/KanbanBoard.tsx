import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { STAGES, LEAD_SOURCES } from '../../constants';
import { Deal, DealStatus, PaymentStatus, Invoice, UserRole, User } from '../../types';
import KanbanColumn from '../../components/deals/KanbanColumn';
import { DownloadIcon } from '../../components/icons/DownloadIcon';
import { downloadCSV } from '../../utils/csv';
import { useStore } from '../../store/store';
import { FunnelIcon } from '../../components/icons/FunnelIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';

interface KanbanBoardProps {}

const KanbanBoard: React.FC<KanbanBoardProps> = () => {
  const { 
    allDeals, 
    allInvoices, 
    currentUser,
    users,
    groups,
    permissions,
    searchQuery,
    initialFilter,
    clearInitialFilter,
    openDealModal,
    openReasonForLossModal,
    moveDeal,
    openConfirmationModal,
  } = useStore(state => ({
    allDeals: state.deals,
    allInvoices: state.invoices,
    currentUser: state.currentUser!,
    users: state.users,
    groups: state.groups,
    permissions: state.permissions!,
    searchQuery: state.searchQuery,
    initialFilter: state.initialFilter,
    clearInitialFilter: state.clearInitialFilter,
    openDealModal: state.openDealModal,
    openReasonForLossModal: state.openReasonForLossModal,
    moveDeal: state.moveDeal,
    openConfirmationModal: state.openConfirmationModal,
  }));

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedDealSnapshot, setDraggedDealSnapshot] = useState<Deal | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ column: DealStatus; beforeId: string | null } | null>(null);
  const [viewFilter, setViewFilter] = useState<string>('my'); // 'my', 'all', or a group ID
  const [statusFilter, setStatusFilter] = useState<DealStatus[] | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('');

  useEffect(() => {
    if (initialFilter && initialFilter.page === 'deals') {
      if (initialFilter.filter.statuses) {
        // Set filter from dashboard click
        setStatusFilter(Array.from(new Set(initialFilter.filter.statuses)) as DealStatus[]);
      }
      clearInitialFilter();
    }
  }, [initialFilter, clearInitialFilter]);

  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);
  
  const visibleDeals = useMemo(() => {
    if (currentUser.role === UserRole.Admin) {
        return allDeals;
    }

    const isManager = currentUser.role === UserRole.Manager;
    const managerGroupMembers = isManager 
        ? users.filter(u => u.groupId === currentUser.groupId).map(u => u.id)
        : [];

    return allDeals.filter(deal => {
        if (currentUser.scope !== 'ALL' && deal.scope !== currentUser.scope) {
            return false;
        }

        if (isManager) {
            return managerGroupMembers.includes(deal.ownerId);
        }
        
        return deal.ownerId === currentUser.id;
    });
  }, [allDeals, currentUser, users, groups]);
  
  const managedGroups = useMemo(() => {
    if (currentUser.role === UserRole.Manager) {
        return groups.filter(g => g.managerId === currentUser.id);
    }
    return [];
  }, [groups, currentUser]);

  const canChangeView = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Manager;

  const allSources = useMemo(() => {
    const sourcesFromDeals = new Set(allDeals.map(deal => deal.source).filter(Boolean));
    LEAD_SOURCES.forEach(s => sourcesFromDeals.add(s.name));
    return Array.from(sourcesFromDeals).sort();
  }, [allDeals]);

  useEffect(() => {
    if (currentUser.role === UserRole.Admin) {
        setViewFilter('all');
    } else if (currentUser.role === UserRole.Manager && managedGroups.length > 0) {
        setViewFilter(managedGroups[0].id);
    } else {
        setViewFilter('my');
    }
  }, [currentUser.role, managedGroups]);

  const canUpdate = useCallback((deal: Deal): boolean => {
    if (!permissions.deals.update) return false;
    if (currentUser.role === UserRole.Admin) return true;
    if (deal.ownerId === currentUser.id) return true;
    
    if (currentUser.role === UserRole.Manager) {
        const owner = usersMap.get(deal.ownerId);
        if (owner && owner.groupId === currentUser.groupId) {
            return true;
        }
    }
    return false;
  }, [permissions, currentUser, usersMap]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, deal: Deal) => {
    if (!canUpdate(deal)) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', deal.id);
    setDraggedItemId(deal.id);
    setDraggedDealSnapshot(JSON.parse(JSON.stringify(deal))); // Store a deep copy snapshot
    const currentTarget = e.currentTarget;
    setTimeout(() => {
        currentTarget.classList.add('dragging-widget');
    }, 0);
  }, [canUpdate]);
  
  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).classList.remove('dragging-widget');
    setDraggedItemId(null);
    setDropIndicator(null);
    setDraggedDealSnapshot(null); // Clear snapshot
  }, []);

  const proceedWithDrop = useCallback((dealId: string, targetColumn: DealStatus, beforeId: string | null) => {
    const currentDealState = allDeals.find(d => d.id === dealId);
    if (!currentDealState || !canUpdate(currentDealState)) return;

    const isEnteringWonColumn = currentDealState.status !== DealStatus.WON && targetColumn === DealStatus.WON;
    const isEnteringLostColumn = currentDealState.status !== DealStatus.LOST && targetColumn === DealStatus.LOST;

    if (isEnteringWonColumn) {
        openDealModal({ ...currentDealState, status: DealStatus.WON });
    } else if (isEnteringLostColumn) {
        openReasonForLossModal(currentDealState);
    } else {
        moveDeal(dealId, targetColumn, beforeId);
    }
  }, [allDeals, canUpdate, openDealModal, openReasonForLossModal, moveDeal]);


  const handleDrop = useCallback(() => {
    if (!draggedItemId || !dropIndicator || !draggedDealSnapshot) return;
    
    const currentDealState = allDeals.find(d => d.id === draggedItemId);

    const hasChanged = JSON.stringify(draggedDealSnapshot) !== JSON.stringify(currentDealState);

    const dropAction = () => proceedWithDrop(draggedItemId, dropIndicator.column, dropIndicator.beforeId);

    if (hasChanged) {
        openConfirmationModal(
            'تضارب في البيانات',
            <p>تم تحديث هذه الفرصة بواسطة مستخدم آخر أثناء سحبها. <br />هل تريد المتابعة والكتابة فوق التغييرات؟</p>,
            dropAction,
            'نعم، الكتابة فوق التغييرات',
            'إلغاء'
        );
    } else {
        dropAction();
    }
  }, [draggedItemId, dropIndicator, draggedDealSnapshot, allDeals, proceedWithDrop, openConfirmationModal]);

  const handleCardClick = useCallback((deal: Deal) => {
    openDealModal(deal);
  }, [openDealModal]);

  const handleOpenCreateModal = useCallback(() => {
    openDealModal(null, true);
  }, [openDealModal]);
  
  const filteredDeals = useMemo(() => {
    let dealsSource = visibleDeals;

    if (viewFilter === 'my') {
        dealsSource = dealsSource.filter(deal => deal.ownerId === currentUser.id);
    } else if (viewFilter !== 'all') { // It's a group ID
        const groupMemberIds = new Set(users.filter(u => u.groupId === viewFilter).map(u => u.id));
        dealsSource = dealsSource.filter(deal => groupMemberIds.has(deal.ownerId));
    }
    
    if (statusFilter) {
        const filterSet = new Set(statusFilter);
        dealsSource = dealsSource.filter(deal => filterSet.has(deal.status));
    }

    if (sourceFilter) {
        dealsSource = dealsSource.filter(deal => deal.source === sourceFilter);
    }

    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
        return dealsSource;
    }
    return dealsSource.filter(deal =>
        deal.companyName.toLowerCase().includes(lowercasedQuery) ||
        deal.contactPerson.toLowerCase().includes(lowercasedQuery) ||
        deal.title.toLowerCase().includes(lowercasedQuery)
    );
  }, [visibleDeals, viewFilter, statusFilter, searchQuery, currentUser.id, users, sourceFilter]);

  const handleExport = () => {
    const paymentStatusMap: Record<PaymentStatus, string> = {
        [PaymentStatus.PENDING]: 'قيد الانتظار',
        [PaymentStatus.PAID]: 'مدفوع',
        [PaymentStatus.PARTIAL]: 'مدفوع جزئياً',
    };

    const dataToExport = allDeals.map(deal => {
      const manager = usersMap.get(deal.projectManagerId || '');
      return {
        'عنوان الفرصة': deal.title,
        'اسم الشركة': deal.companyName,
        'قيمة الصفقة (SAR)': deal.value,
        'المرحلة': STAGES.find(s => s.id === deal.status)?.title || deal.status,
        'جهة الاتصال': deal.contactPerson,
        'البريد الإلكتروني': deal.contactEmail,
        'الهاتف': deal.contactPhone,
        'المصدر': deal.source,
        'تاريخ الاجتماع القادم': deal.nextMeetingDate || '',
        'حالة الدفع': paymentStatusMap[deal.paymentStatus] || deal.paymentStatus,
        'مدير المشروع': manager ? manager.name : '',
        'الخدمات': deal.services.join('; '),
        'الملاحظات': (deal.activity || []).map(a => `[${a.type}] ${a.content}`).join('; ')
    }});
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(`saqqr-crm-deals-${today}.csv`, dataToExport);
  };


  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap order-2 sm:order-1">
            <h1 className="text-2xl font-bold text-white">لوحة الفرص البيعية</h1>
            {canChangeView && (
                <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-slate-400" />
                    <select
                        value={viewFilter}
                        onChange={(e) => setViewFilter(e.target.value)}
                        className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    >
                        <option value="my">فرصي الخاصة</option>
                        {currentUser.role === UserRole.Admin && (
                            <>
                                <option value="all">كل الفرص</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>فريق: {group.name}</option>
                                ))}
                            </>
                        )}
                        {currentUser.role === UserRole.Manager && (
                            managedGroups.map(group => (
                                <option key={group.id} value={group.id}>فريق: {group.name}</option>
                            ))
                        )}
                    </select>
                </div>
            )}
             <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-slate-400" />
                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    aria-label="Filter by source"
                >
                    <option value="">كل المصادر</option>
                    {allSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                    ))}
                </select>
            </div>
            {statusFilter && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-sm rounded-lg">
                    <span className="font-semibold text-slate-300">فلتر نشط: الفرص المفتوحة</span>
                     <button onClick={() => setStatusFilter(null)} className="text-slate-400 hover:text-white">
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
             <button
                onClick={handleExport}
                className="btn btn-secondary w-full sm:w-auto"
                >
                <DownloadIcon className="h-5 h-5" />
                <span>تصدير</span>
            </button>
            {permissions?.deals.create && (
                <button
                onClick={handleOpenCreateModal}
                className="btn btn-primary w-full sm:w-auto"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>إضافة فرصة</span>
                </button>
            )}
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={filteredDeals.filter(deal => deal.status === stage.id)}
            allInvoices={allInvoices}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onCardClick={handleCardClick}
            canUpdateDeal={canUpdate}
            dropIndicator={dropIndicator}
            setDropIndicator={setDropIndicator}
          />
        ))}
      </div>
    </>
  );
};

export default KanbanBoard;