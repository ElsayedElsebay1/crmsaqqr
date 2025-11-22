import React, { useState, useMemo } from 'react';
import { Lead, User, UserRole } from '../../types';
import { UsersIcon } from '../icons/UsersIcon';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';

interface ReassignLeadModalProps {
  lead: Lead;
  onClose: () => void;
}

const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({ lead, onClose }) => {
  const { users, reassignLead } = useStore(state => ({
    users: state.users,
    reassignLead: state.reassignLead,
  }));
  const [selectedOwnerId, setSelectedOwnerId] = useState(lead.ownerId);

  const assignableUsers = useMemo(() => {
    return users.filter(u => u.isActive && (u.role === UserRole.Sales || u.role === UserRole.Telesales));
  }, [users]);
  
  const handleSave = () => {
    if (selectedOwnerId && selectedOwnerId !== lead.ownerId) {
      reassignLead(lead.id, selectedOwnerId);
    }
    onClose();
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className="btn btn-secondary">
        إلغاء
      </button>
      <button type="button" onClick={handleSave} className="btn btn-primary" disabled={selectedOwnerId === lead.ownerId}>
        حفظ التغييرات
      </button>
    </>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} title="إعادة إسناد العميل المحتمل" footer={footer} maxWidth="max-w-md">
        <div className="space-y-4">
            <p className="text-slate-300">
                إعادة إسناد العميل: <span className="font-bold text-white">{lead.companyName}</span>
            </p>
             <div>
                <label htmlFor="assignee-select" className="block text-sm font-medium text-slate-300 mb-1">
                    إسناد إلى:
                </label>
                <select
                    id="assignee-select"
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    {assignableUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
            </div>
        </div>
    </BaseModal>
  );
};

export default ReassignLeadModal;