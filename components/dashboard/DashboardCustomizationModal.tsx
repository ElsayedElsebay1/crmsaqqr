import React, { useState, useEffect } from 'react';
import { DashboardPreferences, WidgetKey } from '../../types';
import { DEFAULT_DASHBOARD_PREFERENCES, WIDGETS_CONFIG } from '../../constants';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onToggle, description }) => (
  <div className="flex items-center justify-between p-4 bg-[#1A2B4D] rounded-lg w-full border border-[#3E527B]">
    <div>
      <h3 className="text-lg font-semibold text-slate-100">{label}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
    <button
      type="button"
      className={`${
        enabled ? 'bg-[#00B7C1]' : 'bg-slate-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00B7C1] focus:ring-offset-2 focus:ring-offset-[#1A2B4D]`}
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);


interface DashboardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardCustomizationModal: React.FC<DashboardCustomizationModalProps> = ({ isOpen, onClose }) => {
  const { currentPreferences, saveDashboardPreferences } = useStore(state => ({
    currentPreferences: state.dashboardPreferences,
    saveDashboardPreferences: state.saveDashboardPreferences
  }));

  const [localPreferences, setLocalPreferences] = useState(currentPreferences);

  useEffect(() => {
    setLocalPreferences(currentPreferences);
  }, [currentPreferences]);
  
  const handleToggle = (widgetKey: WidgetKey) => {
    setLocalPreferences(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetKey]: !prev.widgets[widgetKey],
      },
    }));
  };

  const handleSave = () => {
    saveDashboardPreferences(localPreferences);
    onClose();
  };
  
  const handleReset = () => {
    setLocalPreferences(DEFAULT_DASHBOARD_PREFERENCES);
  }

  const footer = (
     <div className="w-full flex justify-between items-center">
        <button 
            type="button" 
            onClick={handleReset} 
            className="btn btn-secondary !border-yellow-500/50 !text-yellow-400 hover:!bg-yellow-500/10"
        >
            إعادة تعيين للافتراضي
        </button>
        <div className="flex gap-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
                إلغاء
            </button>
            <button 
                type="button" 
                onClick={handleSave} 
                className="btn btn-primary"
            >
                حفظ التغييرات
            </button>
        </div>
    </div>
  );

  return (
    <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="تخصيص لوحة التحكم"
        footer={footer}
        maxWidth="max-w-2xl"
    >
        <div className="space-y-4">
            <p className="text-slate-400">اختر العناصر التي تود عرضها في شاشتك الرئيسية.</p>
            {WIDGETS_CONFIG.map(({ id, title, description }) => (
                <ToggleSwitch
                key={id}
                label={title}
                description={description}
                enabled={localPreferences.widgets[id]}
                onToggle={() => handleToggle(id)}
                />
            ))}
        </div>
    </BaseModal>
  );
};

export default DashboardCustomizationModal;