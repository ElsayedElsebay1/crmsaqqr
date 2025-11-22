import React, { useState, useCallback, useMemo } from 'react';
import { User } from '../types';
import UsersTable from '../components/users/UsersTable';
import PaginationControls from '../components/PaginationControls';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { FilePdfIcon } from '../components/icons/FilePdfIcon';
import { downloadCSV } from '../utils/csv';
import { useStore } from '../store/store';

interface UserManagementPageProps {}

const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const { 
    users, 
    roles, 
    deleteUser, 
    currentUser, 
    permissions,
    searchQuery,
    openUserModal,
    openConfirmationModal,
    closeConfirmationModal,
  } = useStore(state => ({
    users: state.users,
    roles: state.roles,
    deleteUser: state.deleteUser,
    currentUser: state.currentUser!,
    permissions: state.permissions!,
    searchQuery: state.searchQuery,
    openUserModal: state.openUserModal,
    openConfirmationModal: state.openConfirmationModal,
    closeConfirmationModal: state.closeConfirmationModal,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const rolesMap = new Map(roles.map(r => [r.id, r.name]));

  const filteredUsers = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) return users;

    return users.filter(user => 
      user.name.toLowerCase().includes(lowercasedQuery) ||
      user.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleDeleteRequest = useCallback((user: User) => {
    openConfirmationModal(
      `حذف المستخدم: ${user.name}`,
      <p>هل أنت متأكد من رغبتك في حذف هذا المستخدم؟<br /><span className="font-semibold text-yellow-400">لا يمكن التراجع عن هذا الإجراء.</span></p>,
      async () => {
        await deleteUser(user.id);
        closeConfirmationModal(); // Close manually after success
      }
    );
  }, [openConfirmationModal, deleteUser, closeConfirmationModal]);

  const handleExportCSV = () => {
    const dataToExport = users.map(user => ({
        'الاسم': user.name,
        'البريد الإلكتروني': user.email,
        'الدور الوظيفي': rolesMap.get(user.role) || user.role,
        'المكتب': user.officeLocation,
        'الحالة': user.isActive ? 'نشط' : 'غير نشط',
        'رابط الصورة': user.avatarUrl,
    }));
    const today = new Date().toISOString().split('T')[0];
    downloadCSV(`saqqr-crm-users-${today}.csv`, dataToExport);
  };

  const handleExportPDF = async () => {
    const { downloadPDF } = await import('../utils/pdf');
    const headers = ['الحالة', 'المكتب', 'الدور الوظيفي', 'البريد الإلكتروني', 'اسم المستخدم'];
    const data = users.map(user => [
        user.isActive ? 'نشط' : 'غير نشط',
        user.officeLocation,
        rolesMap.get(user.role) || user.role,
        user.email,
        user.name,
    ]);
    const today = new Date().toISOString().split('T')[0];
    downloadPDF('تقرير المستخدمين', headers, data, `saqqr-crm-users-${today}.pdf`);
  };


  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {permissions.users.create ? (
            <button
            onClick={() => openUserModal(null, true)}
            className="btn btn-primary order-1 sm:order-2 w-full sm:w-auto"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>إضافة مستخدم جديد</span>
            </button>
        ) : <div className="order-1 sm:order-2"></div>}

        <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-auto">
             <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                >
                <DownloadIcon className="h-5 w-5" />
                <span>CSV</span>
            </button>
             <button
                onClick={handleExportPDF}
                className="btn btn-secondary"
                >
                <FilePdfIcon className="h-5 w-5" />
                <span>PDF</span>
            </button>
        </div>
      </div>

      <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
        <div className="p-4">
            <UsersTable 
                users={paginatedUsers} 
                onEdit={openUserModal}
                onDelete={handleDeleteRequest}
                currentUserId={currentUser.id}
            />
        </div>
        {totalPages > 0 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(size) => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                }}
                totalItems={filteredUsers.length}
            />
        )}
      </div>
    </>
  );
};

export default UserManagementPage;