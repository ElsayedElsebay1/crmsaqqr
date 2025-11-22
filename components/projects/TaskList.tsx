import React, { useState } from 'react';
import { Task, User, TaskStatus, TaskPriority, UserRole } from '../../types';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants';
import TaskItem from './TaskItem';

interface TaskListProps {
  projectId: string;
  tasksToDisplay: Task[];
  allProjectTasks: Task[];
  users: User[];
  currentUser: User;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  canEdit: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, tasksToDisplay, allProjectTasks, users, currentUser, onAddTask, onUpdateTask, canEdit }) => {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !canEdit) return;

    const isSalesOrTelesales = currentUser.role === UserRole.Sales || currentUser.role === UserRole.Telesales;

    const newTask: Omit<Task, 'id'> = {
      projectId: projectId,
      title: newTaskTitle,
      assignedTo: isSalesOrTelesales ? [currentUser.name] : [],
      status: TaskStatus.TODO,
      startDate: today,
      dueDate: tomorrow,
      priority: TaskPriority.MEDIUM,
    };
    onAddTask(newTask);
    setNewTaskTitle('');
    setShowAddTaskForm(false);
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          {!showAddTaskForm ? (
            <button onClick={() => setShowAddTaskForm(true)} className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              <span>إضافة مهمة جديدة</span>
            </button>
          ) : (
            <form onSubmit={handleAddTask} className="p-4 bg-[#2C3E5F]/50 rounded-lg flex items-center gap-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="اكتب عنوان المهمة الجديدة..."
                className="flex-grow bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowAddTaskForm(false)} className="btn btn-secondary">إلغاء</button>
                <button type="submit" className="btn btn-primary">إضافة</button>
              </div>
            </form>
          )}
        </div>
      )}
      <div className="space-y-2">
        {tasksToDisplay.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            allTasks={allProjectTasks}
            users={users}
            currentUser={currentUser}
            onUpdateTask={onUpdateTask}
            onAddTask={onAddTask}
            canEdit={canEdit}
          />
        ))}
         {allProjectTasks.length === 0 && (
            <p className="text-center text-slate-400 py-8">
                لا توجد مهام في هذا المشروع بعد.
            </p>
        )}
      </div>
    </div>
  );
};

export default TaskList;