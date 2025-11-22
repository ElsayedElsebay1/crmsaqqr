import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { PROJECT_STATUSES } from '../../constants';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';

interface ProjectsStatusChartProps {
  projects: Project[];
}

const ProgressBar: React.FC<{ color: string; percentage: number }> = ({ color, percentage }) => (
    <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
);

const ProjectsStatusChart: React.FC<ProjectsStatusChartProps> = ({ projects }) => {
    
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<ProjectStatus, number>);

    const totalProjects = projects.length;

    const statusColors: Record<ProjectStatus, string> = {
        [ProjectStatus.PLANNING]: 'bg-purple-500',
        [ProjectStatus.IN_PROGRESS]: 'bg-yellow-500',
        [ProjectStatus.COMPLETED]: 'bg-green-500',
        [ProjectStatus.ON_HOLD]: 'bg-slate-500',
        [ProjectStatus.ARCHIVED]: 'bg-gray-600',
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 h-full">
            <div className="flex items-center gap-3 mb-6">
                <BriefcaseIcon className="w-6 h-6 text-teal-400" />
                <h2 className="text-lg font-bold text-slate-100">نظرة عامة على المشاريع</h2>
            </div>
            <div className="space-y-5">
                {PROJECT_STATUSES.map(statusInfo => {
                    const count = statusCounts[statusInfo.id] || 0;
                    const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                    return (
                        <div key={statusInfo.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-slate-300">{statusInfo.title}</span>
                                <span className="text-sm font-bold text-slate-200">{count}</span>
                            </div>
                            <ProgressBar color={statusColors[statusInfo.id]} percentage={percentage} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectsStatusChart;
