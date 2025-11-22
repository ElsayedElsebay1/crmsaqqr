import React, { useMemo } from 'react';
import { useStore } from '../store/store';
import { Group, User, UserRole } from '../types';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

const TeamCard: React.FC<{
    group: Group;
    manager?: User;
    members: User[];
    onEdit: (group: Group) => void;
    onDelete: (group: Group) => void;
    canEdit: boolean;
    canDelete: boolean;
}> = ({ group, manager, members, onEdit, onDelete, canEdit, canDelete }) => {
    return (
        <div className="bg-[#1A2B4D] border border-[#2C3E5F] rounded-xl shadow-lg p-5 flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white">{group.name}</h3>
                    <p className="text-sm text-slate-400">المدير: {manager?.name || 'غير محدد'}</p>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                         <button onClick={() => onEdit(group)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={() => onDelete(group)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-grow mt-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">الأعضاء ({members.length})</p>
                <div className="flex -space-x-2">
                    {members.slice(0, 7).map(member => (
                        <div key={member.id} title={member.name} className="w-9 h-9 bg-[#00B7C1] rounded-full flex items-center justify-center font-bold text-white border-2 border-[#1A2B4D] object-cover">
                            {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                member.name.charAt(0).toUpperCase()
                            )}
                        </div>
                    ))}
                    {members.length > 7 && (
                        <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white border-2 border-[#1A2B4D]">
                            +{members.length - 7}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TeamManagementPage: React.FC = () => {
    const { 
        groups, 
        users, 
        currentUser, 
        permissions,
        openGroupModal,
        openConfirmationModal,
        deleteGroup,
    } = useStore(state => ({
        groups: state.groups,
        users: state.users,
        currentUser: state.currentUser!,
        permissions: state.permissions!,
        openGroupModal: state.openGroupModal,
        openConfirmationModal: state.openConfirmationModal,
        deleteGroup: state.deleteGroup,
    }));

    const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

    const visibleGroups = useMemo(() => {
        if (currentUser.role === UserRole.Admin) return groups;
        if (currentUser.role === UserRole.Manager) {
            return groups.filter(g => g.managerId === currentUser.id);
        }
        return [];
    }, [groups, currentUser]);

    const handleDelete = (group: Group) => {
        openConfirmationModal(
            `حذف فريق: ${group.name}`,
            <p>هل أنت متأكد؟ سيتم إلغاء تعيين جميع أعضاء هذا الفريق.</p>,
            () => deleteGroup(group.id)
        );
    };

    return (
        <>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <UserGroupIcon className="w-8 h-8 text-[#00B7C1]" />
                    <span>إدارة الفرق</span>
                </h1>
                {permissions.teams.create && (
                    <button onClick={() => openGroupModal(null, true)} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" />
                        <span>إنشاء فريق جديد</span>
                    </button>
                )}
            </div>
            
            {visibleGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleGroups.map(group => {
                        const manager = usersMap.get(group.managerId);
                        const members = users.filter(u => u.groupId === group.id);
                        const canEdit = permissions.teams.update && (currentUser.role === UserRole.Admin || group.managerId === currentUser.id);
                        const canDelete = permissions.teams.delete && currentUser.role === UserRole.Admin;
                        
                        return (
                            <TeamCard 
                                key={group.id}
                                group={group}
                                manager={manager}
                                members={members}
                                onEdit={(g) => openGroupModal(g)}
                                onDelete={handleDelete}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#1A2B4D] border-2 border-dashed border-[#2C3E5F] rounded-xl">
                    <UserGroupIcon className="w-16 h-16 mx-auto text-slate-600" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-300">لا توجد فرق لعرضها</h3>
                    <p className="mt-1 text-slate-500">
                        {permissions.teams.create ? 'ابدأ بإنشاء فريق جديد لإدارة أعضاء المبيعات.' : 'ليس لديك صلاحية لعرض أي فرق.'}
                    </p>
                </div>
            )}
        </>
    );
};

export default TeamManagementPage;