
import React from 'react';
import { Project, ProjectStatus } from '../../types';

interface ProjectCompletionReportProps {
  projects: Project[];
}

const ProjectCompletionReport: React.FC<ProjectCompletionReportProps> = ({ projects }) => {
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const planningProjects = projects.filter(p => p.status === ProjectStatus.PLANNING).length;
  const onHoldProjects = projects.filter(p => p.status === ProjectStatus.ON_HOLD).length;
  
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-6">تقرير حالة إنجاز المشاريع</h2>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">مشاريع مكتملة</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{completedProjects}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">قيد التنفيذ</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{inProgressProjects}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">في مرحلة التخطيط</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{planningProjects}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">مشاريع معلقة</p>
          <p className="text-3xl font-bold text-slate-500 mt-2">{onHoldProjects}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletionReport;
