import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Deal, PaymentStatus, Invoice, InvoiceStatus } from '../types';
import { UserIcon } from './icons/UserIcon';
import { CalendarAlertIcon } from './icons/CalendarAlertIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PieChartIcon } from './icons/PieChartIcon';
import { ShareIcon } from './icons/ShareIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

interface KanbanCardProps {
  deal: Deal;
  allInvoices: Invoice[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: (deal: Deal) => void;
  canDrag: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ deal, allInvoices, onDragStart, onDragEnd, onClick, canDrag }) => {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    e.stopPropagation();
    onDragStart(e);
  };

  const handleClick = () => {
    onClick(deal);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shareMenuRef]);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareMenuOpen(prev => !prev);
  };

  const handleShareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = `تفاصيل الفرصة: ${deal.title}`;
    const body = `مرحباً،\n\nهذه تفاصيل الفرصة "${deal.title}":\n\n- الشركة: ${deal.companyName}\n- جهة الاتصال: ${deal.contactPerson}\n- القيمة: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(deal.value)}\n- المرحلة: ${deal.status}\n\nشكراً`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsShareMenuOpen(false);
  };
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}#deal/${deal.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => {
        setIsLinkCopied(false);
        setIsShareMenuOpen(false);
      }, 2000);
    });
  };

  const paymentStatusMap: Record<PaymentStatus, { text: string; className: string; icon: React.ReactNode }> = {
    [PaymentStatus.PAID]: { text: 'مدفوع', className: 'bg-green-500/20 text-green-300', icon: <CheckCircleIcon className="w-4 h-4" /> },
    [PaymentStatus.PENDING]: { text: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-300', icon: <ClockIcon className="w-4 h-4" /> },
    [PaymentStatus.PARTIAL]: { text: 'جزئي', className: 'bg-blue-500/20 text-blue-300', icon: <PieChartIcon className="w-4 h-4" /> },
  };
  
  const paymentInfo = paymentStatusMap[deal.paymentStatus];

  const isOverdue = useMemo(() => {
    return allInvoices.some(inv => inv.dealId === deal.id && inv.status === InvoiceStatus.OVERDUE);
  }, [allInvoices, deal.id]);

  const meetingDateInfo = useMemo(() => {
    if (!deal.nextMeetingDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meetingDate = new Date(deal.nextMeetingDate + 'T00:00:00');
    
    // A past meeting date should also be highlighted, so we don't return null if it's in the past.

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    let displayDate = deal.nextMeetingDate;
    if (deal.nextMeetingTime) {
        const [hours, minutes] = deal.nextMeetingTime.split(':');
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));
        const formattedTime = time.toLocaleString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true });
        displayDate += ` | ${formattedTime}`;
    }

    return {
        date: displayDate,
        // Highlight if the meeting is in the past or within the next 3 days.
        isUpcoming: meetingDate < threeDaysFromNow
    };
  }, [deal.nextMeetingDate, deal.nextMeetingTime]);


  return (
    <div
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`relative p-4 rounded-lg shadow-md border hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${canDrag ? 'cursor-grab' : 'cursor-pointer'} ${isOverdue ? 'overdue-deal' : meetingDateInfo?.isUpcoming ? 'upcoming-meeting-deal' : 'bg-[#2C3E5F]/50 border-[#3E527B]'}`}
    >
       <div className="absolute top-2 left-2 z-10" ref={shareMenuRef}>
        <button
          onClick={handleShareClick}
          className="p-1.5 rounded-full bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
          title="مشاركة الفرصة"
        >
          <ShareIcon className="w-4 h-4" />
        </button>

        {isShareMenuOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-[#1A2B4D] border border-[#3E527B] rounded-lg shadow-2xl py-1 text-white z-20 modal-content">
            <button
              onClick={handleShareEmail}
              className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-[#2C3E5F]/50 transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>مشاركة عبر البريد</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-[#2C3E5F]/50 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>{isLinkCopied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
        )}
      </div>

      <h3 className="font-bold text-slate-100 group-hover:text-[#00B7C1] transition-colors">{deal.title}</h3>
      <p className="text-sm text-slate-400 mt-1">{deal.companyName}</p>
      
      <div className="mt-3 space-y-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            <span>{deal.contactPerson}</span>
        </div>
        {deal.source && (
            <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <span>{deal.source}</span>
            </div>
        )}
        {meetingDateInfo && (
            <div className={`flex items-center gap-2 ${meetingDateInfo.isUpcoming ? 'text-orange-400 font-semibold' : ''}`}>
                <CalendarAlertIcon className="w-4 h-4" />
                <span>{meetingDateInfo.date}</span>
            </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-[#00B7C1]">
          {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(deal.value)}
        </span>
        {paymentInfo && (
          <span 
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${paymentInfo.className}`}
            title={`حالة الدفع: ${paymentInfo.text}`}
          >
            {paymentInfo.icon}
            <span>{paymentInfo.text}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;