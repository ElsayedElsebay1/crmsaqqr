import React, { useState, useEffect, useMemo } from 'react';
import { Group, User, UserRole } from '../../types';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import MultiSelectDropdown from '../shared/MultiSelectDropdown';

interface GroupModalProps {
  group: Group | null;
  isCreating: boolean;
  onClose: () => void;
}

const BLANK_GROUP: Omit<Group, 'id'> = {
    name: '',
    managerId: '',
    scope: 'KSA',
};

const GroupModal: React.FC<GroupModalProps> = ({ group, isCreating, onClose }) => {
    const { users, currentUser, saveGroup, isSubmitting } = useStore(state => ({
        users: state.users,
        currentUser: state.currentUser!,
        saveGroup: state.saveGroup,
        isSubmitting: state.isSubmitting,
    }));

    const [formData, setFormData] = useState<Omit<Group, 'id'> & { id?: string }>(group || BLANK_GROUP);
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof Group | 'members', string>>>({});

    useEffect(() => {
        if (group) {
            setFormData(group);
            const currentMembers = users.filter(u => u.groupId === group.id).map(u => u.id);
            setMemberIds(currentMembers);
        } else {
            setFormData(BLANK_GROUP);
            setMemberIds([]);
        }
    }, [group, users]);

    const potentialManagers = useMemo(() => 
        users.filter(u => u.isActive && (u.role === UserRole.Manager || u.role === UserRole.Admin)), 
    [users]);
    
    const potentialMembers = useMemo(() => {
        return users
            .filter(u => u.isActive && (u.role === UserRole.Sales || u.role === UserRole.Telesales))
            .filter(u => !u.groupId || u.groupId === group?.id) // Available if unassigned OR already in this group
            .map(u => ({ id: u.id, name: u.name }));
    }, [users, group]);


    const validate = () => {
        const newErrors: Partial<Record<keyof Group | 'members', string>> = {};
        if (!formData.name.trim()) newErrors.name = "اسم الفريق مطلوب.";
        if (!formData.managerId) newErrors.managerId = "يجب تحديد مدير للفريق.";
        if (memberIds.length === 0) newErrors.members = "يجب أن يحتوي الفريق على عضو واحد على الأقل.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const groupData: Group = {
            id: formData.id || '', // API will handle ID creation
            name: formData.name,
            managerId: formData.managerId,
            scope: formData.scope
        };

        await saveGroup(groupData, memberIds);
        onClose();
    };

    const modalTitle = isCreating ? 'إنشاء فريق جديد' : `تعديل فريق: ${group?.name}`;
    
    const footer = (
        <>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                إلغاء
            </button>
            <button type="submit" form="group-form" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
        </>
    );

    return (
        <BaseModal isOpen={true} onClose={onClose} title={modalTitle} footer={footer} maxWidth="max-w-lg">
            <form id="group-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">اسم الفريق</label>
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
                    <label htmlFor="managerId" className="block text-sm font-medium text-slate-300 mb-1">مدير الفريق</label>
                    <select
                        id="managerId"
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleChange}
                        className={`w-full bg-[#2C3E5F] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] ${errors.managerId ? 'border-red-500' : 'border-[#3E527B]'}`}
                    >
                        <option value="" disabled>اختر مديرًا...</option>
                        {potentialManagers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId}</p>}
                </div>
                <div>
                    <label htmlFor="scope" className="block text-sm font-medium text-slate-300 mb-1">النطاق (Scope)</label>
                    <input
                        type="text"
                        id="scope"
                        name="scope"
                        value={formData.scope}
                        onChange={handleChange}
                        placeholder="e.g., KSA, EGY, ALL"
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                    />
                </div>
                <div>
                    <MultiSelectDropdown 
                        label="أعضاء الفريق"
                        options={potentialMembers}
                        selected={memberIds}
                        onChange={setMemberIds}
                    />
                     {errors.members && <p className="text-red-500 text-xs mt-1">{errors.members}</p>}
                </div>
            </form>
        </BaseModal>
    );
};

export default GroupModal;
