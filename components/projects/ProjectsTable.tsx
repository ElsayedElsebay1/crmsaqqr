import React, { useMemo } from 'react';
import { Project, ProjectStatus, ProjectType, Task, TaskStatus, UserRole, User } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { CodeBracketIcon } from '../icons/CodeBracketIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { PROJECT_STATUSES } from '../../constants';
import { useStore } from '../../store/store';
import { ProjectModalTab } from '../../types';

interface ProjectsTableProps {
  projects: Project[];
  tasks: Task[];
  onEdit: (project: Project, initialTab?: ProjectModalTab) => void;
}

const TaskProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const barColor = progress === 100 
        ? 'bg-green-500' 
        : progress > 50 
        ? 'bg-[#00B7C1]' 
        : 'bg-yellow-500';

    return (
        <div className="w-full bg-[#2C3E5F] rounded-full h-2.5" title={`${Math.round(progress)}% مكتمل`}>
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-300 ease-in-out`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

const ProjectTypeIcon: React.FC<{ type: ProjectType }> = ({ type }) => {
    switch (type) {
        case ProjectType.WEB_DEVELOPMENT:
            return <span title="تطوير مواقع وتطبيقات"><CodeBracketIcon className="w-5 h-5 text-blue-400" /></span>;
        case ProjectType.DIGITAL_MARKETING:
            return <span title="تسويق رقمي"><MegaphoneIcon className="w-5 h-5 text-purple-400" /></span>;
        default:
            return <span title="مشروع"><BriefcaseIcon className="w-5 h-5 text-[#00B7C1]" /></span>;
    }
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, tasks, onEdit }) => {
  const { currentUser, users, permissions, updateProjectStatus } = useStore(state => ({
    currentUser: state.currentUser!,
    users: state.users,
    permissions: state.permissions!,
    updateProjectStatus: state.updateProjectStatus,
  }));
  
  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

  const canUpdate = (project: Project): boolean => {
    if (!permissions.projects.update) return false;
    if (currentUser.role === UserRole.Admin) return true;
    if (project.projectManagerId === currentUser.id) return true;
    if (currentUser.role === UserRole.Manager) {
        const pm = usersMap.get(project.projectManagerId || '');
        if (pm && pm.groupId === currentUser.groupId) {
            return true;
        }
    }
    return false;
  };

  const getStatusChip = (status: ProjectStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case ProjectStatus.PLANNING:
        return <span className={`${baseClasses} bg-purple-500/20 text-purple-300`}>تخطيط</span>;
      case ProjectStatus.IN_PROGRESS:
        return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>قيد التنفيذ</span>;
      case ProjectStatus.COMPLETED:
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>مكتمل</span>;
      case ProjectStatus.ON_HOLD:
        return <span className={`${baseClasses} bg-slate-500/20 text-slate-300`}>معلق</span>;
      case ProjectStatus.ARCHIVED:
        return <span className={`${baseClasses} bg-gray-600/20 text-gray-400`}>مؤرشف</span>;
      default:
        return <span className={`${baseClasses} bg-slate-600 text-slate-300`}>غير معروف</span>;
    }
  };
  
  const getStatusSelectClasses = (status: ProjectStatus) => {
    const baseClasses = "text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-[#00B7C1] appearance-none py-1 pl-8 pr-3 cursor-pointer transition-colors";
    switch (status) {
      case ProjectStatus.PLANNING: return `${baseClasses} bg-purple-500/20 text-purple-300 hover:bg-purple-500/30`;
      case ProjectStatus.IN_PROGRESS: return `${baseClasses} bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30`;
      case ProjectStatus.COMPLETED: return `${baseClasses} bg-green-500/20 text-green-300 hover:bg-green-500/30`;
      case ProjectStatus.ON_HOLD: return `${baseClasses} bg-slate-500/20 text-slate-300 hover:bg-slate-500/30`;
      case ProjectStatus.ARCHIVED: return `${baseClasses} bg-gray-600/20 text-gray-400 hover:bg-gray-600/30`;
      default: return `${baseClasses} bg-slate-600 text-slate-300 hover:bg-slate-500`;
    }
  };


  const getProjectTaskProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) {
        return { completed: 0, total: 0, progress: 0 };
    }
    const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const total = projectTasks.length;
    const progress = (completed / total) * 100;
    return { completed, total, progress };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
          <tr>
            <th scope="col" className="px-6 py-3">المشروع / العميل / المدير</th>
            <th scope="col" className="px-6 py-3 hidden lg:table-cell">الخدمات</th>
            <th scope="col" className="px-6 py-3">الحالة</th>
            <th scope="col" className="px-6 py-3">ملخص المهام</th>
            <th scope="col" className="px-6 py-3 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const { completed, total, progress } = getProjectTaskProgress(project.id);
            const userCanUpdate = canUpdate(project);
            const manager = usersMap.get(project.projectManagerId || '');
            return (
                <tr key={project.id} className="border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <ProjectTypeIcon type={project.projectType} />
                        <div className="font-medium text-slate-100">{project.name}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-8">
                        <span>{project.clientName}</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span>{manager?.name || 'غير محدد'}</span>
                    </div>
                </td>
                 <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="w-48">
                        {project.services && project.services.length > 0 ? (
                            <p className="truncate text-sm text-slate-300" title={project.services.join(', ')}>
                                {project.services.join(', ')}
                            </p>
                        ) : (
                            <span className="text-xs text-slate-500">لا توجد خدمات</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    {userCanUpdate ? (
                        <select
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
                            className={getStatusSelectClasses(project.status)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click/other events
                        >
                            {PROJECT_STATUSES.map(s => (
                                <option key={s.id} value={s.id} className="bg-[#1A2B4D] text-white font-semibold">
                                    {s.title}
                                </option>
                            ))}
                        </select>
                    ) : (
                        getStatusChip(project.status)
                    )}
                </td>
                <td className="px-6 py-4" style={{ minWidth: '180px' }}>
                    {total > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            <TaskProgressBar progress={progress} />
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">
                                    <span className="font-semibold text-slate-200">{completed}</span>
                                    <span className="mx-1">/</span>
                                    <span className="font-semibold text-slate-200">{total}</span>
                                    <span className="mr-1">مهام</span>
                                </span>
                                <span className="text-slate-300 font-mono font-semibold">{Math.round(progress)}%</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-500">لا يوجد مهام</span>
                    )}
                </td>
                <td className="px-6 py-4 text-center">
                    {permissions.projects.read && (
                        <button 
                        onClick={() => onEdit(project)}
                        className="btn btn-secondary !py-1 !px-3 !text-xs"
                        >
                            {userCanUpdate ? 'تعديل / عرض' : 'عرض التفاصيل'}
                        </button>
                    )}
                </td>
                </tr>
            )
          })}
          {projects.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-slate-500">
                لا توجد مشاريع لعرضها.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;