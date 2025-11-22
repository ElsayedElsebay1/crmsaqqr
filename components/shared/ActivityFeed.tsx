import React, { useState, useMemo } from 'react';
import { Activity, ActivityType, User } from '../../types';
import { useStore } from '../../store/store';
import { formatRelativeTime } from '../../utils/date';
import { ClipboardDocumentIcon } from '../icons/ClipboardDocumentIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { CalendarDaysIcon } from '../icons/CalendarDaysIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

interface ActivityFeedProps {
  activities: Activity[];
  onAddActivity: (newActivity: Omit<Activity, 'id'>) => void;
  disabled: boolean;
}

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const iconMap: Record<ActivityType, { icon: React.ReactNode, color: string }> = {
        NOTE: { icon: <ClipboardDocumentIcon className="w-5 h-5" />, color: 'text-slate-400' },
        CALL: { icon: <PhoneIcon className="w-5 h-5" />, color: 'text-blue-400' },
        EMAIL: { icon: <EnvelopeIcon className="w-5 h-5" />, color: 'text-purple-400' },
        MEETING: { icon: <CalendarDaysIcon className="w-5 h-5" />, color: 'text-green-400' },
    };
    const { icon, color } = iconMap[type];
    return <div className={`flex-shrink-0 ${color}`}>{icon}</div>;
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onAddActivity, disabled }) => {
    const { users, currentUser } = useStore(state => ({
        users: state.users,
        currentUser: state.currentUser!,
    }));

    const [newActivityContent, setNewActivityContent] = useState('');
    const [newActivityType, setNewActivityType] = useState<ActivityType>('NOTE');

    const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);
    const sortedActivities = useMemo(() => [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [activities]);

    const handleAddClick = () => {
        if (!newActivityContent.trim()) return;

        const newActivity: Omit<Activity, 'id'> = {
            type: newActivityType,
            content: newActivityContent,
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
        };

        onAddActivity(newActivity);
        setNewActivityContent('');
        setNewActivityType('NOTE');
    };
    
    const activityTypeOptions: { id: ActivityType, label: string, icon: React.ReactNode }[] = [
        { id: 'NOTE', label: 'ملاحظة', icon: <ClipboardDocumentIcon className="w-4 h-4" /> },
        { id: 'CALL', label: 'مكالمة', icon: <PhoneIcon className="w-4 h-4" /> },
        { id: 'EMAIL', label: 'بريد', icon: <EnvelopeIcon className="w-4 h-4" /> },
        { id: 'MEETING', label: 'اجتماع', icon: <CalendarDaysIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-4">
            {/* New Activity Input */}
            {!disabled && (
                 <div className="bg-[#2C3E5F]/50 p-3 rounded-lg border border-[#3E527B]">
                    <textarea
                        value={newActivityContent}
                        onChange={(e) => setNewActivityContent(e.target.value)}
                        placeholder="أضف ملاحظة، سجل مكالمة..."
                        rows={3}
                        className="w-full bg-[#1A2B4D] border border-[#3E527B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7C1] transition-colors"
                        disabled={disabled}
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            {activityTypeOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setNewActivityType(opt.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                        newActivityType === opt.id ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                    title={opt.label}
                                >
                                    {opt.icon}
                                    <span className="hidden sm:inline">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddClick}
                            disabled={!newActivityContent.trim()}
                            className="btn btn-primary !py-2 !px-3"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
           
            {/* Activity Log */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {sortedActivities.map(activity => {
                    const user = usersMap.get(activity.userId);
                    return (
                        <div key={activity.id} className="flex items-start gap-3">
                            <div className="mt-1">
                                {user && user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                                        {(user?.name || '?').charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow bg-[#2C3E5F]/30 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-slate-200">{user?.name || 'مستخدم محذوف'}</span>
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <span className="text-xs text-slate-500">{formatRelativeTime(activity.timestamp)}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">{activity.content}</p>
                            </div>
                        </div>
                    );
                })}
                {activities.length === 0 && (
                    <p className="text-center text-slate-500 py-8">لا يوجد سجل أنشطة لهذا العنصر.</p>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;