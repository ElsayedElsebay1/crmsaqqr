import React from 'react';
import { Deal, Stage, DealStatus, Invoice } from '../types';
import KanbanCard from './KanbanCard';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { HandshakeIcon } from './icons/HandshakeIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { XCircleIcon } from './icons/XCircleIcon';


interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  allInvoices: Invoice[];
  onDragStart: (id: string, e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (status: Stage['id'], draggedItemId: string) => void;
  onCardClick: (deal: Deal) => void;
  canDragCards: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, allInvoices, onDragStart, onDragEnd, onDrop, onCardClick, canDragCards }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');
    onDrop(stage.id, draggedItemId);
  };

  const stageColors: { [key: string]: string } = {
    WON: 'border-t-[#C8A14F]',
    LOST: 'border-t-red-500',
    NEGOTIATION: 'border-t-yellow-500',
    PROPOSAL_SENT: 'border-t-blue-500',
    MEETING_SCHEDULED: 'border-t-purple-500',
    NEW_OPPORTUNITY: 'border-t-[#00B7C1]',
  };
  
  const stageBgColors: { [key: string]: string } = {
    WON: 'bg-[#C8A14F]/10',
    LOST: 'bg-red-500/10',
    NEGOTIATION: 'bg-yellow-500/10',
    PROPOSAL_SENT: 'bg-blue-500/10',
    MEETING_SCHEDULED: 'bg-purple-500/10',
    NEW_OPPORTUNITY: 'bg-[#00B7C1]/10',
  };

  const stageIcons: Record<DealStatus, React.ReactNode> = {
    [DealStatus.NEW_OPPORTUNITY]: <LightbulbIcon className="w-5 h-5 text-[#00B7C1]" />,
    [DealStatus.MEETING_SCHEDULED]: <CalendarIcon className="w-5 h-5 text-purple-400" />,
    [DealStatus.PROPOSAL_SENT]: <PaperAirplaneIcon className="w-5 h-5 text-blue-400" />,
    [DealStatus.NEGOTIATION]: <HandshakeIcon className="w-5 h-5 text-yellow-400" />,
    [DealStatus.WON]: <BriefcaseIcon className="w-5 h-5 text-[#C8A14F]" />,
    [DealStatus.LOST]: <XCircleIcon className="w-5 h-5 text-red-400" />,
  };

  return (
    <div
      className={`w-72 flex-shrink-0 bg-[#1A2B4D] rounded-xl shadow-lg p-1 ${stageBgColors[stage.id]}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={`p-3 border-t-4 ${stageColors[stage.id]} rounded-t-lg`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                {stageIcons[stage.id]}
                <h2 className="text-lg font-bold text-slate-100">{stage.title}</h2>
            </div>
            <span className="bg-[#2C3E5F] text-slate-300 text-sm font-semibold px-3 py-1 rounded-full">
              {deals.length}
            </span>
          </div>
          <div className="space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {deals.map(deal => (
              <KanbanCard 
                key={deal.id} 
                deal={deal} 
                allInvoices={allInvoices}
                onDragStart={(e) => onDragStart(deal.id, e)} 
                onDragEnd={onDragEnd}
                onClick={onCardClick}
                canDrag={canDragCards}
              />
            ))}
          </div>
      </div>
    </div>
  );
};

export default KanbanColumn;