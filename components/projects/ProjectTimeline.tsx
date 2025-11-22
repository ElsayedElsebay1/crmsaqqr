
import React, { useMemo } from 'react';
import { Task, User } from '../../types';

interface ProjectTimelineProps {
  tasks: Task[];
  users: User[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ tasks, users }) => {

  const timelineEvents = useMemo(() => {
    const events: { date: Date; text: string; type: 'start' | 'due' }[] = [];
    tasks.forEach(task => {
      if (task.startDate) {
        events.push({ date: new Date(task.startDate), text: `بدء: ${task.title}`, type: 'start' });
      }
      if (task.dueDate) {
        events.push({ date: new Date(task.dueDate), text: `استحقاق: ${task.title}`, type: 'due' });
      }
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks]);

  if (timelineEvents.length === 0) {
    return <p className="text-center text-slate-400 py-8">لا توجد مهام بتواريخ محددة لعرضها في الجدول الزمني.</p>;
  }

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-slate-600"></div>
      
      <div className="space-y-8">
        {timelineEvents.map((event, index) => (
          <div key={index} className="relative flex items-start">
            <div className={`absolute top-1/2 -translate-y-1/2 left-4 -translate-x-1/2 w-4 h-4 rounded-full z-10 ${event.type === 'start' ? 'bg-teal-500' : 'bg-yellow-500'}`}></div>
            <div className="flex-grow pl-8">
              <p className="font-semibold text-slate-100">{event.text}</p>
              <p className="text-sm text-slate-400">{event.date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;
