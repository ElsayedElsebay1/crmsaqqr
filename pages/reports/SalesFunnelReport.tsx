import React, { useMemo } from 'react';
import { Deal, DealStatus } from '../../types';
import { STAGES } from '../../constants';
import { FunnelIcon } from '../../components/icons/FunnelIcon';
import { TrophyIcon } from '../../components/icons/TrophyIcon';
import { ArrowLongDownIcon } from '../../components/icons/ArrowLongDownIcon';

interface SalesFunnelReportProps {
  deals: Deal[];
}

const FUNNEL_STAGES = STAGES.filter(s => s.id !== DealStatus.LOST);
const stageOrder = FUNNEL_STAGES.map(s => s.id);

const stageColors = [
    'bg-teal-500',
    'bg-purple-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-green-500',
];

const SalesFunnelReport: React.FC<SalesFunnelReportProps> = ({ deals }) => {

    const funnelData = useMemo(() => {
        const stageCounts: Record<DealStatus, number> = {} as any;
        
        // Initialize counts
        stageOrder.forEach(stageId => stageCounts[stageId] = 0);

        // Calculate cumulative counts
        deals.forEach(deal => {
            if (deal.status === DealStatus.LOST) return; // Ignore lost deals for the success funnel
            
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
            const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 0;
            
            return {
                ...stage,
                count,
                conversionRate,
            };
        });
    }, [deals]);

    const totalWon = funnelData.find(d => d.id === DealStatus.WON)?.count || 0;
    const totalInitial = funnelData.length > 0 ? funnelData[0].count : 0;
    const overallConversionRate = totalInitial > 0 ? (totalWon / totalInitial) * 100 : 0;

    const maxCount = Math.max(...funnelData.map(d => d.count), 1);

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <FunnelIcon className="w-6 h-6 text-slate-300" />
                تحليل مسار المبيعات (الحالة الحالية)
            </h2>
            
            <div className="flex flex-col items-center space-y-2">
                {funnelData.map((stageData, index) => (
                    <React.Fragment key={stageData.id}>
                        {/* Funnel Stage */}
                        <div className="w-full flex flex-col items-center">
                            <div 
                                className={`relative ${stageColors[index % stageColors.length]} text-white font-bold rounded-t-md px-4 py-3 text-center transition-all duration-500 ease-out`}
                                style={{ 
                                    width: `${Math.max(20, (stageData.count / maxCount) * 100)}%`,
                                    clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)'
                                }}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-x-4">
                                    <span className="text-lg">{stageData.title}</span>
                                    <span className="text-2xl font-mono">{stageData.count}</span>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Rate Arrow */}
                        {index < funnelData.length - 1 && (
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 my-2">
                                <ArrowLongDownIcon className="w-5 h-5" />
                                <span>{stageData.conversionRate.toFixed(1)}%</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-center">
                <div className="bg-slate-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-slate-400 flex items-center gap-2 justify-center">
                        <TrophyIcon className="w-5 h-5 text-yellow-400"/>
                        إجمالي معدل التحويل (من فرصة إلى فوز)
                    </p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                        {overallConversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">({totalWon} من {totalInitial} فرصة)</p>
                </div>
            </div>
        </div>
    );
};

export default SalesFunnelReport;