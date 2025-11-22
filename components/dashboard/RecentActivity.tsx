import React from 'react';
import { ActivityLogEntry } from '../../types';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';

interface RecentActivityProps {
  activityLog: ActivityLogEntry[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activityLog }) => {
  const recentActivities = activityLog.slice(0, 5);

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700 h-full">
        <div className="flex items-center gap-3 mb-6">
            <ClipboardListIcon className="w-6 h-6 text-teal-400" />
            <h2 className="text-lg font-bold text-slate-100">سجل الأنشطة الأخير</h2>
        </div>
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map(entry => (
            <div key={entry.id} className="flex items-start gap-4">
               <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-600 flex-shrink-0">
                    {entry.userAvatar ? (
                        <img src={entry.userAvatar} alt={entry.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        entry.userName.charAt(0).toUpperCase()
                    )}
                </div>
              <div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  <span className="font-semibold">{entry.userName}</span> {entry.action}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    {new Date(entry.timestamp).toLocaleString('ar-SA', { timeStyle: 'short', dateStyle: 'short' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center pt-8">لا توجد أنشطة لعرضها.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
