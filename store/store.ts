
import { create } from 'zustand';
import React from 'react';
import * as api from '../services/api';
import {
  Deal, Lead, Project, Task, Invoice, Notification, User, Role, NotificationPreferences,
  LeadStatus, DealStatus, PaymentStatus, ProjectStatus, Account, Quote, QuoteStatus,
  DashboardPreferences, WidgetKey, ActivityLogEntry, Page, UserRole, Permissions,
  NotificationType, ProjectModalTab, Group, ProjectType, TaskStatus, InvoiceStatus
} from '../types';
import { STAGES, PROJECT_STATUSES, DEFAULT_DASHBOARD_PREFERENCES, WIDGETS_CONFIG, ALL_ROLES, THEMES, BLANK_INVOICE, BLANK_DEAL, BLANK_PROJECT } from '../constants';


interface ModalState {
  deal: { deal: Deal | null; isCreating: boolean };
  project: { project: Project | null; isCreating: boolean; initialTab: ProjectModalTab };
  sync: { project: Project; deal: Deal } | null;
  lead: { lead: Lead | null; isCreating: boolean };
  reassignLead: Lead | null;
  invoice: { invoice: Invoice | null; isCreating: boolean };
  user: { user: User | null; isCreating: boolean };
  group: { group: Group | null; isCreating: boolean };
  account: { account: Account | null; isCreating: boolean };
  accountDetails: Account | null;
  confirmation: {
    title: string;
    message: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    confirmButtonText?: string;
    cancelButtonText?: string;
  } | null;
  reasonForLoss: Deal | null;
  forgotPassword: boolean;
  schedulingModal: { deal: Deal | null };
  emailComposer: { target: Lead | Deal | null };
}

interface AppState {
    // Data
    leads: Lead[];
    deals: Deal[];
    accounts: Account[];
    projects: Project[];
    tasks: Task[];
    invoices: Invoice[];
    quotes: Quote[];
    users: User[];
    roles: Role[];
    groups: Group[];
    activityLog: ActivityLogEntry[];
    
    // UI & User State
    activePage: Page;
    currentUser: User | null;
    permissions: Permissions | null;
    notifications: Notification[];
    preferences: NotificationPreferences;
    dashboardPreferences: DashboardPreferences;
    theme: string;
    searchQuery: string;
    modalState: ModalState;
    activeQuote: { deal: Deal, quote?: Quote } | null;
    isAppLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    initialFilter: { page: Page; filter: any } | null;

    // Integrations
    isGoogleConnected: boolean;
    googleUserEmail: string | null;
    
    // Actions
    init: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    logAction: (action: string) => Promise<void>;
    setActivePage: (page: Page) => void;
    navigateToWithFilter: (page: Page, filter: any) => void;
    clearInitialFilter: () => void;
    setSearchQuery: (query: string) => void;
    clearError: () => void;
    
    addNotification: (message: string, type: NotificationType) => void;
    setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void;
    deleteNotification: (notificationId: string) => void;
    
    saveDashboardPreferences: (newPrefs: DashboardPreferences) => void;
    setPreferences: (prefs: NotificationPreferences | ((prev: NotificationPreferences) => NotificationPreferences)) => void;
    setTheme: (themeId: string) => void;

    connectGoogleAccount: (email: string) => void;
    disconnectGoogleAccount: () => void;
    
    saveLead: (lead: Lead, isNew: boolean) => Promise<void>;
    reassignLead: (leadId: string, newOwnerId: string) => Promise<void>;
    convertLead: (leadToConvert: Lead) => Promise<void>;
    
    saveDeal: (deal: Deal, isCreating: boolean) => Promise<void>;
    moveDeal: (draggedDealId: string, targetStatus: DealStatus, beforeDealId: string | null) => Promise<void>;
    updateDealStatusFromProject: (deal: Deal) => void;
    
    saveProject: (project: Project, isCreating: boolean) => Promise<void>;
    createProject: (projectData: Omit<Project, 'id'>) => Promise<void>;
    createProjectFromDeal: (deal: Deal) => Promise<void>;
    updateProjectStatus: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
    
