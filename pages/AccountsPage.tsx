import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/store';
import { Account } from '../types';
import PaginationControls from '../components/PaginationControls';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';

const AccountsTable: React.FC<{
    accounts: Account[];
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
    onViewDetails: (account: Account) => void;
    canEdit: boolean;
    canDelete: boolean;
}> = ({ accounts, onEdit, onDelete, onViewDetails, canEdit, canDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
                    <tr>
                        <th scope="col" className="px-6 py-3">اسم الحساب</th>
                        <th scope="col" className="px-6 py-3">المجال</th>
                        <th scope="col" className="px-6 py-3">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map(account => (
                        <tr key={account.id} className="border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40">
                            <td className="px-6 py-4 font-medium text-slate-100">
                                <button onClick={() => onViewDetails(account)} className="hover:text-[#00B7C1] hover:underline">
                                    {account.name}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{account.industry || '-'}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${account.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>
                                    {account.status === 'Active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-4">
                                    {canEdit && (
                                        <button onClick={() => onEdit(account)} className="p-1 text-blue-400 hover:text-blue-300 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                    )}
                                    {canDelete && (
                                        <button onClick={() => onDelete(account)} className="p-1 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {accounts.length === 0 && (
                         <tr>
                            <td colSpan={4} className="text-center py-10 text-slate-500">
                                لا توجد حسابات لعرضها.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const AccountsPage: React.FC = () => {
    const {
        accounts,
        permissions,
        searchQuery,
        openAccountModal,
        openAccountDetailsModal,
        openConfirmationModal,
        deleteAccount,
    } = useStore(state => ({
        accounts: state.accounts,
        permissions: state.permissions!,
        searchQuery: state.searchQuery,
        openAccountModal: state.openAccountModal,
        openAccountDetailsModal: state.openAccountDetailsModal,
        openConfirmationModal: state.openConfirmationModal,
        deleteAccount: state.deleteAccount,
    }));

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredAccounts = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return accounts;
        return accounts.filter(acc =>
            acc.name.toLowerCase().includes(lowercasedQuery) ||
            (acc.industry && acc.industry.toLowerCase().includes(lowercasedQuery))
        );
    }, [accounts, searchQuery]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAccounts, currentPage, itemsPerPage]);

    const handleDeleteRequest = useCallback((account: Account) => {
        openConfirmationModal(
            `حذف الحساب: ${account.name}`,
            <p>هل أنت متأكد؟ سيؤدي هذا إلى حذف الحساب بشكل دائم.</p>,
            () => deleteAccount(account.id)
        );
    }, [openConfirmationModal, deleteAccount]);

    return (
        <>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-[#00B7C1]" />
                    <span>إدارة الحسابات</span>
                </h1>
                {permissions.accounts.create && (
                    <button onClick={() => openAccountModal(null, true)} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5" />
                        <span>إضافة حساب</span>
                    </button>
                )}
            </div>

            <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
                <AccountsTable
                    accounts={paginatedAccounts}
                    onEdit={openAccountModal}
                    onDelete={handleDeleteRequest}
                    onViewDetails={openAccountDetailsModal}
                    canEdit={permissions.accounts.update}
                    canDelete={permissions.accounts.delete}
                />
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
                        totalItems={filteredAccounts.length}
                    />
                )}
            </div>
        </>
    );
};

export default AccountsPage;