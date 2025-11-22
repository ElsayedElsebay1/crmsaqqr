import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  totalItems: number;
  pageSizeOptions?: number[];
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 py-3 text-sm text-slate-400 border-t border-[#2C3E5F]">
      {/* Items per page selector */}
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <span>عرض</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-[#2C3E5F] border border-[#3E527B] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#00B7C1]"
          aria-label="Items per page"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>عنصرًا</span>
      </div>

      {/* Item count */}
      {totalItems > 0 && (
        <span className="mb-2 sm:mb-0">
            عرض {startItem}-{endItem} من {totalItems}
        </span>
      )}
      
      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-[#2C3E5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="الصفحة السابقة"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-200">
          صفحة {currentPage} من {totalPages > 0 ? totalPages : 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-md hover:bg-[#2C3E5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="الصفحة التالية"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;