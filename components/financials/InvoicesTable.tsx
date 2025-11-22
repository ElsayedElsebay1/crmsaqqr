import React from 'react';
import { Invoice, InvoiceStatus, UserRole } from '../../types';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { useStore } from '../../store/store';

interface InvoicesTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  requestSort: (key: keyof Invoice) => void;
  sortConfig: { key: keyof Invoice; direction: 'ascending' | 'descending' } | null;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, onEdit, requestSort, sortConfig }) => {
  const { currentUser, permissions } = useStore(state => ({
    currentUser: state.currentUser!,
    permissions: state.permissions!,
  }));

  const canUpdate = (invoice: Invoice) => {
    if (!permissions.invoices.update) return false;
    const { role, id } = currentUser;

    if (role === UserRole.Admin) return true;
    if (role === UserRole.Finance && invoice.ownerId === id) return true;
    
    return false;
  }

  const getStatusChip = (status: InvoiceStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case InvoiceStatus.DRAFT:
        return <span className={`${baseClasses} bg-slate-500/20 text-slate-300`}>مسودة</span>;
      case InvoiceStatus.SENT:
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>مرسلة</span>;
      case InvoiceStatus.PAID:
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>مدفوعة</span>;
      case InvoiceStatus.OVERDUE:
        return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>متأخرة</span>;
      default:
        return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
    }
  };

  const SortableHeader: React.FC<{
    columnKey: keyof Invoice;
    title: string;
    className?: string;
  }> = ({ columnKey, title, className }) => {
      const isSorted = sortConfig?.key === columnKey;
      const direction = isSorted ? sortConfig.direction : null;

      return (
          <th scope="col" className={`px-6 py-3 ${className || ''}`}>
              <button
                  onClick={() => requestSort(columnKey)}
                  className="flex items-center gap-1 text-xs uppercase hover:text-slate-100 transition-colors"
                  aria-label={`Sort by ${title}`}
              >
                  {title}
                  <span className="w-4 inline-flex justify-center items-center">
                      {isSorted ? (direction === 'ascending' ? '↑' : '↓') : <span className="text-slate-500">↕</span>}
                  </span>
              </button>
          </th>
      );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
          <tr>
            <SortableHeader columnKey="id" title="رقم الفاتورة" />
            <SortableHeader columnKey="clientName" title="العميل" />
            <SortableHeader columnKey="amount" title="السعر" />
            <SortableHeader columnKey="status" title="الحالة" />
            <SortableHeader columnKey="issueDate" title="تاريخ الإصدار" className="hidden sm:table-cell" />
            <SortableHeader columnKey="dueDate" title="تاريخ الاستحقاق" className="hidden sm:table-cell" />
            <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const userCanUpdate = canUpdate(invoice);
            return (
                <tr key={invoice.id} className="border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40">
                <th scope="row" className="px-6 py-4 font-medium text-slate-100 whitespace-nowrap flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                    <span>{invoice.id.toUpperCase()}</span>
                </th>
                <td className="px-6 py-4">{invoice.clientName}</td>
                <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-[#00B7C1]">{new Intl.NumberFormat('ar-SA').format(invoice.amount)} SAR</span>
                </td>
                <td className="px-6 py-4">{getStatusChip(invoice.status)}</td>
                <td className="px-6 py-4 hidden sm:table-cell">{invoice.issueDate}</td>
                <td className="px-6 py-4 hidden sm:table-cell">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-center">
                    <button 
                    onClick={() => onEdit(invoice)}
                    className="font-medium text-blue-400 hover:underline">
                        {userCanUpdate ? 'عرض / تعديل' : 'عرض'}
                    </button>
                </td>
                </tr>
            )
          })}
           {invoices.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-slate-500">
                لا توجد فواتير لعرضها.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;