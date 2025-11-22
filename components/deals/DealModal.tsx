import React, { useState, useEffect, useMemo, useRef } from 'react';
import { summarizeTextApi } from '../../services/api';
import { Deal, DealStatus, PaymentStatus, UserRole, Account, InvoiceStatus, Invoice, Quote, QuoteStatus, Activity, ActivityType } from '../../types';
import { STAGES, BLANK_DEAL, MARKETING_SERVICES, LEAD_SOURCES, BLANK_INVOICE } from '../../constants';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import MultiSelectDropdown from '../shared/MultiSelectDropdown';
import { SparklesIcon } from '../icons/SparklesIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CalendarPlusIcon } from '../icons/CalendarPlusIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';
import ActivityFeed from '../shared/ActivityFeed';
import { XIcon } from '../icons/XIcon';


interface DealModalProps {
  deal: Deal | null;
  isCreating: boolean;
  onClose: () => void;
}

const DealModal: React.FC<DealModalProps> = ({ deal, isCreating, onClose }) => {
  const { users, currentUser, permissions, saveDeal, isSubmitting, accounts, openReasonForLossModal, invoices, quotes, openInvoiceModal, openEmailComposerModal, openSchedulingModal, openQuoteEditor, openAccountDetailsModal } = useStore(state => ({
    users: state.users,
    currentUser: state.currentUser!,
    permissions: state.permissions,
    saveDeal: state.saveDeal,
    isSubmitting: state.isSubmitting,
    accounts: state.accounts,
    openReasonForLossModal: state.openReasonForLossModal,
    invoices: state.invoices,
    quotes: state.quotes,
    openInvoiceModal: state.openInvoiceModal,
    openEmailComposerModal: state.openEmailComposerModal,
    openSchedulingModal: state.openSchedulingModal,
    openQuoteEditor: state.openQuoteEditor,
    openAccountDetailsModal: state.openAccountDetailsModal,
  }));
  
  const canEdit = useMemo(() => {
    if (isCreating) return permissions?.deals.create;
    if (!deal) return false;
    if (!permissions?.deals.update) return false;
    
    if (currentUser.role === UserRole.Admin) return true;
    if (deal.ownerId === currentUser.id) return true;
    if (currentUser.role === UserRole.Manager) {
        const owner = users.find(u => u.id === deal.ownerId);
        if (owner && owner.groupId === currentUser.groupId) {
            return true;
        }
    }
    return false;
  }, [deal, isCreating, currentUser, permissions, users]);

  const projectManagers = useMemo(() => users.filter(u => u.isActive && (u.role === UserRole.ProjectManager || u.role === UserRole.Admin)), [users]);
  
  const [formData, setFormData] = useState<Deal>(deal ? { ...deal } : ({ ...BLANK_DEAL, id: '', scope: '' }));
  const [errors, setErrors] = useState<Partial<Record<keyof Deal | 'services', string>>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const [suggestions, setSuggestions] = useState<Account[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const companyInputRef = useRef<HTMLDivElement>(null);

  const salesAndTelesalesUsers = useMemo(() => users.filter(u => u.isActive && (u.role === UserRole.Sales || u.role === UserRole.Telesales)), [users]);

  const allLeadSources = useMemo(() => [
    ...LEAD_SOURCES.map(s => s.name),
    ...salesAndTelesalesUsers.map(u => `إحالة من: ${u.name}`)
  ], [salesAndTelesalesUsers]);

  const relatedInvoices = useMemo(() => {
    if (isCreating || !deal) return [];
    return invoices.filter(inv => inv.dealId === deal.id).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [invoices, deal, isCreating]);

  const relatedQuotes = useMemo(() => {
    if (isCreating || !deal) return [];
    return quotes.filter(q => q.dealId === deal.id).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [quotes, deal, isCreating]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const paymentStatusMap: Record<PaymentStatus, { text: string; className: string }> = {
    [PaymentStatus.PAID]: { text: 'مدفوع بالكامل', className: 'bg-green-500/20 text-green-300' },
    [PaymentStatus.PENDING]: { text: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-300' },
    [PaymentStatus.PARTIAL]: { text: 'مدفوع جزئياً', className: 'bg-blue-500/20 text-blue-300' },
  };

  const paymentInfo = paymentStatusMap[formData.paymentStatus];

  useEffect(() => {
    const blankDealWithDefaults: Deal = {
        ...BLANK_DEAL,
        id: '',
        scope: currentUser.scope,
        ownerId: currentUser.id,
    }
    setFormData(deal || blankDealWithDefaults);
  }, [deal, isCreating, currentUser]);

  const validate = (): Partial<Record<keyof Deal | 'services', string>> => {
    const newErrors: Partial<Record<keyof Deal | 'services', string>> = {};
    if (!formData.title.trim()) newErrors.title = "عنوان الفرصة مطلوب.";
    if (!formData.companyName.trim()) newErrors.companyName = "اسم الشركة مطلوب.";
    if (!formData.value || formData.value <= 0) newErrors.value = "قيمة الصفقة يجب أن تكون أكبر من صفر.";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "اسم جهة الاتصال مطلوب.";
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "صيغة البريد الإلكتروني غير صحيحة.";
    }

    if (formData.status === DealStatus.WON) {
      if (!formData.projectManagerId?.trim()) {
        newErrors.projectManagerId = "مدير المشروع مطلوب عند الفوز بالصفقة.";
      }
      if (formData.services.filter(s => s.trim()).length === 0) {
        newErrors.services = "يجب إضافة خدمة واحدة على الأقل.";
      }
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
  };

  const handleServicesChange = (newServices: string[]) => {
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, companyName: value, accountId: '' })); // Clear accountId on manual typing
    if (value) {
        setSuggestions(accounts.filter(acc => acc.name.toLowerCase().includes(value.toLowerCase())));
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (account: Account) => {
    setFormData(prev => ({ ...prev, companyName: account.name, accountId: account.id }));
    setShowSuggestions(false);
  };
  
  const handleCreateInvoice = () => {
    if (!deal) return;
    const newInvoiceStub: Invoice = {
      ...BLANK_INVOICE,
      id: '', // Add empty id to conform to Invoice type
      dealId: deal.id,
      clientName: deal.companyName,
      scope: deal.scope,
      ownerId: currentUser.id,
      amount: deal.value,
      description: `فاتورة بخصوص: ${deal.title}`,
    };
    openInvoiceModal(newInvoiceStub, true);
  };

  const getStatusChip = (status: InvoiceStatus | QuoteStatus, type: 'invoice' | 'quote') => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
    if (type === 'invoice') {
        switch (status as InvoiceStatus) {
            case InvoiceStatus.DRAFT: return <span className={`${baseClasses} bg-slate-500/20 text-slate-300`}>مسودة</span>;
            case InvoiceStatus.SENT: return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>مرسلة</span>;
            case InvoiceStatus.PAID: return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>مدفوعة</span>;
            case InvoiceStatus.OVERDUE: return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>متأخرة</span>;
            default: return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
        }
    } else {
         switch (status as QuoteStatus) {
            case QuoteStatus.DRAFT: return <span className={`${baseClasses} bg-slate-500/20 text-slate-300`}>مسودة</span>;
            case QuoteStatus.SENT: return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>مرسل</span>;
            case QuoteStatus.ACCEPTED: return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>مقبول</span>;
            case QuoteStatus.REJECTED: return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>مرفوض</span>;
            default: return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
        }
    }
  };
  
  const handleAddActivity = (newActivity: Omit<Activity, 'id'>) => {
    const activityWithId = { ...newActivity, id: `act-${Date.now()}` };
    setFormData(prev => ({
        ...prev,
        activity: [...(prev.activity || []), activityWithId],
    }));
  };
  
  const handleSummarizeAllActivities = async () => {
    if (!formData.activity || formData.activity.length === 0 || !canEdit) return;

    setIsSummarizing(true);
    setSummaryError('');
    
    const allContent = formData.activity.map(a => `[${a.type} by ${users.find(u=>u.id === a.userId)?.name || 'Unknown'} at ${new Date(a.timestamp).toLocaleString('ar-SA')}]: ${a.content}`).join('\n---\n');

    try {
        const response = await summarizeTextApi(allContent);
        const summary = response.summary;
        const summaryActivity: Omit<Activity, 'id'> = {
            type: 'NOTE',
            content: `--- ملخص AI ---\n${summary.trim()}`,
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
        };
        handleAddActivity(summaryActivity);
    } catch (error) {
        console.error("Error summarizing activities:", error);
        setSummaryError("عذرًا, حدث خطأ أثناء التلخيص.");
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setErrors({});
    
    const originalStatus = deal?.status;
    const isNowLost = formData.status === DealStatus.LOST;
    const wasNotLostBefore = originalStatus !== DealStatus.LOST;

    if (isNowLost && wasNotLostBefore && !isCreating) {
        openReasonForLossModal(formData);
        onClose(); // Close the deal modal
    } else {
        await saveDeal(formData, isCreating);
        onClose();
    }
  };

  const modalTitle = isCreating ? 'إضافة فرصة بيعية جديدة' : canEdit ? 'تعديل الفرصة' : 'عرض الفرصة';

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
        {canEdit ? 'إلغاء' : 'إغلاق'}
      </button>
      {canEdit && (
        <button type="submit" form="deal-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'جارٍ الحفظ...' : (isCreating ? 'إضافة' : 'حفظ التغييرات')}
        </button>
      )}
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer}>
        <form id="deal-form" onSubmit={handleSubmit}>
            <fieldset disabled={!canEdit || isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Basic Info */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mb-2 border-b border-[#2C3E5F] pb-2">البيانات الأساسية</div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">عنوان الفرصة</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.title ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div ref={companyInputRef} className="relative">
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">اسم الشركة</label>
                     {formData.accountId && !isCreating ? (
                        <div className="flex items-center justify-between w-full bg-[#0D1C3C] border border-[#2C3E5F] rounded-md px-3 py-2 text-slate-300">
                            <button
                                type="button"
                                className="hover:underline hover:text-[#00B7C1]"
                                onClick={() => {
                                    const account = accounts.find(a => a.id === formData.accountId);
                                    if (account) openAccountDetailsModal(account);
                                }}
                            >
                                {formData.companyName}
                            </button>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, accountId: '', companyName: '' }))}
                                    className="text-slate-500 hover:text-white"
                                    title="تغيير الشركة"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleCompanyChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                                className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.companyName ? 'border-red-500' : 'border-[#3E527B]'}`}
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {suggestions.map(acc => (
                                    <li 
                                    key={acc.id}
                                    onClick={() => handleSuggestionClick(acc)}
                                    className="px-3 py-2 cursor-pointer hover:bg-[#3E527B]"
                                    >
                                    {acc.name}
                                    </li>
                                ))}
                                </ul>
                            )}
                        </>
                    )}
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-slate-300 mb-1">قيمة الصفقة (SAR)</label>
                  <input type="number" id="value" name="value" value={formData.value} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.value ? 'border-red-500' : 'border-[#3E527B]'}`} required min="0" />
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>
                
                {isCreating ? (
                  <div className="flex items-end pb-2">
                    <p className="text-sm text-slate-400">المرحلة: <span className="font-semibold text-slate-300">فرصة جديدة</span></p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">المرحلة الحالية</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed">
                      {STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.title}</option>)}
                    </select>
                  </div>
                )}
                
                {/* Contact Info */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2">بيانات التواصل</div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-300 mb-1">اسم جهة الاتصال</label>
                  <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.contactPerson ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.contactEmail ? 'border-red-500' : 'border-[#3E527B]'}`} />
                  {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-300 mb-1">رقم الهاتف</label>
                  <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-slate-300 mb-1">مصدر العميل</label>
                  <select id="source" name="source" value={formData.source} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed">
                    <option value="">اختر مصدر العميل</option>
                    {allLeadSources.map(sourceName => <option key={sourceName} value={sourceName}>{sourceName}</option>)}
                  </select>
                </div>
                
                {/* Activities & Notes */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2">المتابعة والأنشطة</div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">الاجتماع القادم</label>
                    {formData.nextMeetingDate ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3 bg-[#0D1C3C] border border-[#2C3E5F] rounded-md">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                                    <span className="font-semibold text-slate-200">{new Date(formData.nextMeetingDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                {formData.nextMeetingTime && (
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-300">{new Date(`1970-01-01T${formData.nextMeetingTime}`).toLocaleString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                    </div>
                                )}
                            </div>
                            {canEdit && (
                                <button type="button" onClick={() => openSchedulingModal(formData)} className="btn btn-secondary !py-1 !px-3 text-sm">
                                    <CalendarPlusIcon className="w-4 h-4" />
                                    <span>إعادة جدولة</span>
                                </button>
                            )}
                        </div>
                    ) : (
                         <div className="text-center p-4 bg-[#0D1C3C] border-2 border-dashed border-[#2C3E5F] rounded-md">
                            <p className="text-slate-400 mb-3">لا يوجد اجتماع مجدول لهذه الفرصة.</p>
                            {canEdit && (
                                <button type="button" onClick={() => openSchedulingModal(formData)} className="btn btn-primary">
                                    <CalendarPlusIcon className="w-5 h-5" />
                                    <span>جدولة اجتماع</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                 {formData.googleMeetLink && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1">رابط الاجتماع (Google Meet)</label>
                        <div className="flex items-center gap-2 p-2 bg-[#0D1C3C] border border-[#2C3E5F] rounded-md">
                            <LinkIcon className="w-5 h-5 text-slate-400" />
                            <a href={formData.googleMeetLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                                {formData.googleMeetLink}
                            </a>
                        </div>
                    </div>
                )}

                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md font-semibold text-slate-300">سجل الأنشطة</h3>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => openEmailComposerModal(formData)}
                                disabled={isSummarizing || !canEdit || isSubmitting}
                                className="btn btn-secondary !py-1 !px-2 text-xs"
                                title="إنشاء متابعة بالبريد الإلكتروني باستخدام الذكاء الاصطناعي"
                            >
                                <EnvelopeIcon className="w-4 h-4 text-blue-300" />
                                <span className="hidden sm:inline">إنشاء بريد</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSummarizeAllActivities} 
                                disabled={!formData.activity || formData.activity.length === 0 || isSummarizing || !canEdit}
                                className="btn btn-secondary !py-1 !px-2 text-xs"
                                title="تلخيص الملاحظات باستخدام الذكاء الاصطناعي"
                            >
                                {isSummarizing ? (
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon className="w-4 h-4 text-yellow-300" />
                                )}
                                <span className="hidden sm:inline">{isSummarizing ? 'جارٍ...' : 'تلخيص ذكي'}</span>
                            </button>
                        </div>
                    </div>
                    <ActivityFeed
                        activities={formData.activity || []}
                        onAddActivity={handleAddActivity}
                        disabled={!canEdit || isSubmitting}
                    />
                    {summaryError && <p className="text-red-500 text-xs mt-1">{summaryError}</p>}
                </div>

                {/* Financial & Contract */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2 flex justify-between items-center">
                    <span>التفاصيل المالية والتعاقد</span>
                    {paymentInfo && (
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${paymentInfo.className}`}>
                            {paymentInfo.text}
                        </span>
                    )}
                </div>
                 <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-slate-300 mb-1">تغيير حالة الدفع</label>
                  <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed">
                    <option value={PaymentStatus.PENDING}>قيد الانتظار</option>
                    <option value={PaymentStatus.PARTIAL}>مدفوع جزئيًا</option>
                    <option value={PaymentStatus.PAID}>مدفوع بالكامل</option>
                  </select>
                </div>
                
                <div className={`md:col-span-2 ${formData.status !== DealStatus.WON ? 'opacity-60' : ''}`}>
                    <MultiSelectDropdown
                        label="الخدمات المتضمنة"
                        options={MARKETING_SERVICES}
                        selected={formData.services}
                        onChange={handleServicesChange}
                        disabled={formData.status !== DealStatus.WON || !canEdit || isSubmitting}
                    />
                    {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
                </div>
                
                 {/* Associated Quotes */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2 flex justify-between items-center">
                    <span>عروض الأسعار</span>
                    {!isCreating && canEdit && (
                        <button type="button" onClick={() => openQuoteEditor(deal!)} className="btn btn-secondary !py-1 !px-2 text-xs">
                            <DocumentPlusIcon className="w-4 h-4" />
                            <span>إنشاء عرض سعر</span>
                        </button>
                    )}
                </div>

                {isCreating ? (
                    <p className="md:col-span-2 text-sm text-slate-500 text-center">يمكنك إضافة عروض أسعار بعد حفظ الفرصة.</p>
                ) : relatedQuotes.length > 0 ? (
                    <div className="md:col-span-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                        {relatedQuotes.map(quote => (
                            <button key={quote.id} onClick={() => openQuoteEditor(deal!, quote)} type="button" className="w-full text-right bg-[#2C3E5F]/50 p-3 rounded-lg hover:bg-[#2C3E5F] transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm text-slate-400">#{quote.quoteNumber}</span>
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-slate-200">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(quote.total)}</span>
                                        <span className="text-xs text-slate-400">تاريخ الإصدار: {quote.issueDate}</span>
                                    </div>
                                </div>
                                {getStatusChip(quote.status, 'quote')}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="md:col-span-2 text-sm text-slate-400 text-center">لا توجد عروض أسعار لهذه الفرصة.</p>
                )}


                {/* Associated Invoices */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2 flex justify-between items-center">
                    <span>الفواتير المرتبطة</span>
                    {!isCreating && canEdit && permissions?.invoices.create && (
                        <button type="button" onClick={handleCreateInvoice} className="btn btn-secondary !py-1 !px-2 text-xs">
                            <PlusIcon className="w-4 h-4" />
                            <span>إضافة فاتورة</span>
                        </button>
                    )}
                </div>

                {isCreating ? (
                    <p className="md:col-span-2 text-sm text-slate-500 text-center">يمكنك إضافة فواتير بعد حفظ الفرصة.</p>
                ) : relatedInvoices.length > 0 ? (
                    <div className="md:col-span-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                        {relatedInvoices.map(inv => (
                            <button key={inv.id} onClick={() => openInvoiceModal(inv)} type="button" className="w-full text-right bg-[#2C3E5F]/50 p-3 rounded-lg hover:bg-[#2C3E5F] transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-sm text-slate-400">#{inv.id.toUpperCase()}</span>
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-slate-200">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(inv.amount)}</span>
                                        <span className="text-xs text-slate-400">تستحق في: {inv.dueDate}</span>
                                    </div>
                                </div>
                                {getStatusChip(inv.status, 'invoice')}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="md:col-span-2 text-sm text-slate-400 text-center">لا توجد فواتير مرتبطة بهذه الفرصة بعد.</p>
                )}


                {/* Project Management (Conditional) */}
                {formData.status === DealStatus.WON && (
                    <>
                        <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2">إدارة المشروع</div>
                        <div>
                            <label htmlFor="projectManagerId" className="block text-sm font-medium text-slate-300 mb-1">مدير المشروع المسؤول</label>
                            <select id="projectManagerId" name="projectManagerId" value={formData.projectManagerId || ''} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.projectManagerId ? 'border-red-500' : 'border-[#3E527B]'}`} required>
                                <option value="" disabled>اختر مدير مشروع</option>
                                {projectManagers.map(pm => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </select>
                            {errors.projectManagerId && <p className="text-red-500 text-xs mt-1">{errors.projectManagerId}</p>}
                        </div>
                    </>
                )}
            </fieldset>
        </form>
    </BaseModal>
  );
};

export default DealModal;