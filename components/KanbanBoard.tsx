import React, { useCallback, useMemo } from 'react';
import { STAGES } from '../constants';
import { Deal, DealStatus, PaymentStatus, Invoice, User } from '../types';
import KanbanColumn from './KanbanColumn';
import { DownloadIcon } from './icons/DownloadIcon';
import { downloadCSV } from '../utils/csv';
import { useStore } from '../store/store';

interface KanbanBoardProps {}

const KanbanBoard: React.FC<KanbanBoardProps> = () => {
  const { 
    allDeals, 
    allInvoices,
    users,
    moveDeal,
    permissions,
    searchQuery,
    openDealModal,
  } = useStore(state => ({
    allDeals: state.deals,
    allInvoices: state.invoices,
    users: state.users,
    moveDeal: state.moveDeal,
    permissions: state.permissions,
    searchQuery: state.searchQuery,
    openDealModal: state.openDealModal,
  }));
  
  const canUpdateDeals = permissions?.deals.update ?? false;
  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

  const handleDragStart = useCallback((id: string, e: React.DragEvent<HTMLDivElement>) => {
    if (!canUpdateDeals) return;
    e.dataTransfer.setData('text/plain', id);
    const currentTarget = e.currentTarget;
    setTimeout(() => {
        currentTarget.classList.add('dragging-widget');
    }, 0);
  }, [canUpdateDeals]);
  
  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).classList.remove('dragging-widget');
  }, []);

  const handleDrop = useCallback((status: DealStatus, draggedItemId: string) => {
    if (!draggedItemId || !canUpdateDeals) return;

    const dealToUpdate = allDeals.find(d => d.id === draggedItemId);

    if (dealToUpdate) {
      if (status === DealStatus.WON) {
        openDealModal({ ...dealToUpdate, status: DealStatus.WON });
      } else {
        moveDeal(draggedItemId, status, null);
      }
    }
  }, [allDeals, moveDeal, canUpdateDeals, openDealModal]);

  const handleCardClick = useCallback((deal: Deal) => {
    openDealModal(deal);
  }, [openDealModal]);

  const handleOpenCreateModal = useCallback(() => {
    openDealModal(null, true);
  }, [openDealModal]);
  
  const filteredDeals = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
        return allDeals;
    }
    return allDeals.filter(deal =>
        deal.companyName.toLowerCase().includes(lowercasedQuery) ||
        deal.contactPerson.toLowerCase().includes(lowercasedQuery) ||
        deal.title.toLowerCase().includes(lowercasedQuery)
    );
  }, [allDeals, searchQuery]);

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
        'الملاحظات': deal.notes
    }});
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(`saqqr-crm-deals-${today}.csv`, dataToExport);
  };


  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white order-2 sm:order-1">لوحة الفرص البيعية</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
             <button
                onClick={handleExport}
                className="btn btn-secondary w-full sm:w-auto"
                >
                <DownloadIcon className="h-5 w-5" />
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
            canDragCards={canUpdateDeals}
          />
        ))}
      </div>
    </>
  );
};

export default KanbanBoard;