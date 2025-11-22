import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { Account } from '../../types';
import BaseModal from '../shared/BaseModal';
import { BLANK_ACCOUNT } from '../../constants';

interface AccountModalProps {
  account: Account | null;
  isCreating: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ account, isCreating, onClose }) => {
    const { saveAccount, isSubmitting } = useStore(state => ({
        saveAccount: state.saveAccount,
        isSubmitting: state.isSubmitting,
    }));

    const [formData, setFormData] = useState<Omit<Account, 'id'> & { id?: string }>(account || BLANK_ACCOUNT);
    const [errors, setErrors] = useState<Partial<Record<keyof Account, string>>>({});
    
    useEffect(() => {
        setFormData(account || BLANK_ACCOUNT);
    }, [account]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof Account, string>> = {};
        if (!formData.name.trim()) newErrors.name = "اسم الحساب مطلوب.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        await saveAccount(formData as Account, isCreating);
        onClose();
    };

    const modalTitle = isCreating ? 'إضافة حساب جديد' : 'تعديل الحساب';

    const footer = (
        <>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>إلغاء</button>
            <button type="submit" form="account-form" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
        </>
    );

    return (
        <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer} maxWidth="max-w-lg">
            <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">اسم الحساب</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] ${errors.name ? 'border-red-500' : 'border-[#3E527B]'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                 <div>
                    <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-1">الموقع الإلكتروني</label>
                    <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleChange}
                        placeholder="example.com"
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    />
                </div>
                 <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-1">المجال</label>
                    <input
                        type="text"
                        id="industry"
                        name="industry"
                        value={formData.industry || ''}
                        onChange={handleChange}
                        placeholder="e.g., Technology, Retail"
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    />
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">الحالة</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    >
                        <option value="Active">نشط</option>
                        <option value="Inactive">غير نشط</option>
                    </select>
                </div>
            </form>
        </BaseModal>
    );
};

export default AccountModal;