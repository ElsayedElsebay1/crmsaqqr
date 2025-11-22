import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import KanbanBoard from './pages/deals/KanbanBoard';
import LeadsPage from './pages/LeadsPage';
import ProjectsPage from './pages/ProjectsPage';
import FinancialsPage from './pages/FinancialsPage';
import UserManagementPage from './pages/UserManagementPage';
import TeamManagementPage from './pages/TeamManagementPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/CalendarPage';
import AccountsPage from './pages/AccountsPage';
import DealModal from './components/deals/DealModal';
import ReasonForLossModal from './components/deals/ReasonForLossModal';
import DealStatusSyncModal from './components/projects/DealStatusSyncModal';
import ProjectModal from './components/projects/ProjectModal';
import LeadModal from './components/leads/LeadModal';
import ReassignLeadModal from './components/leads/ReassignLeadModal';
import InvoiceModal from './components/financials/InvoiceModal';
import UserModal from './components/users/UserModal';
import GroupModal from './components/teams/GroupModal';
import AccountModal from './components/accounts/AccountModal';
import AccountDetailsModal from './components/accounts/AccountDetailsModal';
import ConfirmationModal from './components/ConfirmationModal';
import LoginPage from './pages/LoginPage';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import SchedulingPage from './pages/SchedulingPage'; // New import for the public scheduling page
import SchedulingModal from './components/deals/SchedulingModal';
import QuoteEditorPage from './pages/QuoteEditorPage';
import { useStore } from './store/store';
import {
  NotificationType,
} from './types';
import EmailComposerModal from './components/ai/EmailComposerModal';

const loadingMessages = [
    "جارٍ تحميل البيانات...",
    "تحضير لوحة التحكم الخاصة بك...",
    "التحقق من الصلاحيات والأذونات...",
    "لحظات قليلة ونكون معك...",
];

