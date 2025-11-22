import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { Notification, User, Permissions } from '../types';
import NotificationsPanel from './notifications/NotificationsPanel';
import { BellIcon } from './icons/BellIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CogIcon } from './icons/CogIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  activePage: Page;
  unreadCount: number;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  user: User;
  permissions: Permissions;
  onDeleteNotification: (notificationId: string) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
}> = ({ onClick, isActive, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
}> = ({ onClick, isActive, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3 text-lg font-semibold transition-colors ${
      isActive
        ? 'bg-teal-500/10 text-teal-300'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, activePage, unreadCount, notifications, setNotifications, user, permissions, onDeleteNotification, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  const handleMobileNavigate = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);


  return (
    <>
      <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-80">
                <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr CRM" className="h-8 w-8" />
                <span>الصقر CRM</span>
              </button>
              <nav className="hidden md:flex items-center gap-2">
                {permissions.dashboard.read && <NavLink onClick={() => onNavigate('dashboard')} isActive={activePage === 'dashboard'} label="لوحة التحكم" icon={<ChartBarIcon className="w-5 h-5" />} />}
                {permissions.leads.read && <NavLink onClick={() => onNavigate('leads')} isActive={activePage === 'leads'} label="العملاء المحتملين" icon={<MegaphoneIcon className="w-5 h-5" />} />}
                {permissions.deals.read && <NavLink onClick={() => onNavigate('deals')} isActive={activePage === 'deals'} label="الفرص البيعية" icon={<UsersIcon className="w-5 h-5" />} />}
                {permissions.projects.read && <NavLink onClick={() => onNavigate('projects')} isActive={activePage === 'projects'} label="المشاريع" icon={<BriefcaseIcon className="w-5 h-5" />} />}
                {permissions.financials.read && <NavLink onClick={() => onNavigate('financials')} isActive={activePage === 'financials'} label="الشؤون المالية" icon={<DocumentTextIcon className="w-5 h-5" />} />}
                {permissions.reports.read && <NavLink onClick={() => onNavigate('reports')} isActive={activePage === 'reports'} label="التقارير" icon={<ChartBarIcon className="w-5 h-5" />} />}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-slate-400 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationsPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={handleMarkAllRead}
                    onDeleteNotification={onDeleteNotification}
                  />
                )}
              </div>
               {permissions.users.read && (
                <button onClick={() => onNavigate('users')} className="text-slate-400 hover:text-white transition-colors hidden sm:block" title="إدارة المستخدمين">
                    <UsersIcon className="w-6 h-6" />
                </button>
              )}
              {permissions.settings.read && (
                <button onClick={() => onNavigate('settings')} className="text-slate-400 hover:text-white transition-colors hidden sm:block" title="الإعدادات">
                    <CogIcon className="w-6 h-6" />
                </button>
              )}
              
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-700/50">
                    <div className="w-9 h-9 bg-teal-500 rounded-full flex items-center justify-center font-bold text-white border-2 border-slate-600">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <span className="text-sm font-semibold hidden sm:inline">{user.name}</span>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 text-white z-30 modal-content">
                        <button 
                            onClick={() => { onNavigate('settings'); setIsUserMenuOpen(false); }}
                            className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                        >
                            <UserCircleIcon className="w-5 h-5"/>
                            <span>الملف الشخصي</span>
                        </button>
                        <div className="border-t border-slate-700 my-1"></div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                )}
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Open menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Panel */}
      <div
        className={`md:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out bg-slate-900 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <span className="font-bold text-lg text-white">القائمة</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col mt-6">
            {permissions.dashboard.read && <MobileNavLink onClick={() => handleMobileNavigate('dashboard')} isActive={activePage === 'dashboard'} label="لوحة التحكم" icon={<ChartBarIcon className="w-6 h-6" />} />}
            {permissions.leads.read && <MobileNavLink onClick={() => handleMobileNavigate('leads')} isActive={activePage === 'leads'} label="العملاء المحتملين" icon={<MegaphoneIcon className="w-6 h-6" />} />}
            {permissions.deals.read && <MobileNavLink onClick={() => handleMobileNavigate('deals')} isActive={activePage === 'deals'} label="الفرص البيعية" icon={<UsersIcon className="w-6 h-6" />} />}
            {permissions.projects.read && <MobileNavLink onClick={() => handleMobileNavigate('projects')} isActive={activePage === 'projects'} label="المشاريع" icon={<BriefcaseIcon className="w-6 h-6" />} />}
            {permissions.financials.read && <MobileNavLink onClick={() => handleMobileNavigate('financials')} isActive={activePage === 'financials'} label="الشؤون المالية" icon={<DocumentTextIcon className="w-6 h-6" />} />}
            {permissions.reports.read && <MobileNavLink onClick={() => handleMobileNavigate('reports')} isActive={activePage === 'reports'} label="التقارير" icon={<ChartBarIcon className="w-6 h-6" />} />}
            <div className="my-4 border-t border-slate-700 mx-4"></div>
            {permissions.users.read && <MobileNavLink onClick={() => handleMobileNavigate('users')} isActive={activePage === 'users'} label="إدارة المستخدمين" icon={<UsersIcon className="w-6 h-6" />} />}
            {permissions.settings.read && <MobileNavLink onClick={() => handleMobileNavigate('settings')} isActive={activePage === 'settings'} label="الإعدادات" icon={<CogIcon className="w-6 h-6" />} />}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
