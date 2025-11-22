import React from 'react';
import { User } from '../../types';
import { useStore } from '../../store/store';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId: string;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete, currentUserId }) => {
  const { roles, permissions } = useStore(state => ({
    roles: state.roles,
    permissions: state.permissions!,
  }));

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || 'Unknown';
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
          <tr>
            <th scope="col" className="px-6 py-3">المستخدم</th>
            <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
            <th scope="col" className="px-6 py-3">الدور الوظيفي</th>
            <th scope="col" className="px-6 py-3">الحالة</th>
            <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#00B7C1] rounded-full flex items-center justify-center font-bold text-white border-2 border-[#2C3E5F] flex-shrink-0">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <span className="font-medium text-slate-100">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-400">{user.email}</td>
              <td className="px-6 py-4">
                <span className="bg-[#2C3E5F] text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                    {getRoleName(user.role)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                    <span>{user.isActive ? 'نشط' : 'غير نشط'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-4">
                   {permissions.users.update && (
                    <button 
                        onClick={() => onEdit(user)}
                        className="font-medium text-blue-400 hover:underline"
                        >
                            تعديل
                        </button>
                   )}
                   <button 
                        onClick={() => onDelete(user)}
                        className="font-medium text-red-400 hover:underline disabled:text-slate-500 disabled:cursor-not-allowed disabled:no-underline"
                        disabled={!permissions.users.delete || user.id === currentUserId}
                        title={
                            !permissions.users.delete
                            ? 'ليس لديك صلاحية الحذف'
                            : user.id === currentUserId
                            ? 'لا يمكنك حذف حسابك'
                            : 'حذف المستخدم'
                        }
                        >
                            حذف
                        </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-slate-500">
                لا يوجد مستخدمون لعرضهم.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;