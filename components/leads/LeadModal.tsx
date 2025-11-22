import React, { useState, useEffect, useMemo } from 'react';
import { summarizeTextApi } from '../../services/api';
import { Lead, UserRole, User, LeadStatus, Activity, ActivityType } from '../../types';
import { LEAD_STATUSES, BLANK_LEAD, MARKETING_SERVICES, LEAD_SOURCES } from '../../constants';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import MultiSelectDropdown from '../shared/MultiSelectDropdown';
import { SparklesIcon } from '../icons/SparklesIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import ActivityFeed from '../shared/ActivityFeed';

interface LeadModalProps {
  lead: Lead | null;
  isCreating: boolean;
  onClose: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, isCreating, onClose }) => {
  const { users, currentUser, permissions, saveLead, isSubmitting, groups, openEmailComposerModal } = useStore(state => ({
    users: state.users,
    currentUser: state.currentUser!,
    permissions: state.permissions!,
    saveLead: state.saveLead,
    isSubmitting: state.isSubmitting,
    groups: state.groups,
    openEmailComposerModal: state.openEmailComposerModal,
  }));

  const isEditMode = !isCreating;
  
  const canUpdateRecord = useMemo(() => {
    if (isCreating) return permissions.leads.create;
    if (!lead) return false;
    if (!permissions.leads.update) return false;
    if (currentUser.role === UserRole.Admin) return true;
    if (lead.ownerId === currentUser.id) return true;
    if (currentUser.role === UserRole.Manager) {
        const owner = users.find(u => u.id === lead.ownerId);
        if (owner && owner.groupId === currentUser.groupId) {
            return true;
        }
    }
    return false;
  }, [lead, isCreating, currentUser, permissions, users]);

  const [formData, setFormData] = useState<Lead>(lead ? { ...lead } : ({ ...BLANK_LEAD, id: ''}));
  const [initialData, setInitialData] = useState<Lead | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Lead, string>>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const assignableUsers = useMemo(() => {
    return users.filter(u => u.isActive && (u.role === UserRole.Sales || u.role === UserRole.Telesales));
  }, [users]);
  
  const salesAndTelesalesUsers = useMemo(() => users.filter(u => u.isActive && (u.role === UserRole.Sales || u.role === UserRole.Telesales)), [users]);

  const allLeadSources = useMemo(() => [
    ...LEAD_SOURCES.map(s => s.name),
    ...salesAndTelesalesUsers.map(u => `إحالة من: ${u.name}`)
  ], [salesAndTelesalesUsers]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  useEffect(() => {
    const blankLeadWithDefaults: Lead = {
      ...BLANK_LEAD,
      id: '',
      scope: currentUser.scope, // User's geo scope for data partitioning
      ownerId: currentUser.id,
      services: [],
    };
    const currentData = lead || blankLeadWithDefaults;
    setFormData(currentData);
    setInitialData(currentData);
  }, [lead, isCreating, currentUser]);

  const validate = (): Partial<Record<keyof Lead, string>> => {
    const newErrors: Partial<Record<keyof Lead, string>> = {};
    if (!formData.companyName.trim()) newErrors.companyName = "اسم الشركة مطلوب.";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "اسم جهة الاتصال مطلوب.";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    }
    if (!formData.ownerId.trim()) newErrors.ownerId = "يجب إسناد العميل لمسؤول.";

    if (formData.status === LeadStatus.NOT_INTERESTED && !formData.notInterestedReason?.trim()) {
      newErrors.notInterestedReason = "يرجى توضيح سبب عدم اهتمام العميل.";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServicesChange = (newServices: string[]) => {
    setFormData(prev => ({ ...prev, services: newServices }));
  };
  
  const handleAddActivity = (newActivity: Omit<Activity, 'id'>) => {
    const activityWithId = { ...newActivity, id: `act-${Date.now()}` };
    setFormData(prev => ({
        ...prev,
        activity: [...prev.activity, activityWithId],
    }));
  };

  const handleSummarizeAllActivities = async () => {
    if (formData.activity.length === 0 || !canUpdateRecord) return;

    setIsSummarizing(true);
    setSummaryError('');
    
    const allContent = formData.activity.map(a => `[${a.type} by ${users.find(u=>u.id === a.userId)?.name || 'Unknown'} at ${a.timestamp}]: ${a.content}`).join('\n---\n');

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
        console.error("Error summarizing notes:", error);
        setSummaryError("عذرًا، حدث خطأ أثناء التلخيص.");
    } finally {
        setIsSummarizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdateRecord) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setErrors({});
    await saveLead(formData, isCreating);
    onClose();
  };

  const modalTitle = isCreating ? 'إضافة عميل محتمل جديد' : canUpdateRecord ? 'تعديل بيانات العميل' : 'عرض بيانات العميل';

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
        {canUpdateRecord ? 'إلغاء' : 'إغلاق'}
      </button>
      {canUpdateRecord && (
        <button type="submit" form="lead-form" className="btn btn-primary" disabled={!hasUnsavedChanges || isSubmitting}>
            {isSubmitting ? 'جارٍ الحفظ...' : (isCreating ? 'إضافة' : 'حفظ التغييرات')}
        </button>
      )}
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer}>
        <form id="lead-form" onSubmit={handleSubmit}>
            <fieldset disabled={!canUpdateRecord || isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Basic Info */}
                <div className="md:col-span-2 text-lg font-semibold text-[#00B7C1] mb-2 border-b border-[#2C3E5F] pb-2">البيانات الأساسية</div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">اسم الشركة</label>
                  <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.companyName ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-300 mb-1">اسم جهة الاتصال</label>
                  <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.contactPerson ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-[#3E527B]'}`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">رقم الهاتف</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50" />
                </div>
                 <div>
                  <label htmlFor="source" className="block text-sm font-medium text-slate-300 mb-1">مصدر العميل</label>
                  <select id="source" name="source" value={formData.source} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50">
                    <option value="">اختر مصدر العميل</option>
                    {allLeadSources.map(sourceName => <option key={sourceName} value={sourceName}>{sourceName}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ownerId" className="block text-sm font-medium text-slate-300 mb-1">المسؤول</label>
                  <select 
                    id="ownerId" 
                    name="ownerId" 
                    value={formData.ownerId} 
                    onChange={handleChange} 
                    className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.ownerId ? 'border-red-500' : 'border-[#3E527B]'}`} 
                    required
                  >
                    <option value="" disabled>اختر موظفًا...</option>
                    {assignableUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  {errors.ownerId && <p className="text-red-500 text-xs mt-1">{errors.ownerId}</p>}
                </div>
                
                 <div className="md:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">الحالة</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50">
                    {LEAD_STATUSES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                 <div className="md:col-span-2">
                    <MultiSelectDropdown
                        label="الخدمات المطلوبة"
                        options={MARKETING_SERVICES}
                        selected={formData.services}
                        onChange={handleServicesChange}
                        disabled={!canUpdateRecord || isSubmitting}
                    />
                 </div>

                {formData.status === LeadStatus.NOT_INTERESTED && (
                  <div className="md:col-span-2">
                    <label htmlFor="notInterestedReason" className="block text-sm font-medium text-slate-300 mb-1">
                      سبب عدم الاهتمام <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="notInterestedReason"
                      name="notInterestedReason"
                      value={formData.notInterestedReason || ''}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.notInterestedReason ? 'border-red-500' : 'border-[#3E527B]'}`}
                      placeholder="مثال: السعر مرتفع، لا توجد ميزانية، يستخدمون منافساً..."
                    />
                    {errors.notInterestedReason && <p className="text-red-500 text-xs mt-1">{errors.notInterestedReason}</p>}
                  </div>
                )}
                
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-[#00B7C1]">سجل الأنشطة والملاحظات</h3>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => openEmailComposerModal(formData)}
                                disabled={isSummarizing || !canUpdateRecord || isSubmitting}
                                className="btn btn-secondary !py-1 !px-2 text-xs"
                                title="إنشاء متابعة بالبريد الإلكتروني باستخدام الذكاء الاصطناعي"
                            >
                                <EnvelopeIcon className="w-4 h-4 text-blue-300" />
                                <span>إنشاء بريد</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSummarizeAllActivities} 
                                disabled={formData.activity.length === 0 || isSummarizing || !canUpdateRecord}
                                className="btn btn-secondary !py-1 !px-2 text-xs"
                                title="تلخيص الملاحظات باستخدام الذكاء الاصطناعي"
                            >
                                {isSummarizing ? (
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <SparklesIcon className="w-4 h-4 text-yellow-300" />
                                )}
                                <span>{isSummarizing ? 'جارٍ...' : 'تلخيص ذكي'}</span>
                            </button>
                        </div>
                    </div>
                    <ActivityFeed
                        activities={formData.activity}
                        onAddActivity={handleAddActivity}
                        disabled={!canUpdateRecord || isSubmitting}
                    />
                    {summaryError && <p className="text-red-500 text-xs mt-1">{summaryError}</p>}
                </div>
            </fieldset>
        </form>
    </BaseModal>
  );
};

export default LeadModal;
