import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
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
import { SearchIcon } from './icons/SearchIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { useStore } from '../store/store';

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
        ? 'bg-[#2C3E5F] text-white'
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
        ? 'bg-[#00B7C1]/10 text-[#00B7C1]'
        : 'text-slate-400 hover:bg-[#1A2B4D] hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


const Header: React.FC = () => {
    const {
        activePage,
        setActivePage,
        notifications,
        setNotifications,
        deleteNotification,
        currentUser,
        permissions,
        logout,
        searchQuery,
        setSearchQuery,
    } = useStore(state => ({
        activePage: state.activePage,
        setActivePage: state.setActivePage,
        notifications: state.notifications,
        setNotifications: state.setNotifications,
        deleteNotification: state.deleteNotification,
        currentUser: state.currentUser!,
        permissions: state.permissions!,
        logout: state.logout,
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
    }));

  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const showSearchBar = ['leads', 'projects', 'accounts', 'financials', 'users', 'teams', 'reports', 'calendar'].includes(activePage);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  const handleMobileNavigate = (page: Page) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };
  
  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  }
  
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
      <header className="bg-[#1A2B4D]/80 backdrop-blur-sm sticky top-0 z-20 border-b border-[#2C3E5F]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button onClick={() => setActivePage('dashboard')} className="flex items-center gap-2 text-xl font-bold text-white transition-opacity hover:opacity-80 flex-shrink-0">
                <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr CRM" className="h-8 w-14 object-cover object-right" />
                <span className="hidden sm:inline">صقر CRM</span>
              </button>
              <nav className="hidden lg:flex items-center gap-1">
                {permissions.dashboard.read && <NavLink onClick={() => setActivePage('dashboard')} isActive={activePage === 'dashboard'} label="لوحة التحكم" icon={<ChartBarIcon className="w-5 h-5" />} />}
                {permissions.leads.read && <NavLink onClick={() => setActivePage('leads')} isActive={activePage === 'leads'} label="العملاء" icon={<MegaphoneIcon className="w-5 h-5" />} />}
                {permissions.deals.read && <NavLink onClick={() => setActivePage('deals')} isActive={activePage === 'deals'} label="الفرص" icon={<UsersIcon className="w-5 h-5" />} />}
                {permissions.accounts.read && <NavLink onClick={() => setActivePage('accounts')} isActive={activePage === 'accounts'} label="الحسابات" icon={<BuildingOfficeIcon className="w-5 h-5" />} />}
                {permissions.projects.read && <NavLink onClick={() => setActivePage('projects')} isActive={activePage === 'projects'} label="المشاريع" icon={<BriefcaseIcon className="w-5 h-5" />} />}
                {permissions.calendar.read && <NavLink onClick={() => setActivePage('calendar')} isActive={activePage === 'calendar'} label="التقويم" icon={<CalendarDaysIcon className="w-5 h-5" />} />}
                {permissions.financials.read && <NavLink onClick={() => setActivePage('financials')} isActive={activePage === 'financials'} label="المالية" icon={<DocumentTextIcon className="w-5 h-5" />} />}
                {permissions.reports.read && <NavLink onClick={() => setActivePage('reports')} isActive={activePage === 'reports'} label="التقارير" icon={<ChartBarIcon className="w-5 h-5" />} />}
              </nav>
            </div>

            {showSearchBar && (
                <div className="relative flex-grow max-w-md mx-4 hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ابحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-full py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] transition-colors"
                    />
                </div>
            )}
            
            <div className="flex items-center gap-4 ml-auto lg:ml-0">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationsPanel
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={handleMarkAllRead}
                    onDeleteNotification={deleteNotification}
                  />
                )}
              </div>
              
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-700/50">
                    <div className="w-9 h-9 bg-[#00B7C1] rounded-full flex items-center justify-center font-bold text-white border-2 border-[#2C3E5F] flex-shrink-0">
                        {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            currentUser.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <span className="text-sm font-semibold hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1A2B4D] border border-[#3E527B] rounded-lg shadow-2xl py-1 text-white z-30 modal-content">
                        {permissions.settings.read && (
                          <button 
                              onClick={() => { setActivePage('settings'); setIsUserMenuOpen(false); }}
                              className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-[#2C3E5F]/50 transition-colors"
                          >
                              <UserCircleIcon className="w-5 h-5"/>
                              <span>الملف الشخصي</span>
                          </button>
                        )}
                         {permissions.users.read && (
                          <button 
                              onClick={() => { setActivePage('users'); setIsUserMenuOpen(false); }}
                              className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-[#2C3E5F]/50 transition-colors"
                          >
                              <UsersIcon className="w-5 h-5"/>
                              <span>إدارة المستخدمين</span>
                          </button>
                        )}
                        {permissions.teams.read && (
                            <button
                                onClick={() => { setActivePage('teams'); setIsUserMenuOpen(false); }}
                                className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-[#2C3E5F]/50 transition-colors"
                            >
                                <UserGroupIcon className="w-5 h-5"/>
                                <span>إدارة الفرق</span>
                            </button>
                        )}
                        <div className="border-t border-[#3E527B] my-1"></div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-[#2C3E5F]/50 transition-colors"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                )}
              </div>

              <div className="lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
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
        className={`lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out bg-[#0D1C3C]/95 backdrop-blur-md ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-[#2C3E5F]">
            <span className="font-bold text-lg text-white">القائمة</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          {showSearchBar && (
             <div className="p-4 border-b border-[#2C3E5F]">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="ابحث..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-full py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] transition-colors"
                    />
                </div>
            </div>
          )}
          <nav className="flex flex-col mt-6">
            {permissions.dashboard.read && <MobileNavLink onClick={() => handleMobileNavigate('dashboard')} isActive={activePage === 'dashboard'} label="لوحة التحكم" icon={<ChartBarIcon className="w-6 h-6" />} />}
            {permissions.leads.read && <MobileNavLink onClick={() => handleMobileNavigate('leads')} isActive={activePage === 'leads'} label="العملاء" icon={<MegaphoneIcon className="w-6 h-6" />} />}
            {permissions.deals.read && <MobileNavLink onClick={() => handleMobileNavigate('deals')} isActive={activePage === 'deals'} label="الفرص" icon={<UsersIcon className="w-6 h-6" />} />}
            {permissions.accounts.read && <MobileNavLink onClick={() => handleMobileNavigate('accounts')} isActive={activePage === 'accounts'} label="الحسابات" icon={<BuildingOfficeIcon className="w-6 h-6" />} />}
            {permissions.projects.read && <MobileNavLink onClick={() => handleMobileNavigate('projects')} isActive={activePage === 'projects'} label="المشاريع" icon={<BriefcaseIcon className="w-6 h-6" />} />}
            {permissions.calendar.read && <MobileNavLink onClick={() => handleMobileNavigate('calendar')} isActive={activePage === 'calendar'} label="التقويم" icon={<CalendarDaysIcon className="w-6 h-6" />} />}
            {permissions.financials.read && <MobileNavLink onClick={() => handleMobileNavigate('financials')} isActive={activePage === 'financials'} label="المالية" icon={<DocumentTextIcon className="w-6 h-6" />} />}
            {permissions.reports.read && <MobileNavLink onClick={() => handleMobileNavigate('reports')} isActive={activePage === 'reports'} label="التقارير" icon={<ChartBarIcon className="w-6 h-6" />} />}
            <div className="my-4 border-t border-[#2C3E5F] mx-4"></div>
            {permissions.users.read && <MobileNavLink onClick={() => handleMobileNavigate('users')} isActive={activePage === 'users'} label="إدارة المستخدمين" icon={<UsersIcon className="w-6 h-6" />} />}
            {permissions.teams.read && <MobileNavLink onClick={() => handleMobileNavigate('teams')} isActive={activePage === 'teams'} label="إدارة الفرق" icon={<UserGroupIcon className="w-6 h-6" />} />}
            {permissions.settings.read && <MobileNavLink onClick={() => handleMobileNavigate('settings')} isActive={activePage === 'settings'} label="الإعدادات" icon={<CogIcon className="w-6 h-6" />} />}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;