import React from 'react';
import { Quote, QuoteStatus, Deal } from '../../types';
import { useStore } from '../../store/store';

interface QuotesTableProps {
  quotes: Quote[];
  requestSort: (key: keyof Quote) => void;
  sortConfig: { key: keyof Quote; direction: 'ascending' | 'descending' } | null;
}

const QuotesTable: React.FC<QuotesTableProps> = ({ quotes, requestSort, sortConfig }) => {
  const { openQuoteEditor, deals } = useStore(state => ({
    openQuoteEditor: state.openQuoteEditor,
    deals: state.deals,
  }));

  const getStatusChip = (status: QuoteStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case QuoteStatus.DRAFT:
        return <span className={`${baseClasses} bg-slate-500/20 text-slate-300`}>مسودة</span>;
      case QuoteStatus.SENT:
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>مرسل</span>;
      case QuoteStatus.ACCEPTED:
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>مقبول</span>;
      case QuoteStatus.REJECTED:
        return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>مرفوض</span>;
      default:
        return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
    }
  };
  
  const handleEdit = (quote: Quote) => {
    const deal = deals.find(d => d.id === quote.dealId);
    if (deal) {
        openQuoteEditor(deal, quote);
    }
  }

  const SortableHeader: React.FC<{
    columnKey: keyof Quote;
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
            <SortableHeader columnKey="quoteNumber" title="رقم العرض" />
            <SortableHeader columnKey="clientName" title="العميل" />
            <SortableHeader columnKey="total" title="الإجمالي" />
            <SortableHeader columnKey="status" title="الحالة" />
            <SortableHeader columnKey="issueDate" title="تاريخ الإصدار" className="hidden sm:table-cell" />
            <SortableHeader columnKey="expiryDate" title="تاريخ الانتهاء" className="hidden sm:table-cell" />
            <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.id} className="border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40">
              <th scope="row" className="px-6 py-4 font-medium text-slate-100 whitespace-nowrap">
                {quote.quoteNumber}
              </th>
              <td className="px-6 py-4">{quote.clientName}</td>
              <td className="px-6 py-4">
                <span className="font-mono font-semibold text-[#00B7C1]">{new Intl.NumberFormat('ar-SA').format(quote.total)} SAR</span>
              </td>
              <td className="px-6 py-4">{getStatusChip(quote.status)}</td>
              <td className="px-6 py-4 hidden sm:table-cell">{quote.issueDate}</td>
              <td className="px-6 py-4 hidden sm:table-cell">{quote.expiryDate}</td>
              <td className="px-6 py-4 text-center">
                <button onClick={() => handleEdit(quote)} className="font-medium text-blue-400 hover:underline">
                  عرض / تعديل
                </button>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-10 text-slate-500">
                لا توجد عروض أسعار لعرضها.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuotesTable;