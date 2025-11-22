import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { BLANK_USER } from '../../constants';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';

interface UserModalProps {
  user: User | null; // null for create mode
  isCreating: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isCreating, onClose }) => {
  const { roles, groups, permissions, saveUser, isSubmitting } = useStore(state => ({
    roles: state.roles,
    groups: state.groups,
    permissions: state.permissions!,
    saveUser: state.saveUser,
    isSubmitting: state.isSubmitting,
  }));
  const isEditMode = !isCreating;
  const canEdit = isCreating ? permissions.users.create : permissions.users.update;

  const [formData, setFormData] = useState<User>(
    user ? { ...user } : { ...BLANK_USER, id: '', passwordHash: '' }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});

  useEffect(() => {
    if (user) {
      const initialData = { ...user };
      delete initialData.password;
      setFormData(initialData);
    } else {
      setFormData({ ...BLANK_USER, id: '', passwordHash: '' });
    }
  }, [user, isCreating]);

  const validate = (): Partial<Record<keyof User, string>> => {
    const newErrors: Partial<Record<keyof User, string>> = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب.";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "صيغة البريد الإلكتروني غير صحيحة.";
    if (!isEditMode && (!formData.password || formData.password.length < 3)) { // Simplified for demo
      newErrors.password = "كلمة المرور مطلوبة ويجب أن تكون 3 أحرف على الأقل.";
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value === 'null' ? null : value }));
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
    await saveUser(formData);
    onClose();
  };

  const modalTitle = isEditMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد';

  const footer = (
     <>
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
          إلغاء
        </button>
        {canEdit && (
          <button type="submit" form="user-form" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'جارٍ الحفظ...' : (isEditMode ? 'حفظ التغييرات' : 'إنشاء المستخدم')}
          </button>
        )}
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer} maxWidth="max-w-lg">
        <form id="user-form" onSubmit={handleSubmit}>
          <fieldset disabled={!canEdit || isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">الاسم الكامل</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 ${errors.name ? 'border-red-500' : 'border-[#3E527B]'}`} required />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 ${errors.email ? 'border-red-500' : 'border-[#3E527B]'}`} required />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            {!isEditMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
                <input type="password" id="password" name="password" value={formData.password || ''} onChange={handleChange} className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50 ${errors.password ? 'border-red-500' : 'border-[#3E527B]'}`} required />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
             <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">الدور الوظيفي</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50">
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-slate-300 mb-1">المجموعة</label>
              <select id="groupId" name="groupId" value={formData.groupId || 'null'} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50">
                <option value="null">بلا مجموعة</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
             <div>
                <label htmlFor="scope" className="block text-sm font-medium text-slate-300 mb-1">النطاق (Scope)</label>
                <input type="text" id="scope" name="scope" value={formData.scope} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50" placeholder="e.g., KSA, EGY, ALL" />
            </div>
            <div>
                <label htmlFor="officeLocation" className="block text-sm font-medium text-slate-300 mb-1">موقع المكتب</label>
                <input type="text" id="officeLocation" name="officeLocation" value={formData.officeLocation} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-300 mb-1">رابط الصورة الرمزية (Avatar URL)</label>
              <input type="text" id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:bg-[#2C3E5F]/50" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00B7C1] bg-slate-600 border-slate-500 rounded focus:ring-[#00B7C1] focus:ring-2"
                />
                <span className="text-sm font-medium text-slate-200">الحساب نشط</span>
              </label>
            </div>
          </fieldset>
        </form>
    </BaseModal>
  );
};

export default UserModal;