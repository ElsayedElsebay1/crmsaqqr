import React, { useState, useEffect, useMemo } from 'react';
import { summarizeTextApi } from '../services/api';
import { Deal, DealStatus, PaymentStatus, UserRole } from '../types';
import { STAGES, BLANK_DEAL } from '../constants';
import { useStore } from '../store/store';
import BaseModal from './shared/BaseModal';
import { SparklesIcon } from './icons/SparklesIcon';

interface DealModalProps {
  deal: Deal | null;
  isCreating: boolean;
  onClose: () => void;
}

const DealModal: React.FC<DealModalProps> = ({ deal, isCreating, onClose }) => {
  const { permissions, saveDeal, isSubmitting, users, currentUser } = useStore(state => ({
    permissions: state.permissions,
    saveDeal: state.saveDeal,
    isSubmitting: state.isSubmitting,
    users: state.users,
    currentUser: state.currentUser!,
  }));
  
  const isEditMode = !isCreating;
  const [formData, setFormData] = useState<Deal>(deal || { ...BLANK_DEAL, id: '', scope: currentUser.scope, ownerId: currentUser.id });
  const [errors, setErrors] = useState<Partial<Record<keyof Deal | 'services', string>>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const canEdit = isCreating ? permissions?.deals.create : permissions?.deals.update;

  const projectManagers = useMemo(() => users.filter(u => u.isActive && (u.role === UserRole.ProjectManager || u.role === UserRole.Admin)), [users]);

  const paymentStatusMap: Record<PaymentStatus, { text: string; className: string }> = {
    [PaymentStatus.PAID]: { text: 'مدفوع بالكامل', className: 'bg-green-500/20 text-green-300' },
    [PaymentStatus.PENDING]: { text: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-300' },
    [PaymentStatus.PARTIAL]: { text: 'مدفوع جزئياً', className: 'bg-blue-500/20 text-blue-300' },
  };

  const paymentInfo = paymentStatusMap[formData.paymentStatus];

  useEffect(() => {
    setFormData(deal || { ...BLANK_DEAL, id: '', scope: currentUser.scope, ownerId: currentUser.id });
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
    if (name === 'services') {
        setFormData(prev => ({ ...prev, services: value.split('\n') }));
    } else {
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
    }
  };

  const handleSummarizeNotes = async () => {
    if (!formData.notes || !formData.notes.trim() || !canEdit) return;

    setIsSummarizing(true);
    setSummaryError('');

    try {
        const response = await summarizeTextApi(formData.notes);
        const summary = response.summary;
        const summaryBlock = `\n\n--- ملخص AI ---\n${summary.trim()}\n------------------`;
        
        setFormData(prev => ({ ...prev, notes: (prev.notes || '').trim() + summaryBlock }));

    } catch (error) {
        console.error("Error summarizing notes:", error);
        setSummaryError("عذرًا، حدث خطأ أثناء التلخيص.");
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
    await saveDeal(formData, isCreating);
    onClose();
  };

  const modalTitle = isEditMode ? 'تفاصيل الفرصة البيعية' : 'إضافة فرصة بيعية جديدة';

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
        إلغاء
      </button>
      <button type="submit" form="deal-form" className="btn btn-primary" disabled={!canEdit || isSubmitting}>
        {isSubmitting ? 'جارٍ الحفظ...' : (isEditMode ? 'حفظ التغييرات' : 'إضافة الفرصة')}
      </button>
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
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">اسم الشركة</label>
                  <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.companyName ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-slate-300 mb-1">قيمة الصفقة (SAR)</label>
                  <input type="number" id="value" name="value" value={formData.value} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.value ? 'border-red-500' : 'border-[#3E527B]'}`} required min="0" />
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>
                
                {isEditMode ? (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">المرحلة الحالية</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed">
                      {STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.title}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-end pb-2">
                    <p className="text-sm text-slate-400">المرحلة: <span className="font-semibold text-slate-300">فرصة جديدة</span></p>
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
                  <input type="text" id="source" name="source" value={formData.source} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed" />
                </div>
                
                {/* Activities & Notes */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2">المتابعة والأنشطة</div>
                 <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-300">سجل المكالمات والملاحظات</label>
                        <button 
                            type="button" 
                            onClick={handleSummarizeNotes} 
                            disabled={!formData.notes || isSummarizing || !canEdit}
                            className="btn btn-secondary !py-1 !px-2 text-xs"
                            title="تلخيص الملاحظات باستخدام الذكاء الاصطناعي"
                        >
                            {isSummarizing ? (
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SparklesIcon className="w-4 h-4 text-yellow-300" />
                            )}
                            <span>{isSummarizing ? 'جارٍ التلخيص...' : 'تلخيص ذكي'}</span>
                        </button>
                    </div>
                    <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed"></textarea>
                    {summaryError && <p className="text-red-500 text-xs mt-1">{summaryError}</p>}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nextMeetingDate" className="block text-sm font-medium text-slate-300 mb-1">تاريخ الاجتماع القادم</label>
                        <input type="date" id="nextMeetingDate" name="nextMeetingDate" value={formData.nextMeetingDate || ''} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed" />
                    </div>
                    <div className={formData.nextMeetingDate ? '' : 'opacity-50'}>
                        <label htmlFor="nextMeetingTime" className="block text-sm font-medium text-slate-300 mb-1">وقت الاجتماع (اختياري)</label>
                        <input
                            type="time"
                            id="nextMeetingTime"
                            name="nextMeetingTime"
                            value={formData.nextMeetingTime || ''}
                            onChange={handleChange}
                            disabled={!formData.nextMeetingDate}
                            className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Financial & Contract */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mt-4 mb-2 border-b border-[#2C3E5F] pb-2 flex justify-between items-center">
                    <span>التفاصيل المالية والتعاقد</span>
                    {isEditMode && paymentInfo && (
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
                        <div className="md:col-span-2">
                            <label htmlFor="services" className="block text-sm font-medium text-slate-300 mb-1">الخدمات المتضمنة (كل خدمة في سطر)</label>
                            <textarea id="services" name="services" value={formData.services.join('\n')} onChange={handleChange} rows={4} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.services ? 'border-red-500' : 'border-[#3E527B]'}`}></textarea>
                            {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
                        </div>
                    </>
                )}
            </fieldset>
        </form>
    </BaseModal>
  );
};

export default DealModal;