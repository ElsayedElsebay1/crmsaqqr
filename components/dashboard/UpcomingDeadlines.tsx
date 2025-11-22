import React, { useMemo } from 'react';
import { Deal, Project, Task, TaskStatus } from '../../types';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { useStore } from '../../store/store';

interface UpcomingDeadlinesProps {
  deals: Deal[];
  tasks: Task[];
  projects: Project[];
}

interface DeadlineItem {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'task';
  context: string;
  originalObject: Deal | Task;
}

const formatRelativeDate = (date: Date): { text: string; className:string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = itemDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'متأخرة', className: 'text-red-400 font-bold' };
  }
  if (diffDays === 0) {
    return { text: 'اليوم', className: 'text-orange-400 font-bold' };
  }
  if (diffDays === 1) {
    return { text: 'غداً', className: 'text-yellow-400' };
  }
  if (diffDays > 1 && diffDays <= 7) {
    return { text: `بعد ${diffDays} أيام`, className: 'text-slate-300' };
  }
  return { text: date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }), className: 'text-slate-400' };
};

const DeadlineIcon: React.FC<{ type: 'meeting' | 'task' }> = ({ type }) => {
    const baseClass = "w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0";
    if (type === 'meeting') {
        return <div className={`${baseClass} bg-blue-500/80`}><CalendarIcon className="w-5 h-5" /></div>;
    }
    return <div className={`${baseClass} bg-purple-500/80`}><ClipboardListIcon className="w-5 h-5" /></div>;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deals, tasks, projects }) => {
    const { openDealModal, openProjectModal } = useStore(state => ({
        openDealModal: state.openDealModal,
        openProjectModal: state.openProjectModal,
    }));
    
    const upcomingItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const projectsMap = new Map(projects.map(p => [p.id, p.name]));

        const dealItems: DeadlineItem[] = deals
            .filter(deal => deal.nextMeetingDate && new Date(deal.nextMeetingDate) >= today)
            .map(deal => ({
                id: `deal-${deal.id}`,
                title: `اجتماع بخصوص "${deal.title}"`,
                date: new Date(deal.nextMeetingDate!),
                type: 'meeting' as const,
                context: deal.companyName,
                originalObject: deal,
            }));
        
        const taskItems: DeadlineItem[] = tasks
            .filter(task => task.dueDate && task.status !== TaskStatus.DONE)
            .map(task => ({
                id: `task-${task.id}`,
                title: task.title,
                date: new Date(task.dueDate!),
                type: 'task' as const,
                context: projectsMap.get(task.projectId) || `مشروع #${task.projectId}`,
                originalObject: task,
            }));

        return [...dealItems, ...taskItems]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5);

    }, [deals, tasks, projects]);
    
    const handleItemClick = (item: DeadlineItem) => {
        if (item.type === 'meeting') {
            openDealModal(item.originalObject as Deal);
        } else if (item.type === 'task') {
            const task = item.originalObject as Task;
            const project = projects.find(p => p.id === task.projectId);
            if(project) {
                openProjectModal(project, false, 'tasks');
            }
        }
    };


    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 h-full">
            <div className="flex items-center gap-3 mb-6">
                <CalendarIcon className="w-6 h-6 text-teal-400" />
                <h2 className="text-lg font-bold text-slate-100">المواعيد والمهام القادمة</h2>
            </div>
            <div className="space-y-4">
                {upcomingItems.length > 0 ? (
                    upcomingItems.map(item => {
                        const { text, className } = formatRelativeDate(item.date);
                        return (
                            <button key={item.id} onClick={() => handleItemClick(item)} className="w-full text-right flex items-start gap-4 p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <DeadlineIcon type={item.type} />
                                <div>
                                    <p className="text-sm text-slate-200 leading-relaxed">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className={`text-xs font-semibold ${className}`}>{text}</p>
                                        <span className="text-slate-600 text-xs">•</span>
                                        <p className="text-xs text-slate-400 truncate" title={item.context}>{item.context}</p>
                                    </div>
                                </div>
                            </button>
                        )
                    })
                ) : (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-sm text-slate-400 text-center">لا توجد مواعيد أو مهام قادمة.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpcomingDeadlines;