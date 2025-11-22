import React, { useMemo } from 'react';
import { Lead, LeadStatus, User, UserRole } from '../../types';
import LeadProgressBar from './LeadProgressBar';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useStore } from '../../store/store';
import { UsersIcon } from '../icons/UsersIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { ArrowSmUpIcon } from '../icons/ArrowSmUpIcon';
import { ArrowSmDownIcon } from '../icons/ArrowSmDownIcon';
import { MARKETING_SERVICES } from '../../constants';

export const ALL_LEAD_COLUMNS = {
  companyName: { label: 'اسم الشركة', className: '' },
  contactPerson: { label: 'جهة الاتصال', className: '' },
  status: { label: 'الحالة', className: '' },
  services: { label: 'الخدمات المطلوبة', className: 'hidden lg:table-cell' },
  ownerId: { label: 'المسؤول', className: 'hidden sm:table-cell' },
  lastUpdatedAt: { label: 'آخر تحديث', className: 'hidden md:table-cell' },
  source: { label: 'المصدر', className: 'hidden lg:table-cell' },
  notInterestedReason: { label: 'سبب عدم الاهتمام', className: 'hidden xl:table-cell' },
  actions: { label: 'إجراءات', className: 'text-center' },
};

export type LeadColumnKey = keyof typeof ALL_LEAD_COLUMNS;

type SortableLeadKey = Exclude<LeadColumnKey, 'actions'>;

interface LeadsTableProps {
  leads: Lead[];
  visibleColumns: Record<LeadColumnKey, boolean>;
  columnOrder: LeadColumnKey[];
  sortConfig: { key: SortableLeadKey; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: LeadColumnKey) => void;
  onEdit: (lead: Lead) => void;
  onReassignRequest: (lead: Lead) => void;
}

const isLeadStale = (lead: Lead): boolean => {
    const STALE_THRESHOLD_DAYS = 7;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - STALE_THRESHOLD_DAYS);
    return (lead.status === LeadStatus.NEW || lead.status === LeadStatus.CONTACTED) && new Date(lead.lastUpdatedAt) < thresholdDate;
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, visibleColumns, columnOrder, sortConfig, requestSort, onEdit, onReassignRequest }) => {
  const { convertLead, permissions, currentUser, users } = useStore(state => ({
    convertLead: state.convertLead,
    permissions: state.permissions!,
    currentUser: state.currentUser!,
    users: state.users,
  }));

  const usersMap = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);
  const servicesMap = useMemo(() => new Map(MARKETING_SERVICES.map(s => [s.id, s.name])), []);

  const canUpdate = (lead: Lead): boolean => {
    if (!permissions.leads.update) return false;
    if (currentUser.role === UserRole.Admin) return true;
    if (lead.ownerId === currentUser.id) return true;
    if (currentUser.role === UserRole.Manager) {
        const owner = usersMap.get(lead.ownerId);
        if (owner && owner.groupId === currentUser.groupId) return true;
    }
    return false;
  };

  const getSortIcon = (key: LeadColumnKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="opacity-0 group-hover:opacity-50 transition-opacity">↕</span>;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowSmUpIcon className="w-4 h-4" />;
    }
    return <ArrowSmDownIcon className="w-4 h-4" />;
  };

  const renderCellContent = (lead: Lead, key: LeadColumnKey) => {
    const stale = isLeadStale(lead);
    switch (key) {
        case 'companyName':
            return (
                <div className="flex items-center gap-2">
                    {stale && <span title="هذا العميل لم يتم تحديثه منذ أكثر من 7 أيام"><ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" /></span>}
                    <span>{lead.companyName}</span>
                </div>
            );
        case 'contactPerson':
            return lead.contactPerson;
        case 'status':
            return <LeadProgressBar status={lead.status} />;
        case 'services':
            if (!lead.services || lead.services.length === 0) {
                return <span className="text-slate-500">-</span>;
            }
            const serviceNames = lead.services.map(id => servicesMap.get(id) || id);
            return (
                <span className="truncate" title={serviceNames.join(', ')}>
                    {serviceNames.join(', ')}
                </span>
            );
        case 'ownerId':
            const owner = usersMap.get(lead.ownerId);
            return currentUser.role !== UserRole.Telesales ? (owner?.name || lead.ownerId) : null;
        case 'lastUpdatedAt':
            return <span className={`whitespace-nowrap ${stale ? 'text-orange-400 font-semibold' : ''}`}>{new Date(lead.lastUpdatedAt).toLocaleDateString('ar-SA')}</span>;
        case 'source':
            return lead.source;
        case 'notInterestedReason':
            return lead.notInterestedReason || <span className="text-slate-500">-</span>;
        case 'actions':
            const userCanUpdate = canUpdate(lead);
            return (
                <div className="flex items-center justify-center gap-2">
                   <button onClick={() => onEdit(lead)} className="btn !py-1 !px-2 !text-xs btn-secondary" disabled={lead.status === LeadStatus.CONVERTED && !userCanUpdate}>{userCanUpdate ? 'تعديل' : 'عرض'}</button>
                    {userCanUpdate && currentUser.role !== UserRole.Telesales && (
                        <button onClick={() => onReassignRequest(lead)} className="btn !py-1 !px-2 !text-xs bg-purple-500/10 text-purple-300 hover:bg-purple-500/20" title="إعادة إسناد العميل"><UsersIcon className="w-4 h-4" /></button>
                    )}
                   <button onClick={() => convertLead(lead)} className="btn !py-1 !px-2 !text-xs bg-[#00B7C1]/10 text-[#00B7C1] hover:bg-[#00B7C1]/20" disabled={lead.status !== LeadStatus.QUALIFIED || !permissions.deals.create} title={lead.status !== LeadStatus.QUALIFIED ? 'يجب أن يكون العميل مؤهلاً للتحويل' : 'تحويل العميل إلى فرصة بيعية'}><SparklesIcon className="w-4 h-4" /></button>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right text-slate-300">
        <thead className="text-xs text-slate-400 uppercase bg-[#2C3E5F]/50">
          <tr>
            {columnOrder.map((key) => {
                if (!visibleColumns[key]) return null;
                const { label, className } = ALL_LEAD_COLUMNS[key];
                return (
                    <th scope="col" key={key} className={`px-6 py-3 ${className}`}>
                    {key !== 'actions' ? (
                        <button onClick={() => requestSort(key)} className="group flex items-center gap-1.5">
                        <span>{label}</span>
                        {getSortIcon(key)}
                        </button>
                    ) : (
                        <div className="text-center">{label}</div>
                    )}
                    </th>
                );
            })}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const stale = isLeadStale(lead);
            return (
            <tr key={lead.id} className={`border-b border-[#2C3E5F] hover:bg-[#2C3E5F]/40 ${stale ? 'stale-lead' : ''}`}>
              {columnOrder.map((key) => {
                if (!visibleColumns[key]) return null;
                const { className } = ALL_LEAD_COLUMNS[key];
                const isHeader = key === 'companyName';
                const CellTag = isHeader ? 'th' : 'td';
                const cellClassName = isHeader
                  ? "px-6 py-4 font-medium text-slate-100 whitespace-nowrap"
                  : `px-6 py-4 ${className}`;

                return (
                  <CellTag key={key} scope={isHeader ? 'row' : undefined} className={cellClassName}>
                    {renderCellContent(lead, key)}
                  </CellTag>
                );
              })}
            </tr>
          )})}
          {leads.length === 0 && (
            <tr>
              <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="text-center py-10 text-slate-500">
                لا توجد بيانات لعرضها.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;