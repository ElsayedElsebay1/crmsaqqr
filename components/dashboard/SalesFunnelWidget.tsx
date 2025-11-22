import React, { useMemo } from 'react';
import { Deal, DealStatus } from '../../types';
import { STAGES } from '../../constants';
import { FunnelIcon } from '../icons/FunnelIcon';
import { ArrowLongDownIcon } from '../icons/ArrowLongDownIcon';

interface SalesFunnelWidgetProps {
  deals: Deal[];
}

const FUNNEL_STAGES = STAGES.filter(s => s.id !== DealStatus.LOST);
const stageOrder = FUNNEL_STAGES.map(s => s.id);

const stageColors = [
    'bg-teal-500/80',
    'bg-purple-500/80',
    'bg-blue-500/80',
    'bg-yellow-500/80',
    'bg-green-500/80',
];

const SalesFunnelWidget: React.FC<SalesFunnelWidgetProps> = ({ deals }) => {
    const funnelData = useMemo(() => {
        const stageCounts: Record<DealStatus, number> = {} as any;
        
        stageOrder.forEach(stageId => stageCounts[stageId] = 0);

        deals.forEach(deal => {
            if (deal.status === DealStatus.LOST) return;
            
            const dealStageIndex = stageOrder.indexOf(deal.status);
            if (dealStageIndex > -1) {
                for (let i = 0; i <= dealStageIndex; i++) {
                    const stageId = stageOrder[i];
                    stageCounts[stageId]++;
                }
            }
        });

        const totalInitialDeals = stageCounts[stageOrder[0]] || 0;
        
        return FUNNEL_STAGES.map((stage, index) => {
            const count = stageCounts[stage.id];
            const prevCount = index > 0 ? stageCounts[stageOrder[index - 1]] : totalInitialDeals;
            const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 100;
            
            return {
                ...stage,
                count,
                conversionRate,
            };
        });
    }, [deals]);

    const maxCount = Math.max(...funnelData.map(d => d.count), 1);

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <FunnelIcon className="w-6 h-6 text-teal-400" />
                <h2 className="text-lg font-bold text-slate-100">مسار المبيعات</h2>
            </div>

            {deals.length > 0 ? (
                <div className="flex flex-col items-center space-y-1">
                    {funnelData.map((stageData, index) => (
                        <React.Fragment key={stageData.id}>
                            {/* Conversion Rate Arrow (except for the first stage) */}
                            {index > 0 && (
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 my-1">
                                    <ArrowLongDownIcon className="w-5 h-5" />
                                    <span title={`نسبة التحويل من المرحلة السابقة`}>{stageData.conversionRate.toFixed(1)}%</span>
                                </div>
                            )}

                            {/* Funnel Stage */}
                            <div className="w-full flex flex-col items-center">
                                <div 
                                    className={`relative ${stageColors[index % stageColors.length]} text-white font-bold rounded-t-md px-4 py-3 text-center transition-all duration-500 ease-out`}
                                    style={{ 
                                        width: `${Math.max(25, (stageData.count / maxCount) * 90)}%`,
                                        minWidth: '120px',
                                        clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)'
                                    }}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-x-4">
                                        <span className="text-base">{stageData.title}</span>
                                        <span className="text-2xl font-mono">{stageData.count}</span>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500">
                    <p>لا توجد بيانات كافية لعرض مسار المبيعات.</p>
                </div>
            )}
        </div>
    );
};

export default SalesFunnelWidget;