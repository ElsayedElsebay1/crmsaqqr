import React from 'react';
import { Project, ProjectStatus, Task, TaskStatus } from '../../types';
import { PROJECT_STATUSES } from '../../constants';
import { CogIcon } from '../icons/CogIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { useStore } from '../../store/store';

interface ProjectStatusSummaryProps {
  projects: Project[];
  tasks: Task[];
}

const statusMeta: Record<ProjectStatus, { icon: React.ReactNode, color: string, bgColor: string }> = {
  [ProjectStatus.PLANNING]: { icon: <LightbulbIcon className="w-6 h-6" />, color: 'text-purple-400', bgColor: 'bg-purple-500' },
  [ProjectStatus.IN_PROGRESS]: { icon: <CogIcon className="w-6 h-6 animate-spin-slow" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  [ProjectStatus.COMPLETED]: { icon: <CheckCircleIcon className="w-6 h-6" />, color: 'text-green-400', bgColor: 'bg-green-500' },
  [ProjectStatus.ON_HOLD]: { icon: <PauseIcon className="w-6 h-6" />, color: 'text-slate-400', bgColor: 'bg-slate-500' },
  [ProjectStatus.ARCHIVED]: { icon: <ArchiveBoxIcon className="w-6 h-6" />, color: 'text-gray-500', bgColor: 'bg-gray-600' },
};

const StatItem: React.FC<{ 
    statusInfo: {id: ProjectStatus, title: string}; 
    projectCount: number;
    totalTasks: number;
    completedTasks: number;
    onClick: () => void;
}> = ({ statusInfo, projectCount, totalTasks, completedTasks, onClick }) => {
    const meta = statusMeta[statusInfo.id];
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Don't show progress for 'Completed' or 'Archived' projects, as it's not relevant.
    const shouldShowProgress = totalTasks > 0 && statusInfo.id !== ProjectStatus.COMPLETED && statusInfo.id !== ProjectStatus.ARCHIVED;

    return (
        <button onClick={onClick} className="w-full text-right flex-1 flex flex-col p-4 bg-slate-800/50 rounded-xl border border-slate-700 gap-4 hover:bg-slate-800/80 hover:border-[var(--color-primary)] transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${meta.bgColor} bg-opacity-10 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="mr-2">
                  <p className="text-2xl font-bold text-slate-100">{projectCount}</p>
                  <p className="text-sm text-slate-400">{statusInfo.title}</p>
                </div>
            </div>
             {shouldShowProgress && (
                <div className="mt-auto pt-2">
                     <div className="w-full bg-slate-700 rounded-full h-1.5" title={`${Math.round(progress)}%`}>
                        <div 
                            className={`${meta.bgColor} h-1.5 rounded-full`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-1.5">
                        {completedTasks} / {totalTasks} مهمة مكتملة
                    </p>
                </div>
            )}
        </button>
    );
};


const ProjectStatusSummary: React.FC<ProjectStatusSummaryProps> = ({ projects, tasks }) => {
  const navigateToWithFilter = useStore(state => state.navigateToWithFilter);
  
  const statusData = React.useMemo(() => {
    const data: Record<ProjectStatus, { projectCount: number; totalTasks: number; completedTasks: number; }> = {
        [ProjectStatus.PLANNING]: { projectCount: 0, totalTasks: 0, completedTasks: 0 },
        [ProjectStatus.IN_PROGRESS]: { projectCount: 0, totalTasks: 0, completedTasks: 0 },
        [ProjectStatus.COMPLETED]: { projectCount: 0, totalTasks: 0, completedTasks: 0 },
        [ProjectStatus.ON_HOLD]: { projectCount: 0, totalTasks: 0, completedTasks: 0 },
        [ProjectStatus.ARCHIVED]: { projectCount: 0, totalTasks: 0, completedTasks: 0 },
    };

    const tasksByProject = tasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
            acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    for (const project of projects) {
        const projectStatus = project.status;
        data[projectStatus].projectCount++;
        
        const projectTasks = tasksByProject[project.id] || [];
        data[projectStatus].totalTasks += projectTasks.length;
        data[projectStatus].completedTasks += projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    }

    return data;
  }, [projects, tasks]);


  return (
    <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">ملخص حالة المشاريع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PROJECT_STATUSES.map(statusInfo => {
            const data = statusData[statusInfo.id];
            return (
                <StatItem 
                    key={statusInfo.id}
                    statusInfo={statusInfo}
                    projectCount={data.projectCount}
                    totalTasks={data.totalTasks}
                    completedTasks={data.completedTasks}
                    onClick={() => navigateToWithFilter('projects', { status: statusInfo.id })}
                />
            )
        })}
        </div>
    </div>
  );
};

export default ProjectStatusSummary;