import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, UserRole } from '../../types';
import { BLANK_INVOICE, INVOICE_STATUSES } from '../../constants';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isCreating: boolean;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isCreating, onClose }) => {
  const { projects, deals, currentUser, permissions, saveInvoice, isSubmitting } = useStore(state => ({
    projects: state.projects,
    deals: state.deals,
    currentUser: state.currentUser!,
    permissions: state.permissions!,
    saveInvoice: state.saveInvoice,
    isSubmitting: state.isSubmitting,
  }));

  const canEdit = useMemo(() => {
    if (isCreating) return permissions.invoices.create;
    if (!invoice || !permissions.invoices.update) return false;
    
    if (currentUser.role === UserRole.Admin) return true;
    if (currentUser.role === UserRole.Finance && invoice.ownerId === currentUser.id) return true;

    return false;
  }, [invoice, isCreating, currentUser, permissions]);
  
  const [formData, setFormData] = useState<Invoice>(invoice || { ...BLANK_INVOICE, id: '', ownerId: '', scope: '' } as Invoice);
  const [errors, setErrors] = useState<Partial<Record<keyof Invoice, string>>>({});

  useEffect(() => {
    const blankInvoiceWithDefaults: Invoice = {
      ...BLANK_INVOICE,
      id: '',
      ownerId: currentUser.id,
      scope: currentUser.scope,
    };
    setFormData(invoice || blankInvoiceWithDefaults);
  }, [invoice, isCreating, currentUser]);

  const validate = (): Partial<Record<keyof Invoice, string>> => {
    const newErrors: Partial<Record<keyof Invoice, string>> = {};
    if (!formData.clientName.trim()) newErrors.clientName = "اسم العميل مطلوب.";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "المبلغ يجب أن يكون أكبر من صفر.";
    if (!formData.issueDate) newErrors.issueDate = "تاريخ الإصدار مطلوب.";
    if (!formData.dueDate) newErrors.dueDate = "تاريخ الاستحقاق مطلوب.";
    else if (formData.issueDate && new Date(formData.dueDate) < new Date(formData.issueDate)) {
      newErrors.dueDate = "تاريخ الاستحقاق يجب أن يكون بعد أو في نفس يوم تاريخ الإصدار.";
    }
    if (!formData.description.trim()) newErrors.description = "الوصف/البنود مطلوبة.";
    return newErrors;
  };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'projectId') {
        const selectedProject = projects.find(p => p.id === value);
        setFormData(prev => ({
            ...prev,
            projectId: value || null,
            dealId: selectedProject ? selectedProject.dealId : null,
            clientName: selectedProject ? selectedProject.clientName : ''
        }));
    } else if (name === 'dealId') {
        const selectedDeal = deals.find(d => d.id === value);
        setFormData(prev => ({
            ...prev,
            projectId: null, // Selecting a deal unlinks the project
            dealId: value || null,
            clientName: selectedDeal ? selectedDeal.companyName : ''
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setErrors({});
    saveInvoice(formData); // This is still sync in the store, but form behaves as if async
    onClose();
  };

  const modalTitle = isCreating ? 'إنشاء فاتورة جديدة' : canEdit ? 'تعديل الفاتورة' : 'عرض الفاتورة';
  
  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>{canEdit ? 'إلغاء' : 'إغلاق'}</button>
      {canEdit && (
        <button type="submit" form="invoice-form" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'جارٍ الحفظ...' : (isCreating ? 'إنشاء الفاتورة' : 'حفظ التغييرات')}
        </button>
      )}
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer}>
        <form id="invoice-form" onSubmit={handleSubmit}>
            <fieldset disabled={!canEdit || isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label htmlFor="projectId" className="block text-sm font-medium text-slate-300 mb-1">ربط بمشروع (اختياري)</label>
                    <select id="projectId" name="projectId" value={formData.projectId || ''} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed">
                        <option value="">فاتورة مستقلة</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="dealId" className="block text-sm font-medium text-slate-300 mb-1">ربط بصفقة (اختياري)</label>
                    <select 
                        id="dealId" 
                        name="dealId" 
                        value={formData.dealId || ''}
                        onChange={handleChange} 
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#0D1C3C] disabled:text-slate-500 disabled:cursor-not-allowed"
                        disabled={!!formData.projectId || !canEdit}
                    >
                        <option value="">فاتورة مستقلة / اختر صفقة</option>
                        {deals.map(d => <option key={d.id} value={d.id}>{d.title} - {d.companyName}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-slate-300 mb-1">اسم العميل</label>
                    <input 
                        type="text" 
                        id="clientName" 
                        name="clientName" 
                        value={formData.clientName} 
                        onChange={handleChange} 
                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] ${!!formData.projectId || !!formData.dealId ? 'bg-[#0D1C3C] border-[#2C3E5F] text-slate-400 cursor-not-allowed' : `bg-[#2C3E5F] ${errors.clientName ? 'border-red-500' : 'border-[#3E527B]'}`} `}
                        required
                        readOnly={!!formData.projectId || !!formData.dealId} 
                    />
                    {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">المبلغ (SAR)</label>
                  <input 
                    type="number" 
                    id="amount" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.amount ? 'border-red-500' : 'border-[#3E527B]'}`} 
                    required 
                    min="0" 
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                 <div>
                  <label htmlFor="issueDate" className="block text-sm font-medium text-slate-300 mb-1">تاريخ الإصدار</label>
                  <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.issueDate ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.issueDate && <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>}
                </div>
                 <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">تاريخ الاستحقاق</label>
                  <input type="date" id="dueDate" name="dueDate" value={formData.dueDate} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.dueDate ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">الحالة</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50">
                    {INVOICE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">الوصف / البنود</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 disabled:cursor-not-allowed ${errors.description ? 'border-red-500' : 'border-[#3E527B]'}`} placeholder="e.g., الدفعة الأولى من مشروع..."></textarea>
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
            </fieldset>
        </form>
    </BaseModal>
  );
};

export default InvoiceModal;