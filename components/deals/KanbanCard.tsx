import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Deal, PaymentStatus, Invoice, InvoiceStatus, DealStatus, DealLostReason } from '../../types';
import { UserIcon } from '../icons/UserIcon';
import { CalendarAlertIcon } from '../icons/CalendarAlertIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { PieChartIcon } from '../icons/PieChartIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { CalendarPlusIcon } from '../icons/CalendarPlusIcon';
import { useStore } from '../../store/store';

interface KanbanCardProps {
  deal: Deal;
  allInvoices: Invoice[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: (deal: Deal) => void;
  canDrag: boolean;
}

const LOST_REASON_MAP: Record<DealLostReason, string> = {
    price: 'السعر',
    competitor: 'منافس',
    timeline: 'الجدول الزمني',
    scope: 'نطاق العمل',
    unresponsive: 'عدم استجابة',
    other: 'آخر'
};

const KanbanCard: React.FC<KanbanCardProps> = ({ deal, allInvoices, onDragStart, onDragEnd, onClick, canDrag }) => {
  const openSchedulingModal = useStore(state => state.openSchedulingModal);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isScheduleLinkCopied, setIsScheduleLinkCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const hasMeeting = !!deal.nextMeetingDate;
  const canScheduleMeeting = deal.status !== DealStatus.WON && deal.status !== DealStatus.LOST;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    e.stopPropagation();
    onDragStart(e, deal);
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
  
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${deal.contactPhone}`;
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

  const handleCopyScheduleLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}?schedule=true&dealId=${deal.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setIsScheduleLinkCopied(true);
      setTimeout(() => {
        setIsScheduleLinkCopied(false);
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
        isUpcoming: meetingDate < threeDaysFromNow
    };
  }, [deal.nextMeetingDate, deal.nextMeetingTime]);

  const lostReasonTooltip = useMemo(() => {
    if (deal.status !== DealStatus.LOST || !deal.lostReason) return null;
    const reasonText = LOST_REASON_MAP[deal.lostReason] || 'غير معروف';
    const details = deal.lostReasonDetails ? `: ${deal.lostReasonDetails}` : '';
    return `سبب الخسارة: ${reasonText}${details}`;
  }, [deal]);

  return (
    <div
      data-deal-id={deal.id}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`relative p-4 rounded-lg shadow-md border hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group ${canDrag ? 'cursor-grab' : 'cursor-pointer'} ${isOverdue ? 'overdue-deal' : meetingDateInfo?.isUpcoming ? 'upcoming-meeting-deal' : 'bg-[#2C3E5F]/50 border-[#3E527B]'}`}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10">
        <div className="space-y-1">
            {deal.contactEmail && (
                <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                    <span>{deal.contactEmail}</span>
                </div>
            )}
            {deal.contactPhone && (
                <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-slate-400" />
                    <span className="ltr-text">{deal.contactPhone}</span>
                </div>
            )}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-slate-900/95 transform rotate-45"></div>
      </div>


      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
        <div className="relative" ref={shareMenuRef}>
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-full bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
              title="مشاركة الفرصة"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
            {isShareMenuOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-[#1A2B4D] border border-[#3E527B] rounded-lg shadow-2xl py-1 text-white z-20 modal-content">
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
                  <span>{isLinkCopied ? 'تم النسخ!' : 'نسخ رابط داخلي'}</span>
                </button>
              </div>
            )}
        </div>
        
        {canScheduleMeeting && (
          <div className="relative">
             <button
                onClick={(e) => { e.stopPropagation(); openSchedulingModal(deal); }}
                className="p-1.5 rounded-full bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
                title="جدولة اجتماع"
            >
                <CalendarPlusIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {deal.contactPhone && (
            <button
                onClick={handleCallClick}
                className="p-1.5 rounded-full bg-slate-700/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-600 hover:text-white"
                title="اتصل بجهة الاتصال"
            >
                <PhoneIcon className="w-4 h-4" />
            </button>
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
        {deal.googleMeetLink && (
             <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <a 
                    href={deal.googleMeetLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()} 
                    className="text-blue-400 hover:underline truncate"
                >
                    رابط الاجتماع
                </a>
            </div>
        )}
         {lostReasonTooltip && (
            <div className="flex items-start gap-2 text-red-300/80" title={lostReasonTooltip}>
                <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="whitespace-normal text-xs">{lostReasonTooltip}</span>
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