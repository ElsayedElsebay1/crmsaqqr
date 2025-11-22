import React, { useMemo } from 'react';
import { LeadStatus } from '../../types';

interface LeadProgressBarProps {
    status: LeadStatus;
}

const LeadProgressBar: React.FC<LeadProgressBarProps> = ({ status }) => {
    const statusInfo = useMemo(() => {
        switch (status) {
            case LeadStatus.NEW:
                return { percentage: 10, colorClass: 'bg-blue-500', text: 'جديد' };
            case LeadStatus.CONTACTED:
                return { percentage: 40, colorClass: 'bg-purple-500', text: 'تم التواصل' };
            case LeadStatus.QUALIFIED:
                return { percentage: 75, colorClass: 'bg-yellow-500', text: 'مؤهل' };
            case LeadStatus.CONVERTED:
                return { percentage: 100, colorClass: 'bg-green-500', text: 'تم تحويله' };
            case LeadStatus.NOT_INTERESTED:
                return { percentage: 100, colorClass: 'bg-red-500', text: 'غير مهتم' };
            default:
                return { percentage: 0, colorClass: 'bg-slate-600', text: 'غير معروف' };
        }
    }, [status]);

    return (
        <div className="flex flex-col gap-1.5" style={{ minWidth: '150px' }}>
            <div className="w-full bg-slate-700 rounded-full h-2" title={`${statusInfo.text} - ${statusInfo.percentage}%`}>
                <div
                    className={`${statusInfo.colorClass} h-2 rounded-full transition-all duration-300 ease-in-out`}
                    style={{ width: `${statusInfo.percentage}%` }}
                ></div>
            </div>
            <div className="text-xs text-slate-300 font-medium text-center">
                {statusInfo.text}
            </div>
        </div>
    );
};

export default LeadProgressBar;