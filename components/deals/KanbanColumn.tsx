import React, { useRef } from 'react';
import { Deal, Stage, DealStatus, Invoice } from '../../types';
import KanbanCard from './KanbanCard';
import DropIndicator from './DropIndicator';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import { HandshakeIcon } from '../icons/HandshakeIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  allInvoices: Invoice[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onCardClick: (deal: Deal) => void;
  canUpdateDeal: (deal: Deal) => boolean;
  dropIndicator: { column: DealStatus; beforeId: string | null } | null;
  setDropIndicator: (indicator: { column: DealStatus; beforeId: string | null } | null) => void;
}

const getDragAfterElement = (container: HTMLElement, y: number): HTMLElement | null => {
    const draggableElements = Array.from(
        container.querySelectorAll<HTMLElement>('[data-deal-id]:not(.dragging-widget)')
    );

    let closest = { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null };

    for (const child of draggableElements) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            closest = { offset, element: child };
        }
    }
    return closest.element;
};


const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    stage, deals, allInvoices, onDragStart, onDragEnd, onDrop, 
    onCardClick, canUpdateDeal, dropIndicator, setDropIndicator 
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!bodyRef.current) return;
    const afterElement = getDragAfterElement(bodyRef.current, e.clientY);
    const beforeId = afterElement ? afterElement.dataset.dealId || null : null;
    setDropIndicator({ column: stage.id, beforeId });
  };
  
  const handleDragLeave = () => {
    setDropIndicator(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop();
    setDropIndicator(null);
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

  const isDropTarget = dropIndicator?.column === stage.id;

  return (
    <div
      className={`w-72 flex-shrink-0 bg-[#1A2B4D] rounded-xl shadow-lg p-1 ${stageBgColors[stage.id]} transition-colors duration-300 ${isDropTarget ? 'bg-slate-700/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
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
          <div ref={bodyRef} className="space-y-3 h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {deals.map(deal => (
              <React.Fragment key={deal.id}>
                {isDropTarget && dropIndicator.beforeId === deal.id && <DropIndicator />}
                <KanbanCard 
                  deal={deal} 
                  allInvoices={allInvoices}
                  onDragStart={(e) => onDragStart(e, deal)} 
                  onDragEnd={onDragEnd}
                  onClick={onCardClick}
                  canDrag={canUpdateDeal(deal)}
                />
              </React.Fragment>
            ))}
            {isDropTarget && dropIndicator.beforeId === null && <DropIndicator />}
          </div>
      </div>
    </div>
  );
};

export default KanbanColumn;