    addTask: (task: Omit<Task, 'id'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    
    saveInvoice: (invoice: Invoice) => Promise<void>;
    createInvoiceFromQuote: (quote: Quote) => void;
    saveQuote: (quote: Quote) => Promise<Quote>;

    saveAccount: (account: Account, isCreating: boolean) => Promise<void>;
    deleteAccount: (accountId: string) => Promise<void>;
    
    saveUser: (user: User) => Promise<void>;
    updateCurrentUser: (user: User) => void;
    deleteUser: (userId: string) => Promise<void>;
    saveGroup: (group: Group, memberIds: string[]) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;

    requestPasswordReset: (email: string) => Promise<boolean>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;

    scheduleMeeting: (dealId: string, meetingTime: Date) => Promise<void>;

    // Modal Actions
    openDealModal: (deal: Deal | null, isCreating?: boolean) => void;
    closeDealModal: () => void;
    openReasonForLossModal: (deal: Deal) => void;
    closeReasonForLossModal: () => void;
    openProjectModal: (project: Project | null, isCreating?: boolean, initialTab?: ProjectModalTab) => void;
    closeProjectModal: () => void;
    openSyncModal: (project: Project, deal: Deal) => void;
    closeSyncModal: () => void;
    openLeadModal: (lead: Lead | null, isCreating?: boolean) => void;
    closeLeadModal: () => void;
    openReassignLeadModal: (lead: Lead) => void;
    closeReassignLeadModal: () => void;
    openInvoiceModal: (invoice: Invoice | null, isCreating?: boolean) => void;
    closeInvoiceModal: () => void;
    openUserModal: (user: User | null, isCreating?: boolean) => void;
    closeUserModal: () => void;
    openGroupModal: (group: Group | null, isCreating?: boolean) => void;
    closeGroupModal: () => void;
    openAccountModal: (account: Account | null, isCreating?: boolean) => void;
    closeAccountModal: () => void;
    openAccountDetailsModal: (account: Account) => void;
    closeAccountDetailsModal: () => void;
    openConfirmationModal: (title: string, message: React.ReactNode, onConfirm: () => Promise<void> | void, confirmButtonText?: string, cancelButtonText?: string) => void;
    closeConfirmationModal: () => void;
    openForgotPasswordModal: () => void;
    closeForgotPasswordModal: () => void;
    openSchedulingModal: (deal: Deal) => void;
    closeSchedulingModal: () => void;
    openEmailComposerModal: (target: Lead | Deal) => void;
    closeEmailComposerModal: () => void;
    openQuoteEditor: (deal: Deal, quote?: Quote) => void;
    closeQuoteEditor: () => void;
}

const initialModalState: ModalState = {
    deal: { deal: null, isCreating: false },
    project: { project: null, isCreating: false, initialTab: 'details' },
    sync: null,
    lead: { lead: null, isCreating: false },
    reassignLead: null,
    invoice: { invoice: null, isCreating: false },
    user: { user: null, isCreating: false },
    group: { group: null, isCreating: false },
    account: { account: null, isCreating: false },
    accountDetails: null,
    confirmation: null,
    reasonForLoss: null,
    forgotPassword: false,
    schedulingModal: { deal: null },
    emailComposer: { target: null },
};

const loggedOutState = {
  currentUser: null,
  permissions: null,
  leads: [],
  deals: [],
  accounts: [],
  projects: [],
  tasks: [],
  invoices: [],
  quotes: [],
  activityLog: [],
  groups: [],
  activePage: 'dashboard' as Page,
};

export const useStore = create<AppState>((set, get) => {
    const logAction = async (action: string) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        try {
            const newEntry = await api.createActivityLogEntry({
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatarUrl,
                action,
                timestamp: new Date().toISOString(),
            });
            set(state => ({ activityLog: [newEntry, ...state.activityLog] }));
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    };
    
    const runSystemChecks = () => {
        const { leads, addNotification } = get();
        const now = new Date();
        const staleThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        leads.forEach(lead => {
            if ((lead.status === LeadStatus.NEW || lead.status === LeadStatus.CONTACTED) && new Date(lead.lastUpdatedAt) < staleThreshold) {
                addNotification(`العميل "${lead.companyName}" لم يتم تحديثه منذ أكثر من 7 أيام.`, NotificationType.LEAD_STALE);
            }
        });
    };

    return {
    // Initial State
    ...loggedOutState,
    users: [],
    roles: ALL_ROLES,
    notifications: [],
    preferences: { onNewLead: true, onDealWon: true, onProjectStatusChange: true },
    dashboardPreferences: DEFAULT_DASHBOARD_PREFERENCES,
    theme: THEMES[0].id,
    searchQuery: '',
    modalState: initialModalState,
    activeQuote: null,
    isAppLoading: true,
    isSubmitting: false,
    error: null,
    initialFilter: null,
    isGoogleConnected: false,
    googleUserEmail: null,
    
    // --- ACTIONS ---

    logAction,

    // --- Core & Auth ---
    init: async () => {
        set({ isAppLoading: true });
        try {
            const savedTheme = localStorage.getItem('saqqr_theme');
            if (savedTheme) get().setTheme(savedTheme);
            const storedPrefs = localStorage.getItem('dashboardPreferences');
            if (storedPrefs) set({ dashboardPreferences: JSON.parse(storedPrefs) });
            const googleConnected = localStorage.getItem('saqqr_google_connected') === 'true';
            const googleEmail = localStorage.getItem('saqqr_google_email');
            if (googleConnected && googleEmail) set({ isGoogleConnected: true, googleUserEmail: googleEmail });

            const user = await api.fetchCurrentUser();
            if (user && user.isActive) {
                const permissions = get().roles.find(r => r.id === user.role)?.permissions || null;
                set({ currentUser: user, permissions });

                const [users, leads, opportunities, accounts, projects, tasks, invoices, quotes, activityLog, groups] = await Promise.all([
                    api.fetchUsers(),
                    api.fetchLeads(),
                    api.fetchOpportunities(),
                    api.fetchAccounts(),
                    api.fetchProjects(),
                    api.fetchTasks(),
                    api.fetchInvoices(),
                    api.fetchQuotes(),
                    api.fetchActivityLog(),
                    api.fetchGroups(),
                ]);
                
                const deals = opportunities.map(api.apiToDeal);
                set({ users, leads, deals, accounts, projects, tasks, invoices, quotes, activityLog, groups });
                
                runSystemChecks();
            } else {
                set(loggedOutState);
            }
        } catch (error) {
            console.log("No active session found or init failed:", error);
            set(loggedOutState);
        } finally {
            set({ isAppLoading: false, isSubmitting: false });
        }
    },
    
    login: async (email, password) => {
        set({ isSubmitting: true, error: null });
        
        // Check for demo credentials
        const isDemoLogin = 
            (email === 'admin@saqqr.com' && password === '123') || 
            (email === 'sales@saqqr.com' && password === '123');

        if (isDemoLogin) {
            localStorage.setItem('saqqr_demo_mode', 'true');
            localStorage.setItem('saqqr_demo_email', email);
            
            // Simulate network delay for realism
            await new Promise(resolve => setTimeout(resolve, 800));
            
            await get().init();
            return;
        }

        try {
            await api.getCsrfCookie();
            await api.loginApi({ email, password });
            await get().init();
        } catch (e: any) {
            const errorMessage = e.message && e.message.includes('422') ? 'البيانات المدخلة غير صحيحة.' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            set({ error: errorMessage, isSubmitting: false });
        }
    },

    logout: async () => {
        const currentUser = get().currentUser;
        if(currentUser) await logAction('سجّل الخروج من النظام.');
        
        try {
            await api.logoutApi();
        } catch (e) {
            console.error("Logout API call failed, but clearing session anyway.", e);
        } finally {
            set({ ...loggedOutState, users: get().users });
        }
    },

    setActivePage: (page) => set({ activePage: page, searchQuery: '' }),
    navigateToWithFilter: (page, filter) => set({ activePage: page, initialFilter: { page, filter }, searchQuery: '' }),
    clearInitialFilter: () => set({ initialFilter: null }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    clearError: () => set({ error: null }),

    addNotification: (message, type) => {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`, message, type, timestamp: new Date().toISOString(), isRead: false,
        };
        set(state => ({ notifications: [newNotification, ...state.notifications] }));
    },
    setNotifications: (updater) => set(state => ({ notifications: typeof updater === 'function' ? updater(state.notifications) : updater })),
    deleteNotification: (notificationId) => set(state => ({ notifications: state.notifications.filter(n => n.id !== notificationId) })),
    saveDashboardPreferences: (newPrefs) => {
        set({ dashboardPreferences: newPrefs });
        localStorage.setItem('dashboardPreferences', JSON.stringify(newPrefs));
    },
    setPreferences: (updater) => set(state => ({ preferences: typeof updater === 'function' ? updater(state.preferences) : updater })),
    setTheme: (themeId: string) => {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('saqqr_theme', themeId);
        set({ theme: themeId });
    },
    
    connectGoogleAccount: (email) => {
        localStorage.setItem('saqqr_google_connected', 'true');
        localStorage.setItem('saqqr_google_email', email);
        set({ isGoogleConnected: true, googleUserEmail: email });
    },
    disconnectGoogleAccount: () => {
        localStorage.removeItem('saqqr_google_connected');
        localStorage.removeItem('saqqr_google_email');
        set({ isGoogleConnected: false, googleUserEmail: null });
    },
    
    saveLead: async (lead, isNew) => {
        set({ isSubmitting: true, error: null });
        try {
            const updatedLead = { ...lead, lastUpdatedAt: new Date().toISOString() };
            const savedLead = isNew ? await api.createLead(updatedLead) : await api.updateLead(lead.id, updatedLead);
            set(state => ({
                leads: isNew ? [savedLead, ...state.leads] : state.leads.map(l => l.id === savedLead.id ? savedLead : l)
            }));
            const action = isNew ? `أنشأ عميلاً محتملاً جديداً: ${savedLead.companyName}` : `حدّث بيانات العميل المحتمل: ${savedLead.companyName}`;
            await logAction(action);
            if (isNew) get().addNotification(`تم إسناد العميل الجديد "${savedLead.companyName}" إليك.`, NotificationType.NEW_LEAD_ASSIGNED);
        } catch (e: any) {
            set({ error: `فشل حفظ العميل: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    reassignLead: async (leadId, newOwnerId) => {
        set({ isSubmitting: true, error: null });
        try {
            const { users } = get();
            const updatedLead = await api.updateLead(leadId, { ownerId: newOwnerId, lastUpdatedAt: new Date().toISOString() });
             set(state => ({
                leads: state.leads.map(l => l.id === leadId ? updatedLead : l)
            }));
            await logAction(`نقل مسؤولية العميل المحتمل "${updatedLead.companyName}" إلى ${users.find(u => u.id === newOwnerId)?.name}.`);
        } catch (e: any) {
             set({ error: `فشل إعادة إسناد العميل: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    convertLead: async (leadToConvert) => {
        set({ isSubmitting: true, error: null });
        try {
            const { account, opportunity } = await api.convertLeadApi(leadToConvert.id);
            const newDeal = api.apiToDeal(opportunity);

            set(state => ({
                leads: state.leads.map(l => l.id === leadToConvert.id ? { ...l, status: LeadStatus.CONVERTED } : l),
                deals: [newDeal, ...state.deals],
                accounts: state.accounts.some(a => a.id === account.id) ? state.accounts : [account, ...state.accounts],
            }));
            await logAction(`حوّل العميل المحتمل "${leadToConvert.companyName}" إلى فرصة بيعية.`);
            get().addNotification(`تم تحويل "${leadToConvert.companyName}" إلى فرصة بنجاح.`, NotificationType.DEAL_WON);
        } catch (e: any) {
            set({ error: `فشل تحويل العميل: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    saveDeal: async (deal, isCreating) => {
        set({ isSubmitting: true, error: null });
        const originalDeal = get().deals.find(d => d.id === deal.id);
        const isTransitioningToWon = !isCreating && deal.status === DealStatus.WON && originalDeal?.status !== DealStatus.WON;

        try {
            if (isTransitioningToWon) {
                // Use the new dedicated 'win' endpoint from the backend
                const { opportunity, project } = await api.winOpportunity(deal.id, api.dealToApi(deal));
                const wonDeal = api.apiToDeal(opportunity);

                set(state => ({
                    deals: state.deals.map(d => d.id === wonDeal.id ? wonDeal : d),
                    projects: [project, ...state.projects], // Add the new project from backend
                }));

                await logAction(`فاز بالفرصة: ${wonDeal.title}`);
                get().addNotification(`تم الفوز بالفرصة "${wonDeal.title}" وإنشاء مشروع مرتبط.`, NotificationType.DEAL_WON);
            } else {
                // Use the standard create/update logic for all other cases
                const apiPayload = api.dealToApi(deal);
                const savedOpportunity = isCreating
                    ? await api.createOpportunity(apiPayload)
                    : await api.updateOpportunity(deal.id, apiPayload);
                const savedDeal = api.apiToDeal(savedOpportunity);

                set(state => ({
                    deals: isCreating
                        ? [savedDeal, ...state.deals]
                        : state.deals.map(d => d.id === savedDeal.id ? savedDeal : d),
                }));

                const action = isCreating
                    ? `أنشأ فرصة جديدة: ${savedDeal.title}`
                    : `حدّث بيانات الفرصة: ${savedDeal.title}`;
                await logAction(action);
            }
        } catch (e: any) {
            set({ error: `فشل حفظ الفرصة: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    moveDeal: async (draggedDealId, targetStatus, beforeDealId) => {
        const originalDeals = get().deals;
        const deal = originalDeals.find(d => d.id === draggedDealId);
        if (!deal) return;
        
        const updatedDeal = { ...deal, status: targetStatus };
        
        let newDeals = originalDeals.filter(d => d.id !== draggedDealId);
        const targetIndex = beforeDealId ? newDeals.findIndex(d => d.id === beforeDealId) : -1;
        if (targetIndex !== -1) {
            newDeals.splice(targetIndex, 0, updatedDeal);
        } else {
            newDeals.push(updatedDeal);
        }

        set({ deals: newDeals });

        try {
            await api.updateOpportunity(draggedDealId, { status: targetStatus });
            await logAction(`نقل الفرصة "${deal.title}" إلى مرحلة "${STAGES.find(s => s.id === targetStatus)?.title}".`);
        } catch (e: any) {
            set({ error: `فشل تحديث مرحلة الفرصة: ${e.message}`, deals: originalDeals }); // Revert on error
        }
    },
    
    updateDealStatusFromProject: (deal) => get().openDealModal({ ...deal, status: deal.status }),

    saveProject: async (project, isCreating) => {
        set({ isSubmitting: true, error: null });
        try {
            const savedProject = isCreating ? await api.createProject(project) : await api.updateProject(project.id, project);
            set(state => ({
                projects: isCreating ? [savedProject, ...state.projects] : state.projects.map(p => p.id === savedProject.id ? savedProject : p)
            }));
            const action = isCreating ? `أنشأ مشروعًا جديدًا: ${savedProject.name}` : `حدّث بيانات المشروع: ${savedProject.name}`;
            await logAction(action);
        } catch (e: any) {
            set({ error: `فشل حفظ المشروع: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    createProject: async (projectData) => {
       await get().saveProject(projectData as Project, true);
    },

    createProjectFromDeal: async (deal) => {
        const projectData: Omit<Project, 'id'> = {
            dealId: deal.id,
            name: deal.title,
            clientName: deal.companyName,
            projectManagerId: deal.projectManagerId,
            status: ProjectStatus.PLANNING,
            startDate: new Date().toISOString().split('T')[0],
            services: deal.services,
            projectType: ProjectType.GENERAL,
            scope: deal.scope,
            description: deal.notes,
            developmentDetails: BLANK_PROJECT.developmentDetails,
            marketingDetails: BLANK_PROJECT.marketingDetails,
        };
        await get().saveProject(projectData as Project, true);
        get().addNotification(`تم إنشاء مشروع جديد تلقائيًا من فرصة الفوز: ${deal.title}`, NotificationType.PROJECT_STATUS_CHANGED);
    },
    
    updateProjectStatus: async (projectId, newStatus) => {
        const { projects, deals, openSyncModal } = get();
        const originalProjects = projects;
        const project = originalProjects.find(p => p.id === projectId);
        if (!project) return;

        // Check for status sync when project is completed
        if (newStatus === ProjectStatus.COMPLETED && project.dealId) {
            const deal = deals.find(d => d.id === project.dealId);
            if (deal && deal.status !== DealStatus.WON && deal.status !== DealStatus.LOST) {
                openSyncModal(project, deal);
            }
        }
        
        const updatedProject = { ...project, status: newStatus };
        set({ projects: originalProjects.map(p => p.id === projectId ? updatedProject : p) });
        
        try {
            await api.updateProject(projectId, { status: newStatus });
            await logAction(`غيّر حالة المشروع "${project.name}" إلى "${PROJECT_STATUSES.find(s => s.id === newStatus)?.title}".`);
        } catch(e: any) {
            set({ error: `فشل تحديث حالة المشروع: ${e.message}`, projects: originalProjects }); // Revert
        }
    },

    addTask: async (task) => {
        set({ isSubmitting: true });
        try {
            const newTask = await api.createTask(task);
            set(state => ({ tasks: [...state.tasks, newTask] }));
            await logAction(`أضاف مهمة جديدة: "${newTask.title}"`);
        } catch (e: any) {
            set({ error: `فشل إضافة المهمة: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    updateTask: async (task) => {
        const originalTasks = get().tasks;
        set({ tasks: originalTasks.map(t => t.id === task.id ? task : t) });
        try {
            await api.updateTask(task.id, task);
            if (task.status === TaskStatus.DONE) {
                await logAction(`أكمل المهمة: "${task.title}"`);
            }
        } catch (e: any) {
            set({ error: `فشل تحديث المهمة: ${e.message}`, tasks: originalTasks });
        }
    },

    saveInvoice: async (invoice) => {
        set({ isSubmitting: true });
        try {
            const isNew = !invoice.id;
            const savedInvoice = isNew ? await api.createInvoice(invoice) : await api.updateInvoice(invoice.id, invoice);
            set(state => ({
                invoices: isNew ? [savedInvoice, ...state.invoices] : state.invoices.map(i => i.id === savedInvoice.id ? savedInvoice : i)
            }));
            const action = isNew ? `أنشأ فاتورة جديدة لـ ${savedInvoice.clientName}` : `حدّث الفاتورة #${savedInvoice.id}`;
            await logAction(action);
        } catch(e: any) {
            set({ error: `فشل حفظ الفاتورة: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    createInvoiceFromQuote: (quote) => {
        const newInvoice: Invoice = {
            ...BLANK_INVOICE,
            id: '', // Add empty id to conform to Invoice type
            clientName: quote.clientName,
            amount: quote.total,
            description: `فاتورة بناءً على عرض السعر #${quote.quoteNumber}`,
            dealId: quote.dealId,
            ownerId: get().currentUser!.id,
            scope: get().currentUser!.scope,
        };
        get().openInvoiceModal(newInvoice, true);
    },

    saveQuote: async (quote) => {
        set({ isSubmitting: true });
        try {
            const isNew = !quote.id;
            const savedQuote = isNew ? await api.createQuote(quote) : await api.updateQuote(quote.id, quote);
             set(state => ({
                quotes: isNew ? [savedQuote, ...state.quotes] : state.quotes.map(q => q.id === savedQuote.id ? savedQuote : q)
            }));
             const action = isNew ? `أنشأ عرض سعر لـ ${savedQuote.clientName}` : `حدّث عرض السعر #${savedQuote.quoteNumber}`;
            await logAction(action);
            return savedQuote;
        } catch (e: any) {
             set({ error: `فشل حفظ عرض السعر: ${e.message}` });
             throw e;
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    saveAccount: async (account, isCreating) => {
        set({ isSubmitting: true });
        try {
            const savedAccount = isCreating ? await api.createAccount(account) : await api.updateAccount(account.id, account);
            set(state => ({
                accounts: isCreating ? [savedAccount, ...state.accounts] : state.accounts.map(a => a.id === savedAccount.id ? savedAccount : a)
            }));
            await logAction(isCreating ? `أنشأ حسابًا جديدًا: ${savedAccount.name}` : `حدّث الحساب: ${savedAccount.name}`);
        } catch (e: any) {
            set({ error: `فشل حفظ الحساب: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    deleteAccount: async (id) => {
        set({ isSubmitting: true });
        try {
            const accountName = get().accounts.find(a => a.id === id)?.name;
            await api.deleteAccount(id);
            set(state => ({ accounts: state.accounts.filter(a => a.id !== id) }));
            await logAction(`حذف الحساب: ${accountName}`);
        } catch (e: any) {
            set({ error: `فشل حذف الحساب: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    saveUser: async (user) => {
        set({ isSubmitting: true });
        try {
            const isNew = !user.id;
            const savedUser = isNew ? await api.createUser(user) : await api.updateUser(user.id, user);
            set(state => ({
                users: isNew ? [savedUser, ...state.users] : state.users.map(u => u.id === savedUser.id ? savedUser : u)
            }));
             await logAction(isNew ? `أنشأ مستخدمًا جديدًا: ${savedUser.name}` : `حدّث بيانات المستخدم: ${savedUser.name}`);
        } catch(e: any) {
            set({ error: `فشل حفظ المستخدم: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    updateCurrentUser: (user) => {
        set({ currentUser: user });
    },
    
    deleteUser: async (id) => {
        set({ isSubmitting: true });
        try {
            const userName = get().users.find(u => u.id === id)?.name;
            await api.deleteUser(id);
            set(state => ({ users: state.users.filter(u => u.id !== id) }));
            await logAction(`حذف المستخدم: ${userName}`);
        } catch(e: any) {
            set({ error: `فشل حذف المستخدم: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    saveGroup: async (group, memberIds) => {
        set({ isSubmitting: true });
        try {
            const isNew = !group.id;
            const { savedGroup, updatedUsers } = await api.saveGroup(group, memberIds);
            set(state => ({
                groups: isNew ? [savedGroup, ...state.groups] : state.groups.map(g => g.id === savedGroup.id ? savedGroup : g),
                users: state.users.map(u => updatedUsers.find(up => up.id === u.id) || u)
            }));
            await logAction(isNew ? `أنشأ فريقًا جديدًا: ${savedGroup.name}` : `حدّث فريق: ${savedGroup.name}`);
        } catch (e: any) {
             set({ error: `فشل حفظ الفريق: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },

    deleteGroup: async (id) => {
        set({ isSubmitting: true });
         try {
            const groupName = get().groups.find(g => g.id === id)?.name;
            await api.deleteGroup(id);
            set(state => ({
                groups: state.groups.filter(g => g.id !== id),
                users: state.users.map(u => u.groupId === id ? { ...u, groupId: null } : u)
            }));
            await logAction(`حذف الفريق: ${groupName}`);
        } catch (e: any) {
            set({ error: `فشل حذف الفريق: ${e.message}` });
        } finally {
            set({ isSubmitting: false });
        }
    },
    
    requestPasswordReset: async (email) => { 
        set({isSubmitting: true, error: null});
        try {
            const { code } = await api.requestPasswordReset(email);
            get().addNotification(`لأغراض العرض، رمز إعادة التعيين لـ ${email} هو: ${code}`, NotificationType.MEETING_REMINDER);
            set({isSubmitting: false});
            return true;
        } catch (e: any) {
            set({ error: e.message, isSubmitting: false });
            return false;
        }
    },
    resetPassword: async (email, code, newPassword) => { 
        set({isSubmitting: true, error: null});
        try {
            await api.resetPassword({ email, token: code, password: newPassword });
            set({isSubmitting: false});
            return true;
        } catch (e: any) {
            set({ error: e.message, isSubmitting: false });
            return false;
        }
    },
    scheduleMeeting: async (dealId, meetingTime) => { 
        set({isSubmitting: true});
        try {
            const updatedDealData = await api.scheduleMeetingForDeal(dealId, meetingTime);
            const updatedDeal = api.apiToDeal(updatedDealData);
            set(state => ({ deals: state.deals.map(d => d.id === dealId ? updatedDeal : d) }));
            get().addNotification(`تم جدولة اجتماع لـ "${updatedDeal.title}" بنجاح.`, NotificationType.MEETING_SCHEDULED);
        } catch(e: any) {
            set({ error: `فشل جدولة الاجتماع: ${e.message}` });
        } finally {
            set({isSubmitting: false});
        }
    },

    // --- Modal Actions ---
    openDealModal: (deal, isCreating = false) => set(state => ({ modalState: { ...state.modalState, deal: { deal, isCreating } } })),
    closeDealModal: () => set(state => ({ modalState: { ...state.modalState, deal: { deal: null, isCreating: false } } })),
    openReasonForLossModal: (deal) => set(state => ({ modalState: { ...state.modalState, reasonForLoss: deal } })),
    closeReasonForLossModal: () => set(state => ({ modalState: { ...state.modalState, reasonForLoss: null } })),
    openProjectModal: (project, isCreating = false, initialTab = 'details') => set(state => ({ modalState: { ...state.modalState, project: { project, isCreating, initialTab: isCreating ? 'details' : initialTab } } })),
    closeProjectModal: () => set(state => ({ modalState: { ...state.modalState, project: { project: null, isCreating: false, initialTab: 'details' } } })),
    openSyncModal: (project, deal) => set(state => ({ modalState: { ...state.modalState, sync: { project, deal } } })),
    closeSyncModal: () => set(state => ({ modalState: { ...state.modalState, sync: null } })),
    openLeadModal: (lead, isCreating = false) => set(state => ({ modalState: { ...state.modalState, lead: { lead, isCreating } } })),
    closeLeadModal: () => set(state => ({ modalState: { ...state.modalState, lead: { lead: null, isCreating: false } } })),
    openReassignLeadModal: (lead) => set(state => ({ modalState: { ...state.modalState, reassignLead: lead } })),
    closeReassignLeadModal: () => set(state => ({ modalState: { ...state.modalState, reassignLead: null } })),
    openInvoiceModal: (invoice, isCreating = false) => set(state => ({ modalState: { ...state.modalState, invoice: { invoice, isCreating } } })),
    closeInvoiceModal: () => set(state => ({ modalState: { ...state.modalState, invoice: { invoice: null, isCreating: false } } })),
    openUserModal: (user, isCreating = false) => set(state => ({ modalState: { ...state.modalState, user: { user, isCreating } } })),
    closeUserModal: () => set(state => ({ modalState: { ...state.modalState, user: { user: null, isCreating: false } } })),
    openGroupModal: (group, isCreating = false) => set(state => ({ modalState: { ...state.modalState, group: { group, isCreating } } })),
    closeGroupModal: () => set(state => ({ modalState: { ...state.modalState, group: { group: null, isCreating: false } } })),
    openAccountModal: (account, isCreating = false) => set(state => ({ modalState: { ...state.modalState, account: { account, isCreating } } })),
    closeAccountModal: () => set(state => ({ modalState: { ...state.modalState, account: { account: null, isCreating: false } } })),
    openAccountDetailsModal: (account) => set(state => ({ modalState: { ...state.modalState, accountDetails: account } })),
    closeAccountDetailsModal: () => set(state => ({ modalState: { ...state.modalState, accountDetails: null } })),
    openConfirmationModal: (title, message, onConfirm, confirmButtonText, cancelButtonText) => set(state => ({ modalState: { ...state.modalState, confirmation: { title, message, onConfirm, confirmButtonText, cancelButtonText } } })),
    closeConfirmationModal: () => set(state => ({ modalState: { ...state.modalState, confirmation: null } })),
    openForgotPasswordModal: () => set(state => ({ modalState: { ...state.modalState, forgotPassword: true } })),
    closeForgotPasswordModal: () => set(state => ({ modalState: { ...state.modalState, forgotPassword: false } })),
    openSchedulingModal: (deal) => set(state => ({ modalState: { ...state.modalState, schedulingModal: { deal } } })),
    closeSchedulingModal: () => set(state => ({ modalState: { ...state.modalState, schedulingModal: { deal: null } } })),
    openEmailComposerModal: (target) => set(state => ({ modalState: { ...state.modalState, emailComposer: { target } } })),
    closeEmailComposerModal: () => set(state => ({ modalState: { ...state.modalState, emailComposer: { target: null } } })),
    openQuoteEditor: (deal, quote) => set({ activeQuote: { deal, quote } }),
    closeQuoteEditor: () => set({ activeQuote: null }),
}}));
