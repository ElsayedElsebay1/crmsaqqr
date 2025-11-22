import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus, UserRole, User, TaskStatus } from '../types';
import ProjectsTable from '../components/projects/ProjectsTable';
import PaginationControls from '../components/PaginationControls';
import { downloadCSV } from '../utils/csv';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { FilePdfIcon } from '../components/icons/FilePdfIcon';
import { PROJECT_STATUSES, PROJECT_TYPES } from '../constants';
import { useStore } from '../store/store';
import { XCircleIcon } from '../components/icons/XCircleIcon';

interface ProjectsPageProps {}

const ProjectsPage: React.FC<ProjectsPageProps> = () => {
  const { 
    projects, 
    tasks,
    users, 
    currentUser,
    permissions, 
    searchQuery,
    initialFilter,
    clearInitialFilter,
    openProjectModal
  } = useStore(state => ({
    projects: state.projects,
    tasks: state.tasks,
    users: state.users,
    currentUser: state.currentUser!,
    permissions: state.permissions!,
    searchQuery: state.searchQuery,
    initialFilter: state.initialFilter,
    clearInitialFilter: state.clearInitialFilter,
    openProjectModal: state.openProjectModal,
  }));

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [tasksDueFilter, setTasksDueFilter] = useState<'today' | null>(null);
  const [managerFilter, setManagerFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (initialFilter && initialFilter.page === 'projects') {
      const { status, tasksDue } = initialFilter.filter;
      if (status) {
        setStatusFilter(status);
      }
      if (tasksDue) {
        setTasksDueFilter(tasksDue);
      }
      clearInitialFilter();
    }
  }, [initialFilter, clearInitialFilter]);
  
  const showArchived = statusFilter === ProjectStatus.ARCHIVED;

  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

  const visibleProjects = useMemo(() => {
    if (currentUser.role === UserRole.Admin) {
        return projects;
    }
    const isManager = currentUser.role === UserRole.Manager;
    const managerGroupMembers = isManager ? users.filter(u => u.groupId === currentUser.groupId).map(u => u.id) : [];
    
    return projects.filter(project => {
      if (currentUser.scope !== 'ALL' && project.scope !== currentUser.scope) return false;
      if(isManager && project.projectManagerId) return managerGroupMembers.includes(project.projectManagerId);
      if(currentUser.role === UserRole.ProjectManager) return project.projectManagerId === currentUser.id;
      return true;
    });
  }, [projects, currentUser, users]);

  const uniqueManagers = useMemo(() => {
    const managerIds = new Set(visibleProjects.map(p => p.projectManagerId).filter(Boolean) as string[]);
    return Array.from(managerIds).map(id => usersMap.get(id)).filter(Boolean) as User[];
  }, [visibleProjects, usersMap]);
  
  const filteredProjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    const today = new Date().toISOString().split('T')[0];
    const tasksDueTodayProjectIds = tasksDueFilter === 'today'
        ? new Set(tasks.filter(t => t.dueDate === today && t.status !== TaskStatus.DONE).map(t => t.projectId))
        : null;

    return visibleProjects.filter(p => {
      const archiveMatch = showArchived || p.status !== ProjectStatus.ARCHIVED;
      const statusMatch = !statusFilter || p.status === statusFilter;
      const tasksDueMatch = !tasksDueTodayProjectIds || tasksDueTodayProjectIds.has(p.id);
      const managerMatch = !managerFilter || p.projectManagerId === managerFilter;
      const startDateMatch = !startDateFilter || p.startDate >= startDateFilter;
      const endDateMatch = !endDateFilter || p.startDate <= endDateFilter;
      const searchMatch = !lowercasedQuery || p.name.toLowerCase().includes(lowercasedQuery) || p.clientName.toLowerCase().includes(lowercasedQuery);
      return archiveMatch && statusMatch && tasksDueMatch && managerMatch && startDateMatch && endDateMatch && searchMatch;
    });
  }, [visibleProjects, statusFilter, tasksDueFilter, managerFilter, startDateFilter, endDateFilter, searchQuery, tasks]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, tasksDueFilter, managerFilter, startDateFilter, endDateFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);
  
  const clearAllFilters = () => {
    setStatusFilter('');
    setTasksDueFilter(null);
    setManagerFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ProjectStatus | '');
    setTasksDueFilter(null); // Clear other dashboard filters
  };

  const activeFilterMessage = useMemo(() => {
    if (tasksDueFilter === 'today') return 'فلتر نشط: مهام تستحق اليوم';
    if (statusFilter) {
      const statusText = PROJECT_STATUSES.find(s => s.id === statusFilter)?.title;
      return `فلتر نشط: ${statusText}`;
    }
    return null;
  }, [statusFilter, tasksDueFilter]);
  
  const handleExportCSV = () => { /* ... (no changes needed) ... */ };
  const handleExportPDF = async () => { /* ... (no changes needed) ... */ };

  return (
    <>
      <div className="mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full">
            <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full sm:w-auto bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
            >
                <option value="">كل الحالات</option>
                {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="manager-filter" className="text-sm font-medium text-slate-300 flex-shrink-0">
                    مدير المشروع:
                </label>
                <select
                    id="manager-filter" value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}
                    className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                >
                    <option value="">الكل</option>
                    {uniqueManagers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="start-date-filter" className="text-sm font-medium text-slate-300">من تاريخ البدء:</label>
                <input type="date" id="start-date-filter" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="bg-[#2C3E5F] border-[#3E527B] rounded-md px-3 py-1.5 text-sm"/>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="end-date-filter" className="text-sm font-medium text-slate-300">إلى تاريخ البدء:</label>
                <input type="date" id="end-date-filter" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="bg-[#2C3E5F] border-[#3E527B] rounded-md px-3 py-1.5 text-sm"/>
            </div>
             {activeFilterMessage && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-sm rounded-lg">
                    <span className="font-semibold text-slate-300">{activeFilterMessage}</span>
                     <button onClick={clearAllFilters} className="text-slate-400 hover:text-white">
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 w-full xl:w-auto justify-center flex-shrink-0">
            {permissions.projects.create && (
                 <button onClick={() => openProjectModal(null, true)} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    <span>إضافة مشروع</span>
                </button>
            )}
        </div>
      </div>
      <div className="bg-[#1A2B4D] rounded-xl shadow-lg">
        <div className="p-4">
          <ProjectsTable 
              projects={paginatedProjects} 
              tasks={tasks} 
              onEdit={(p, tab) => openProjectModal(p, false, tab)}
          />
        </div>
        {totalPages > 0 && (
          <PaginationControls 
            currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage} onItemsPerPageChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
            totalItems={filteredProjects.length}
          />
        )}
      </div>
    </>
  );
};

export default ProjectsPage;