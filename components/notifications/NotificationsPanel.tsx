

import React from 'react';
import { Notification, NotificationType } from '../../types';
import { BellIcon } from '../icons/BellIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { CurrencyIcon } from '../icons/CurrencyIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { XIcon } from '../icons/XIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { UsersIcon } from '../icons/UsersIcon';


interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const baseClass = "w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0";
    switch (type) {
        case NotificationType.NEW_LEAD_ASSIGNED:
            return <div className={`${baseClass} bg-blue-500`}><UsersIcon className="w-4 h-4" /></div>;
        case NotificationType.DEAL_WON:
            return <div className={`${baseClass} bg-green-500`}><CurrencyIcon className="w-4 h-4" /></div>;
        case NotificationType.PROJECT_STATUS_CHANGED:
            return <div className={`${baseClass} bg-purple-500`}><BriefcaseIcon className="w-4 h-4" /></div>;
        case NotificationType.INVOICE_OVERDUE:
            return <div className={`${baseClass} bg-red-500`}><DocumentTextIcon className="w-4 h-4" /></div>;
        case NotificationType.MEETING_REMINDER:
            return <div className={`${baseClass} bg-orange-500`}><CalendarIcon className="w-4 h-4" /></div>;
        case NotificationType.MEETING_SCHEDULED:
            return <div className={`${baseClass} bg-teal-500`}><CalendarIcon className="w-4 h-4" /></div>;
        case NotificationType.TASK_ASSIGNED:
            return <div className={`${baseClass} bg-cyan-500`}><ClipboardListIcon className="w-4 h-4" /></div>;
        case NotificationType.TASK_DEADLINE_APPROACHING:
            return <div className={`${baseClass} bg-yellow-500`}><ClipboardListIcon className="w-4 h-4" /></div>;
        case NotificationType.LEAD_STALE:
            return <div className={`${baseClass} bg-rose-500`}><ExclamationTriangleIcon className="w-4 h-4" /></div>;
        case NotificationType.DAILY_DIGEST_INACTIVE_LEADS:
            return <div className={`${baseClass} bg-indigo-500`}><EnvelopeIcon className="w-4 h-4" /></div>;
        case NotificationType.GENERAL_ERROR:
            return <div className={`${baseClass} bg-red-600`}><ExclamationTriangleIcon className="w-4 h-4" /></div>;
        default:
            return <div className={`${baseClass} bg-slate-500`}><BellIcon className="w-4 h-4" /></div>;
    }
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onMarkAllRead, onDeleteNotification }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl text-white z-30">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-slate-100">الإشعارات</h3>
            <button onClick={onMarkAllRead} className="text-xs text-teal-400 hover:underline">
                تحديد الكل كمقروء
            </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">لا توجد إشعارات جديدة.</p>
            ) : (
                <ul>
                    {notifications.map(n => (
                        <li key={n.id} className={`group p-3 border-b border-slate-700/50 flex items-start gap-3 transition-colors ${!n.isRead ? 'bg-slate-700/50 hover:bg-slate-700' : 'hover:bg-slate-700/50'}`}>
                           <NotificationIcon type={n.type} />
                           <div className="flex-grow">
                                <p className="text-sm text-slate-200">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(n.timestamp).toLocaleString('ar-SA', { timeStyle: 'short', dateStyle: 'short' })}
                                </p>
                           </div>
                           <button 
                             onClick={() => onDeleteNotification(n.id)} 
                             className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-600 flex-shrink-0"
                             title="إخفاء الإشعار"
                           >
                             <XIcon className="w-4 h-4 text-slate-400" />
                           </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
         <div className="p-2 bg-slate-900/50 rounded-b-xl text-center">
            <button onClick={onClose} className="text-sm text-slate-300 hover:text-white w-full">إغلاق</button>
        </div>
    </div>
  );
};

export default NotificationsPanel;