const FullScreenLoader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0D1C3C] flex flex-col justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
             <div className="relative w-full h-full flex flex-col justify-center items-center">
                {/* Shimmer effect */}
                <div className="absolute inset-0 loader-shimmer opacity-50"></div>
                
                <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr CRM" className="h-24 w-40 animate-pulse mb-6 object-cover object-right" />
                <p className="text-xl font-bold text-slate-300 transition-opacity duration-500 ease-in-out h-8 text-center">
                    {loadingMessages[messageIndex]}
                </p>
                <div className="w-48 h-1 bg-slate-700 rounded-full mt-4 overflow-hidden">
                    <div className="h-1 bg-[#00B7C1] rounded-full animate-loader-bar"></div>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const store = useStore();
  const {
    currentUser,
    permissions,
    activePage,
    addNotification,
    init,
    modalState,
    activeQuote,
    closeDealModal,
    closeReasonForLossModal,
    closeProjectModal,
    closeSyncModal,
    closeLeadModal,
    closeReassignLeadModal,
    closeInvoiceModal,
    closeUserModal,
    closeGroupModal,
    closeAccountModal,
    closeAccountDetailsModal,
    closeConfirmationModal,
    closeForgotPasswordModal,
    closeSchedulingModal,
    closeEmailComposerModal,
    isAppLoading,
    error,
    clearError,
  } = store;

  const [schedulingDealId, setSchedulingDealId] = useState<string | null>(null);
  
  // Initialize auth state and load data from "backend"
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dealId = params.get('dealId');
    const isScheduleView = params.get('schedule');

    if (isScheduleView === 'true' && dealId) {
        setSchedulingDealId(dealId);
        // Clean up URL to avoid confusion on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        init();
    }
  }, [init]);

  // Effect to show global errors as notifications
  useEffect(() => {
    if (error) {
        addNotification(error, NotificationType.GENERAL_ERROR); // Using a red icon for general errors
        clearError();
    }
  }, [error, addNotification, clearError]);

  // Render the public scheduling page if a dealId is found in URL params
  if (schedulingDealId) {
    return <SchedulingPage dealId={schedulingDealId} />;
  }

  if (isAppLoading) {
    return <FullScreenLoader />;
  }
  
  if (!currentUser || !permissions) {
    return (
      <>
        <LoginPage />
        {modalState.forgotPassword && (
          <ForgotPasswordModal onClose={closeForgotPasswordModal} />
        )}
      </>
    );
  }

  // If a quote is being edited, render the editor full-screen
  if (activeQuote) {
    return <QuoteEditorPage />;
  }


  const renderContent = () => {
    const pageContent = (() => {
      switch (activePage) {
        case 'dashboard':
          return permissions.dashboard.read ? <DashboardPage /> : null;
        case 'leads':
          return permissions.leads.read ? <LeadsPage /> : null;
        case 'deals':
          return permissions.deals.read ? <KanbanBoard /> : null;
        case 'projects':
          return permissions.projects.read ? <ProjectsPage /> : null;
        case 'accounts':
            return permissions.accounts.read ? <AccountsPage /> : null;
        case 'financials':
          return permissions.financials.read ? <FinancialsPage /> : null;
        case 'users':
          return permissions.users.read ? <UserManagementPage /> : null;
        case 'teams':
            return permissions.teams.read ? <TeamManagementPage /> : null;
        case 'settings':
          return permissions.settings.read ? <SettingsPage /> : null;
        case 'reports':
          return permissions.reports.read ? <ReportsPage /> : null;
        case 'calendar':
            return permissions.calendar.read ? <CalendarPage /> : null;
        default:
          return <div>Page not found</div>;
      }
    })();
    return (
      <div key={activePage} className="page-container">
        {pageContent}
      </div>
    );
  };
  

  return (
    <div className="bg-[#0D1C3C] text-slate-300 min-h-screen font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      {/* Global Modals */}
      {(modalState.deal.deal || modalState.deal.isCreating) && (
        <DealModal
          deal={modalState.deal.deal}
          isCreating={modalState.deal.isCreating}
          onClose={closeDealModal}
        />
      )}

      {modalState.reasonForLoss && (
        <ReasonForLossModal
          deal={modalState.reasonForLoss}
          onClose={closeReasonForLossModal}
        />
      )}
      
      {(modalState.project.project || modalState.project.isCreating) && (
        <ProjectModal
          project={modalState.project.project}
          isCreating={modalState.project.isCreating}
          initialTab={modalState.project.initialTab}
          onClose={closeProjectModal}
        />
      )}

      {modalState.sync && (
        <DealStatusSyncModal
            project={modalState.sync.project}
            deal={modalState.sync.deal}
            onClose={closeSyncModal}
            onUpdateDeal={() => {
                const dealToUpdate = modalState.sync!.deal;
                closeSyncModal();
                store.openDealModal(dealToUpdate);
            }}
            onCreateTask={() => {
                const projectToOpen = modalState.sync!.project;
                closeSyncModal();
                store.openProjectModal(projectToOpen, false, 'tasks');
            }}
        />
      )}
      
      {(modalState.lead.lead || modalState.lead.isCreating) && (
        <LeadModal 
            lead={modalState.lead.lead}
            isCreating={modalState.lead.isCreating}
            onClose={closeLeadModal}
        />
      )}

      {modalState.reassignLead && (
        <ReassignLeadModal
          lead={modalState.reassignLead}
          onClose={closeReassignLeadModal}
        />
      )}

      {(modalState.invoice.invoice || modalState.invoice.isCreating) && (
        <InvoiceModal
          invoice={modalState.invoice.invoice}
          isCreating={modalState.invoice.isCreating}
          onClose={closeInvoiceModal}
        />
      )}

      {(modalState.user.user || modalState.user.isCreating) && (
        <UserModal 
            user={modalState.user.user}
            isCreating={modalState.user.isCreating}
            onClose={closeUserModal}
        />
      )}
      
      {(modalState.group.group || modalState.group.isCreating) && (
        <GroupModal
            group={modalState.group.group}
            isCreating={modalState.group.isCreating}
            onClose={closeGroupModal}
        />
      )}

      {(modalState.account.account || modalState.account.isCreating) && (
        <AccountModal
            account={modalState.account.account}
            isCreating={modalState.account.isCreating}
            onClose={closeAccountModal}
        />
      )}
      
      {modalState.accountDetails && (
        <AccountDetailsModal />
      )}

      {modalState.confirmation && (
        <ConfirmationModal
            isOpen={!!modalState.confirmation}
            onClose={closeConfirmationModal}
            onConfirm={modalState.confirmation.onConfirm}
            title={modalState.confirmation.title}
            message={modalState.confirmation.message}
            confirmButtonText={modalState.confirmation.confirmButtonText}
            cancelButtonText={modalState.confirmation.cancelButtonText}
        />
      )}
      
      {modalState.schedulingModal.deal && (
        <SchedulingModal
            deal={modalState.schedulingModal.deal}
            onClose={closeSchedulingModal}
        />
      )}

      {modalState.emailComposer.target && (
        <EmailComposerModal
            target={modalState.emailComposer.target}
            onClose={closeEmailComposerModal}
        />
      )}

      <ChatbotWidget />
    </div>
  );
};

export default App;