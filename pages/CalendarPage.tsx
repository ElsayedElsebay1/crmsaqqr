import React, { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { Deal, Task, UserRole, TaskStatus } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';

type CalendarEvent = {
  id: string;
  title: string;
  type: 'meeting' | 'task';
  originalObject: Deal | Task;
};

const CalendarPage: React.FC = () => {
    const { deals, tasks, projects, currentUser, users, openDealModal, openProjectModal } = useStore(state => ({
        deals: state.deals,
        tasks: state.tasks,
        projects: state.projects,
        currentUser: state.currentUser!,
        users: state.users,
        openDealModal: state.openDealModal,
        openProjectModal: state.openProjectModal,
    }));

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filters, setFilters] = useState({ meetings: true, tasks: true });

    // --- Data Scoping ---
    const visibleData = useMemo(() => {
        const isManager = currentUser.role === UserRole.Manager;
        const managerGroupMembers = isManager ? users.filter(u => u.groupId === currentUser.groupId).map(u => u.id) : [];

        const isVisible = (item: { scope: string, ownerId?: string, projectManagerId?: string }) => {
            if (currentUser.role === UserRole.Admin) return true;
            if (currentUser.scope !== 'ALL' && item.scope !== currentUser.scope) return false;

            if (isManager) {
                return (item.ownerId && managerGroupMembers.includes(item.ownerId)) || (item.projectManagerId && managerGroupMembers.includes(item.projectManagerId));
            }
            
            return item.ownerId === currentUser.id || item.projectManagerId === currentUser.id;
        };
        
        const visibleDeals = deals.filter(isVisible);
        const visibleProjects = projects.filter(isVisible);
        const visibleProjectIds = new Set(visibleProjects.map(p => p.id));
        const visibleTasks = tasks.filter(task => visibleProjectIds.has(task.projectId));
        
        return { visibleDeals, visibleTasks };
    }, [deals, tasks, projects, currentUser, users]);

    // --- Event Processing ---
    const eventsByDate = useMemo(() => {
        const eventsMap = new Map<string, CalendarEvent[]>();
        
        if (filters.meetings) {
            visibleData.visibleDeals.forEach(deal => {
                if (deal.nextMeetingDate) {
                    const dateKey = deal.nextMeetingDate;
                    const event: CalendarEvent = {
                        id: deal.id,
                        title: deal.title,
                        type: 'meeting',
                        originalObject: deal,
                    };
                    if (!eventsMap.has(dateKey)) eventsMap.set(dateKey, []);
                    eventsMap.get(dateKey)!.push(event);
                }
            });
        }
        
        if (filters.tasks) {
            visibleData.visibleTasks.forEach(task => {
                if (task.dueDate && task.status !== TaskStatus.DONE) {
                    const dateKey = task.dueDate;
                     const event: CalendarEvent = {
                        id: task.id,
                        title: task.title,
                        type: 'task',
                        originalObject: task,
                    };
                    if (!eventsMap.has(dateKey)) eventsMap.set(dateKey, []);
                    eventsMap.get(dateKey)!.push(event);
                }
            });
        }
        
        return eventsMap;
    }, [visibleData, filters]);

    // --- Calendar Grid Generation ---
    const { calendarGrid, weekDays } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid = [];
        let day = 1;
        for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
            if (day > daysInMonth) break;
            const week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    week.push(null);
                } else if (day > daysInMonth) {
                    week.push(null);
                } else {
                    week.push(day++);
                }
            }
            grid.push(week);
        }
        const weekDayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return { calendarGrid: grid, weekDays: weekDayNames };
    }, [currentMonth]);
    
    // --- Handlers ---
    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleEventClick = (event: CalendarEvent) => {
        if (event.type === 'meeting') {
            openDealModal(event.originalObject as Deal);
        } else if (event.type === 'task') {
            const task = event.originalObject as Task;
            const project = projects.find(p => p.id === task.projectId);
            if (project) {
                openProjectModal(project, false, 'tasks');
            }
        }
    };
    
    const handleFilterChange = (filter: keyof typeof filters) => {
        setFilters(prev => ({...prev, [filter]: !prev[filter]}));
    };

    return (
        <div className="bg-[#1A2B4D] rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
                    <span className="font-semibold text-lg text-center w-40 text-slate-100">{currentMonth.toLocaleString('ar-SA', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={filters.meetings} onChange={() => handleFilterChange('meetings')} className="w-4 h-4 text-blue-400 bg-slate-700 border-slate-600 rounded focus:ring-blue-400" />
                        <span className="text-sm text-blue-300">اجتماعات</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={filters.tasks} onChange={() => handleFilterChange('tasks')} className="w-4 h-4 text-purple-400 bg-slate-700 border-slate-600 rounded focus:ring-purple-400" />
                        <span className="text-sm text-purple-300">مهام</span>
                    </label>
                </div>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-px bg-[#2C3E5F] border border-[#2C3E5F] rounded-lg overflow-hidden">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-sm py-2 bg-[#1A2B4D] text-slate-300">{day}</div>
                ))}
                {calendarGrid.flat().map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="bg-[#1A2B4D]/50"></div>;
                    
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateKey = date.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div key={day} className="min-h-[120px] bg-[#1A2B4D] p-1.5 overflow-hidden">
                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1 ${isToday ? 'bg-[var(--color-primary)] text-white' : 'text-slate-200'}`}>{day}</div>
                            <div className="space-y-1 overflow-y-auto max-h-[85px] pr-1">
                                {dayEvents.map(event => (
                                    <button key={`${event.type}-${event.id}`} onClick={() => handleEventClick(event)} className="w-full text-right p-1 rounded-md text-xs flex items-start gap-1.5 transition-colors bg-opacity-20 hover:bg-opacity-40"
                                        style={{ backgroundColor: event.type === 'meeting' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(192, 132, 252, 0.2)' }}
                                    >
                                        <div className="mt-0.5">{event.type === 'meeting' ? <CalendarIcon className="w-3 h-3 text-blue-300" /> : <ClipboardListIcon className="w-3 h-3 text-purple-300" />}</div>
                                        <span className="truncate" style={{ color: event.type === 'meeting' ? '#93c5fd' : '#d8b4fe' }}>{event.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarPage;