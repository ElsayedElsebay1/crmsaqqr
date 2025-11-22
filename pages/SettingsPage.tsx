import React, { useState, useEffect } from 'react';
import { NotificationPreferences, User, UserRole } from '../types';
import { useStore } from '../store/store';
import { THEMES } from '../constants';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { PaintBrushIcon } from '../components/icons/PaintBrushIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { LinkIcon } from '../components/icons/LinkIcon';


interface SettingsPageProps {}

const SettingsPage: React.FC<SettingsPageProps> = () => {
  const { 
    preferences, 
    setPreferences, 
    currentUser, 
    updateCurrentUser, 
    roles,
    activeTheme,
    setTheme,
    isGoogleConnected,
    googleUserEmail,
    connectGoogleAccount,
    disconnectGoogleAccount,
  } = useStore(state => ({
    preferences: state.preferences,
    setPreferences: state.setPreferences,
    currentUser: state.currentUser!,
    updateCurrentUser: state.updateCurrentUser,
    roles: state.roles,
    activeTheme: state.theme,
    setTheme: state.setTheme,
    isGoogleConnected: state.isGoogleConnected,
    googleUserEmail: state.googleUserEmail,
    connectGoogleAccount: state.connectGoogleAccount,
    disconnectGoogleAccount: state.disconnectGoogleAccount,
  }));

  const [profile, setProfile] = useState<User>(currentUser);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');


  useEffect(() => {
    setProfile(currentUser);
  }, [currentUser]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({...prev, [name]: value }));
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value, 10);

    setProfile(prev => ({
        ...prev,
        targets: {
            ...prev.targets,
            [name]: isNaN(numValue) ? 0 : numValue,
        }
    }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    updateCurrentUser(profile);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const userRoleName = roles.find(r => r.id === profile.role)?.name || 'Unknown Role';


  const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onToggle: () => void; description: string; }> = ({ label, enabled, onToggle, description }) => (
    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-elevated)] rounded-lg border border-[var(--color-border)]">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">{label}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        className={`${
          enabled ? 'bg-[var(--color-primary)]' : 'bg-slate-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-base)]`}
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[var(--color-bg-elevated)] rounded-xl shadow-lg p-6 border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
          <LinkIcon className="w-6 h-6 text-[var(--color-primary-light)]" />
          <h2 className="text-xl font-bold text-slate-100">التكاملات</h2>
        </div>
        <div className="p-4 bg-[var(--color-bg-base)] rounded-lg border border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <GoogleIcon className="w-10 h-10" />
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Google Calendar</h3>
                <p className="text-sm text-slate-400">لإنشاء اجتماعات Google Meet تلقائيًا.</p>
              </div>
            </div>
            {isGoogleConnected ? (
              <div className="text-center sm:text-right">
                 <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>متصل كـ {googleUserEmail}</span>
                 </div>
                 <button onClick={disconnectGoogleAccount} className="text-xs text-slate-400 hover:text-red-400 hover:underline mt-1">
                    قطع الاتصال
                 </button>
              </div>
            ) : (
                <button onClick={() => connectGoogleAccount(currentUser.email)} className="btn btn-secondary">
                    <GoogleIcon className="w-5 h-5" />
                    <span>الربط مع جوجل</span>
                </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--color-bg-elevated)] rounded-xl shadow-lg p-6 border border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-slate-100 mb-6">تفضيلات الإشعارات</h2>
        <div className="space-y-4">
          <ToggleSwitch
            label="إشعار عند إضافة عميل محتمل جديد"
            description="تلقي إشعار عند إضافة عميل محتمل جديد (Lead) إلى النظام."
            enabled={preferences.onNewLead}
            onToggle={() => handleToggle('onNewLead')}
          />
          <ToggleSwitch
            label="إشعار عند الفوز بصفقة"
            description="تلقي إشعار عند تغيير حالة صفقة (Deal) إلى 'فوز'."
            enabled={preferences.onDealWon}
            onToggle={() => handleToggle('onDealWon')}
          />
          <ToggleSwitch
            label="إشعار عند تغير حالة مشروع"
            description="تلقي إشعار عند تحديث حالة أي مشروع (Project)."
            enabled={preferences.onProjectStatusChange}
            onToggle={() => handleToggle('onProjectStatusChange')}
          />
        </div>
      </div>
      
      <div className="bg-[var(--color-bg-elevated)] rounded-xl shadow-lg p-6 border border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-6">
            <PaintBrushIcon className="w-6 h-6 text-[var(--color-primary-light)]" />
            <h2 className="text-xl font-bold text-slate-100">المظهر</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {THEMES.map(theme => (
                <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                        activeTheme === theme.id ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-slate-600'
                    }`}
                >
                    <div className="w-full h-16 rounded-md" style={{ backgroundColor: theme.colors['--color-primary'] }}></div>
                    <p className="mt-2 text-sm font-semibold text-center">{theme.name}</p>
                    {activeTheme === theme.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[var(--color-bg-elevated)]">
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>


      <div className="bg-[var(--color-bg-elevated)] rounded-xl shadow-lg p-6 border border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-slate-100 mb-6">ملف المستخدم</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">الاسم الكامل</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                    <p className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-md px-3 py-2 text-slate-400 h-10 flex items-center">{profile.email}</p>
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">الدور الوظيفي</label>
                    <p className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-md px-3 py-2 text-slate-400 h-10 flex items-center">{userRoleName}</p>
                </div>
                 <div>
                    <label htmlFor="officeLocation" className="block text-sm font-medium text-slate-300 mb-1">موقع المكتب</label>
                    <input
                        type="text"
                        id="officeLocation"
                        name="officeLocation"
                        value={profile.officeLocation}
                        onChange={handleProfileChange}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-300 mb-1">رابط الصورة الرمزية (Avatar URL)</label>
                <input
                    type="text"
                    id="avatarUrl"
                    name="avatarUrl"
                    value={profile.avatarUrl}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
            </div>

            {/* Monthly Targets Section */}
            {(profile.role === UserRole.Sales || profile.role === UserRole.Telesales) && (
                <div className="border-t border-slate-700 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">الأهداف الشهرية</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="monthlyDeals" className="block text-sm font-medium text-slate-300 mb-1">عدد الصفقات المستهدفة</label>
                            <input
                                type="number"
                                id="monthlyDeals"
                                name="monthlyDeals"
                                value={profile.targets.monthlyDeals}
                                onChange={handleTargetChange}
                                className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                        <div>
                            <label htmlFor="monthlyCalls" className="block text-sm font-medium text-slate-300 mb-1">عدد المكالمات المستهدفة</label>
                            <input
                                type="number"
                                id="monthlyCalls"
                                name="monthlyCalls"
                                value={profile.targets.monthlyCalls}
                                onChange={handleTargetChange}
                                className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-6 flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? 'جارٍ الحفظ...' : saveStatus === 'saved' ? 'تم الحفظ!' : 'حفظ التغييرات'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;