import React from 'react';
import { useStore } from '../../store/store';
import { Account, Deal, Project, DealStatus, ProjectStatus } from '../../types';
import BaseModal from '../shared/BaseModal';
import { XIcon } from '../icons/XIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { UsersIcon } from '../icons/UsersIcon';

const DealCard: React.FC<{ deal: Deal; onClick: () => void }> = ({ deal, onClick }) => {
    const statusClasses: Record<DealStatus, string> = {
        [DealStatus.NEW_OPPORTUNITY]: 'bg-teal-500/20 text-teal-300',
        [DealStatus.MEETING_SCHEDULED]: 'bg-purple-500/20 text-purple-300',
        [DealStatus.PROPOSAL_SENT]: 'bg-blue-500/20 text-blue-300',
        [DealStatus.NEGOTIATION]: 'bg-yellow-500/20 text-yellow-300',
        [DealStatus.WON]: 'bg-green-500/20 text-green-300',
        [DealStatus.LOST]: 'bg-red-500/20 text-red-300',
    };
    const statusText: Record<DealStatus, string> = {
        [DealStatus.NEW_OPPORTUNITY]: 'فرصة جديدة',
        [DealStatus.MEETING_SCHEDULED]: 'اجتماع محدد',
        [DealStatus.PROPOSAL_SENT]: 'عرض مُرسل',
        [DealStatus.NEGOTIATION]: 'تفاوض',
        [DealStatus.WON]: 'فوز',
        [DealStatus.LOST]: 'خسارة',
    };

    return (
        <button onClick={onClick} className="w-full text-right p-3 bg-[#2C3E5F]/50 rounded-lg hover:bg-[#2C3E5F] transition-colors">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-200">{deal.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusClasses[deal.status]}`}>{statusText[deal.status]}</span>
            </div>
            <p className="text-sm font-bold text-[#00B7C1] mt-1">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(deal.value)}</p>
        </button>
    );
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
     const statusClasses: Record<ProjectStatus, string> = {
        [ProjectStatus.PLANNING]: 'bg-purple-500/20 text-purple-300',
        [ProjectStatus.IN_PROGRESS]: 'bg-yellow-500/20 text-yellow-300',
        [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-300',
        [ProjectStatus.ON_HOLD]: 'bg-slate-500/20 text-slate-300',
        [ProjectStatus.ARCHIVED]: 'bg-gray-600/20 text-gray-400',
    };
     const statusText: Record<ProjectStatus, string> = {
        [ProjectStatus.PLANNING]: 'تخطيط',
        [ProjectStatus.IN_PROGRESS]: 'قيد التنفيذ',
        [ProjectStatus.COMPLETED]: 'مكتمل',
        [ProjectStatus.ON_HOLD]: 'معلق',
        [ProjectStatus.ARCHIVED]: 'مؤرشف',
    };

    return (
         <button onClick={onClick} className="w-full text-right p-3 bg-[#2C3E5F]/50 rounded-lg hover:bg-[#2C3E5F] transition-colors">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-200">{project.name}</h4>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusClasses[project.status]}`}>{statusText[project.status]}</span>
            </div>
        </button>
    );
};

const AccountDetailsModal: React.FC = () => {
    const {
        account,
        deals,
        projects,
        permissions,
        closeAccountDetailsModal,
        openAccountModal,
        openDealModal,
        openProjectModal
    } = useStore(state => ({
        account: state.modalState.accountDetails,
        deals: state.deals,
        projects: state.projects,
        permissions: state.permissions!,
        closeAccountDetailsModal: state.closeAccountDetailsModal,
        openAccountModal: state.openAccountModal,
        openDealModal: state.openDealModal,
        openProjectModal: state.openProjectModal,
    }));

    if (!account) return null;

    const relatedDeals = deals.filter(d => d.accountId === account.id);
    const relatedProjects = projects.filter(p => relatedDeals.some(d => d.id === p.dealId));

    const handleEditClick = () => {
        closeAccountDetailsModal();
        openAccountModal(account, false);
    }
    
    const handleDealClick = (deal: Deal) => {
        closeAccountDetailsModal();
        openDealModal(deal);
    }
    
    const handleProjectClick = (project: Project) => {
        closeAccountDetailsModal();
        openProjectModal(project);
    }

    const customHeader = (
        <div className="p-6 border-b border-[#2C3E5F] bg-gradient-to-b from-[#1A2B4D] to-[#1A2B4D]/50 rounded-t-xl">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">{account.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                        {account.website && <a href={`//${account.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#00B7C1]">{account.website}</a>}
                        {account.industry && <span>{account.industry}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {permissions.accounts.update && (
                        <button onClick={handleEditClick} className="btn btn-secondary !py-1 !px-2">
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={closeAccountDetailsModal} className="text-slate-400 hover:text-white transition-colors"><XIcon className="h-6 w-6" /></button>
                </div>
            </div>
        </div>
    );
    
    return (
        <BaseModal isOpen={true} onClose={closeAccountDetailsModal} header={customHeader} maxWidth="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deals Section */}
                <div>
                    <h3 className="text-lg font-semibold text-[#00B7C1] mb-3 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5"/>
                        <span>الفرص البيعية ({relatedDeals.length})</span>
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {relatedDeals.length > 0 ? (
                            relatedDeals.map(deal => <DealCard key={deal.id} deal={deal} onClick={() => handleDealClick(deal)} />)
                        ) : (
                            <p className="text-center text-slate-500 py-4">لا توجد فرص بيعية مرتبطة.</p>
                        )}
                    </div>
                </div>
                {/* Projects Section */}
                <div>
                    <h3 className="text-lg font-semibold text-[#00B7C1] mb-3 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5"/>
                        <span>المشاريع ({relatedProjects.length})</span>
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {relatedProjects.length > 0 ? (
                            relatedProjects.map(project => <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project)} />)
                        ) : (
                             <p className="text-center text-slate-500 py-4">لا توجد مشاريع مرتبطة.</p>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default AccountDetailsModal;