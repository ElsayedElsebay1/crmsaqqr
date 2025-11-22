import React, { useState, useMemo } from 'react';
import { ActivityLogEntry, User, Role } from '../../types';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';

interface UserActivityLogProps {
  log: ActivityLogEntry[];
  users: User[];
  roles: Role[];
}

const ITEMS_PER_PAGE = 15;

const UserActivityLog: React.FC<UserActivityLogProps> = ({ log, users, roles }) => {
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const rolesMap = useMemo(() => new Map(roles.map(r => [r.id, r.name])), [roles]);
  const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const filteredLog = useMemo(() => {
    let filtered = [...log]; // Create a mutable copy

    if (userFilter) {
      filtered = filtered.filter(entry => entry.userId === userFilter);
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= end);
    }
    
    // The log is already sorted newest first from App.tsx
    return filtered;
  }, [log, userFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredLog.length / ITEMS_PER_PAGE);
  const paginatedLog = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLog.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLog, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const clearFilters = () => {
    setUserFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">سجل نشاط المستخدمين</h2>
      
      <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col sm:flex-row flex-wrap items-center gap-4 border border-slate-700">
          <div className="flex items-center gap-2">
            <label htmlFor="user-filter" className="text-sm text-slate-400">المستخدم:</label>
            <select
                id="user-filter"
                value={userFilter}
                onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
                <option value="">الكل</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
              <label htmlFor="logStartDate" className="text-sm text-slate-400">من</label>
              <input 
                  type="date" 
                  id="logStartDate"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
          </div>
          <div className="flex items-center gap-2">
              <label htmlFor="logEndDate" className="text-sm text-slate-400">إلى</label>
              <input 
                  type="date" 
                  id="logEndDate"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
          </div>
          {(userFilter || startDate || endDate) && (
              <button
                  onClick={clearFilters}
                  className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm"
              >
                  مسح الفلاتر
              </button>
          )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">المستخدم</th>
              <th scope="col" className="px-6 py-3">الإجراء</th>
              <th scope="col" className="px-6 py-3">الوقت والتاريخ</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLog.map(entry => {
              const user = usersMap.get(entry.userId);
              const name = user ? user.name : entry.userName.split(' (')[0]; 
              const role = user ? rolesMap.get(user.role) : null;
              const avatar = user ? user.avatarUrl : entry.userAvatar;

              return (
                <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-600 flex-shrink-0">
                            {avatar ? (
                                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-slate-100">{name}</span>
                          {role && (
                            <span className="text-xs text-slate-400">({role})</span>
                          )}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{entry.action}</td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('ar-SA', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              );
            })}
            {filteredLog.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-500">
                        لا توجد سجلات تطابق معايير البحث.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
            <span className="text-sm text-slate-400">
                صفحة {currentPage} من {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
                <span className="font-semibold">{currentPage}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityLog;