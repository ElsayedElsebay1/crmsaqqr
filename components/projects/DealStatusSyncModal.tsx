import React from 'react';
import { Deal, Project, ProjectStatus, DealStatus } from '../../types';
import { PROJECT_STATUSES, STAGES } from '../../constants';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import BaseModal from '../shared/BaseModal';

interface DealStatusSyncModalProps {
  project: Project;
  deal: Deal;
  onClose: () => void;
  onUpdateDeal: () => void;
  onCreateTask: () => void;
}

const projectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'bg-purple-500/20 text-purple-300',
  [ProjectStatus.IN_PROGRESS]: 'bg-yellow-500/20 text-yellow-300',
  [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-300',
  [ProjectStatus.ON_HOLD]: 'bg-slate-500/20 text-slate-300',
  [ProjectStatus.ARCHIVED]: 'bg-gray-600/20 text-gray-400',
};

const dealStatusColors: Record<DealStatus, string> = {
  [DealStatus.NEW_OPPORTUNITY]: 'bg-teal-500/20 text-teal-300',
  [DealStatus.MEETING_SCHEDULED]: 'bg-purple-500/20 text-purple-300',
  [DealStatus.PROPOSAL_SENT]: 'bg-blue-500/20 text-blue-300',
  [DealStatus.NEGOTIATION]: 'bg-yellow-500/20 text-yellow-300',
  [DealStatus.WON]: 'bg-green-500/20 text-green-300',
  [DealStatus.LOST]: 'bg-red-500/20 text-red-300',
};

const StatusChip: React.FC<{ text: string; className: string }> = ({ text, className }) => (
    <span className={`px-2 py-1 text-xs font-bold rounded-full ${className}`}>
        {text}
    </span>
);

const DealStatusSyncModal: React.FC<DealStatusSyncModalProps> = ({ project, deal, onClose, onUpdateDeal, onCreateTask }) => {
  const projectStatusText = PROJECT_STATUSES.find(s => s.id === project.status)?.title || project.status;
  const dealStatusText = STAGES.find(s => s.id === deal.status)?.title || deal.status;

  const footer = (
    <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
        type="button"
        className="btn btn-secondary w-full sm:w-auto"
        onClick={onClose}
        >
        تجاهل
        </button>
        <button
        type="button"
        className="btn btn-secondary w-full sm:w-auto"
        onClick={onCreateTask}
        >
        إنشاء مهمة متابعة
        </button>
        <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        onClick={onUpdateDeal}
        >
        تحديث حالة الفرصة
        </button>
    </div>
  );

  return (
    <BaseModal isOpen={true} onClose={onClose} footer={footer} maxWidth="max-w-lg">
       <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/10 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="mt-0 text-right w-full">
              <h3 className="text-lg font-semibold leading-6 text-slate-100" id="sync-modal-title">
                تنبيه: عدم تطابق في الحالات
              </h3>
              <div className="mt-3">
                <p className="text-sm text-slate-400">
                    لقد لاحظنا عدم تطابق بين حالة المشروع والفرصة البيعية المرتبطة به.
                </p>
                <div className="mt-4 space-y-3 bg-slate-900/50 p-3 rounded-md border border-slate-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">المشروع: <span className="font-semibold text-white">{project.name}</span></span>
                        <StatusChip text={projectStatusText} className={projectStatusColors[project.status]} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">الفرصة: <span className="font-semibold text-white">{deal.title}</span></span>
                        <StatusChip text={dealStatusText} className={dealStatusColors[deal.status]} />
                    </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                    عند اكتمال المشروع، من الأفضل تحديث حالة الفرصة إلى "فوز" أو "خسارة" لإغلاقها. كيف تود المتابعة؟
                </p>
              </div>
            </div>
          </div>
    </BaseModal>
  );
};

export default DealStatusSyncModal;