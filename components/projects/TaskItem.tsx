import React, { useState, useEffect } from 'react';
import { Task, User, TaskStatus, TaskPriority, Comment } from '../../types';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants';
import * as commentStorage from '../../utils/commentStorage';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CommentIcon } from '../icons/CommentIcon';

interface TaskItemProps {
  task: Task;
  allTasks: Task[];
  users: User[];
  currentUser: User;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  canEdit: boolean;
}

const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "الآن";
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    
    return date.toLocaleString('ar-SA', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

const TaskItem: React.FC<TaskItemProps> = ({ task, allTasks, users, currentUser, onUpdateTask, onAddTask, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const subtasks = allTasks.filter(t => t.parentId === task.id);
  const completedSubtasks = subtasks.filter(t => t.status === TaskStatus.DONE).length;

  useEffect(() => {
    setEditedTask(task);
    setComments(commentStorage.getCommentsForTask(task.id));
  }, [task]);

  const handleUpdate = () => {
    onUpdateTask(editedTask);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAssigneeChange = (userName: string) => {
    setEditedTask(prev => {
        const assignees = prev.assignedTo;
        const newAssignees = assignees.includes(userName)
            ? assignees.filter(name => name !== userName)
            : [...assignees, userName];
        return { ...prev, assignedTo: newAssignees };
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdateTask({ ...task, status: newStatus });
  };

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const commentData: Omit<Comment, 'id'> = {
          taskId: task.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatarUrl,
          text: newComment,
          timestamp: new Date().toISOString(),
      };
      const savedComment = commentStorage.addCommentForTask(task.id, commentData);
      setComments(prev => [...prev, savedComment]);
      setNewComment('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !canEdit) return;

    const newSubtask: Omit<Task, 'id'> = {
      projectId: task.projectId,
      parentId: task.id,
      title: newSubtaskTitle,
      assignedTo: [],
      status: TaskStatus.TODO,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: task.dueDate,
      priority: task.priority,
    };
    onAddTask(newSubtask);
    setNewSubtaskTitle('');
    setShowAddSubtask(false);
  };
  
  if (isEditing) {
    return (
        <div className="bg-[#2C3E5F] p-4 rounded-lg border border-[#00B7C1]">
            <input type="text" name="title" value={editedTask.title} onChange={handleChange} className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 mb-3 text-lg font-bold" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400">الحالة</label>
                    <select name="status" value={editedTask.status} onChange={handleChange} className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm">
                        {TASK_STATUSES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">الأولوية</label>
                    <select name="priority" value={editedTask.priority} onChange={handleChange} className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm">
                        {TASK_PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">تاريخ البدء</label>
                    <input type="date" name="startDate" value={editedTask.startDate || ''} onChange={handleChange} className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="text-xs text-slate-400">تاريخ الاستحقاق</label>
                    <input type="date" name="dueDate" value={editedTask.dueDate || ''} onChange={handleChange} className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm" />
                </div>
                 <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 mb-2 block">المسؤولون</label>
                    <div className="max-h-32 overflow-y-auto bg-[#0D1C3C] p-2 rounded-md border border-[#2C3E5F] flex flex-wrap gap-2">
                        {users.map(user => (
                            <label key={user.id} className="flex items-center gap-2 px-3 py-1 bg-[#2C3E5F] rounded-full cursor-pointer hover:bg-[#1A2B4D] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editedTask.assignedTo.includes(user.name)}
                                    onChange={() => handleAssigneeChange(user.name)}
                                    className="w-4 h-4 text-[#00B7C1] bg-[#1A2B4D] border-slate-500 rounded focus:ring-[#00B7C1]"
                                />
                                <span className="text-sm text-slate-200">{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={handleCancel} className="btn btn-secondary">إلغاء</button>
                <button onClick={handleUpdate} className="btn btn-primary">حفظ</button>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-[#2C3E5F]/50 p-3 rounded-lg border border-[#3E527B]">
      <div className="flex items-center gap-3">
        {canEdit && (
            <button
                onClick={() => handleStatusChange(task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE)}
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${task.status === TaskStatus.DONE ? 'bg-green-500 text-white' : 'border-2 border-slate-400 hover:border-green-400'}`}
                title={task.status === TaskStatus.DONE ? 'إعادة فتح المهمة' : 'إكمال المهمة'}
            >
                {task.status === TaskStatus.DONE && <CheckCircleIcon className="w-6 h-6" />}
            </button>
        )}
        <div className="flex-grow cursor-pointer" onClick={() => canEdit && setIsEditing(true)}>
            <p className={`font-semibold ${task.status === TaskStatus.DONE ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                {task.title}
            </p>
             <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                {task.dueDate && <span>تستحق في: {task.dueDate}</span>}
                {subtasks.length > 0 && <span>{completedSubtasks}/{subtasks.length} مهام فرعية مكتملة</span>}
            </div>
        </div>
        <button
            onClick={() => setShowComments(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-1 rounded-md"
        >
            <CommentIcon className="w-4 h-4" />
            <span>{comments.length}</span>
        </button>
        <div className="flex -space-x-3 items-center">
            {task.assignedTo.map(assigneeName => {
                const user = users.find(u => u.name === assigneeName);
                if (!user) return null;
                return (
                    <img
                        key={user.id}
                        src={user.avatarUrl}
                        alt={user.name}
                        title={user.name}
                        className="w-7 h-7 rounded-full border-2 border-[#1A2B4D] object-cover"
                    />
                );
            })}
        </div>
        {(subtasks.length > 0 || (canEdit && !task.parentId)) && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-[#1A2B4D]">
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
            </button>
        )}
      </div>
      {showComments && (
        <div className="mt-4 pt-3 border-t border-[#3E527B]/70">
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-3">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full mt-1" />
                        <div className="bg-[#1A2B4D]/60 p-2.5 rounded-lg flex-grow">
                            <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-sm text-slate-200">{comment.userName}</span>
                                <span className="text-xs text-slate-500">{formatCommentDate(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-center text-sm text-slate-500 py-4">لا توجد تعليقات بعد.</p>}
            </div>
            {canEdit && (
                <form onSubmit={handlePostComment} className="flex items-start gap-3">
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full mt-1" />
                    <div className="flex-grow">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="أضف تعليقاً..."
                            rows={2}
                            className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1] transition-colors"
                        />
                        <button type="submit" className="btn btn-primary !py-1 !px-3 mt-2">نشر</button>
                    </div>
                </form>
            )}
        </div>
      )}
      {isExpanded && (subtasks.length > 0 || (canEdit && !task.parentId)) && (
        <div className="mt-3 pt-3 border-t border-[#3E527B]/70 ml-8 space-y-2">
            {subtasks.map(subtask => (
                <TaskItem 
                    key={subtask.id}
                    task={subtask}
                    allTasks={allTasks}
                    users={users}
                    currentUser={currentUser}
                    onUpdateTask={onUpdateTask}
                    onAddTask={onAddTask}
                    canEdit={canEdit}
                />
            ))}

            {canEdit && !task.parentId && (
                <div className="mt-2">
                    {!showAddSubtask ? (
                        <button
                            onClick={() => setShowAddSubtask(true)}
                            className="flex items-center gap-1 text-sm text-[#00B7C1] hover:text-cyan-300 transition-colors py-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>إضافة مهمة فرعية</span>
                        </button>
                    ) : (
                        <form onSubmit={handleAddSubtask} className="p-2 bg-[#1A2B4D] rounded-md flex items-center gap-2">
                            <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                placeholder="عنوان المهمة الفرعية..."
                                className="flex-grow bg-[#2C3E5F] border border-[#3E527B] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#00B7C1]"
                                autoFocus
                            />
                            <button type="button" onClick={() => setShowAddSubtask(false)} className="text-xs px-2 py-1 rounded bg-slate-500 hover:bg-slate-400">إلغاء</button>
                            <button type="submit" className="text-xs px-2 py-1 rounded bg-[#00B7C1] hover:bg-[#00A3AD] text-white">إضافة</button>
                        </form>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;