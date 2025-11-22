
import { Lead, Deal, Project, Task, Invoice, User, Account, DealStatus, LeadStatus, PaymentStatus, ProjectStatus, ProjectType, TaskStatus, TaskPriority, InvoiceStatus, UserRole, ActivityLogEntry, Group, Notification, NotificationType, Quote, QuoteStatus, Activity } from '../types';
import { ALL_ROLES, BLANK_PROJECT, LEAD_STATUSES, STAGES } from '../constants';

// --- REAL API SERVICE ---

// In a real application, this would come from an environment variable.
const API_BASE_URL = 'https://apicrm.saqqr.com'; // Standard Laravel dev URL.

// Helper to check if we are in demo mode
const isDemoMode = () => localStorage.getItem('saqqr_demo_mode') === 'true';

// --- MOCK DATA GENERATORS ---
const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Admin User', email: 'admin@saqqr.com', role: UserRole.Admin, avatarUrl: '', targets: { monthlyDeals: 10, monthlyCalls: 100, monthlyRevenue: 500000 }, officeLocation: 'الرياض', isActive: true, scope: 'ALL', groupId: null, passwordHash: '' },
    { id: 'user-2', name: 'Sales Rep', email: 'sales@saqqr.com', role: UserRole.Sales, avatarUrl: '', targets: { monthlyDeals: 5, monthlyCalls: 150, monthlyRevenue: 200000 }, officeLocation: 'جدة', isActive: true, scope: 'KSA', groupId: 'group-1', passwordHash: '' },
    { id: 'user-3', name: 'Project Manager', email: 'pm@saqqr.com', role: UserRole.ProjectManager, avatarUrl: '', targets: { monthlyDeals: 0, monthlyCalls: 0, monthlyRevenue: 0 }, officeLocation: 'الدمام', isActive: true, scope: 'KSA', groupId: null, passwordHash: '' },
    { id: 'user-4', name: 'Finance User', email: 'finance@saqqr.com', role: UserRole.Finance, avatarUrl: '', targets: { monthlyDeals: 0, monthlyCalls: 0, monthlyRevenue: 0 }, officeLocation: 'الرياض', isActive: true, scope: 'ALL', groupId: null, passwordHash: '' },
];

// In-memory mock stores (reset on reload)
let mockLeads: Lead[] = [
    { id: 'lead-1', companyName: 'شركة الأفق', contactPerson: 'محمد العلي', email: 'm.ali@horizon.com', phone: '0501234567', source: 'Website', status: LeadStatus.NEW, ownerId: 'user-2', services: ['seo'], activity: [], lastUpdatedAt: new Date().toISOString(), scope: 'KSA' },
    { id: 'lead-2', companyName: 'مؤسسة النور', contactPerson: 'سارة أحمد', email: 'sara@alnoor.com', phone: '0559876543', source: 'LinkedIn', status: LeadStatus.CONTACTED, ownerId: 'user-2', services: ['web_design_development'], activity: [], lastUpdatedAt: new Date().toISOString(), scope: 'KSA' },
];

let mockDeals: Deal[] = [
    { id: 'deal-1', accountId: 'acc-1', title: 'مشروع تطوير موقع', companyName: 'شركة الأفق', contactPerson: 'محمد العلي', value: 50000, status: DealStatus.NEGOTIATION, contactEmail: 'm.ali@horizon.com', contactPhone: '0501234567', source: 'Website', nextMeetingDate: null, paymentStatus: PaymentStatus.PENDING, projectManagerId: null, services: ['web_design_development'], activity: [], ownerId: 'user-2', scope: 'KSA' },
    { id: 'deal-2', accountId: 'acc-2', title: 'حملة تسويقية', companyName: 'مؤسسة النور', contactPerson: 'سارة أحمد', value: 15000, status: DealStatus.WON, contactEmail: 'sara@alnoor.com', contactPhone: '0559876543', source: 'LinkedIn', nextMeetingDate: null, paymentStatus: PaymentStatus.PAID, projectManagerId: 'user-3', services: ['social_media_management'], activity: [], ownerId: 'user-2', scope: 'KSA' },
];

let mockProjects: Project[] = [
    { id: 'proj-1', dealId: 'deal-2', name: 'حملة تسويقية - النور', clientName: 'مؤسسة النور', projectManagerId: 'user-3', status: ProjectStatus.IN_PROGRESS, startDate: '2023-10-01', services: ['social_media_management'], projectType: ProjectType.DIGITAL_MARKETING, scope: 'KSA' }
];

let mockTasks: Task[] = [
    { id: 'task-1', projectId: 'proj-1', title: 'إعداد خطة المحتوى', assignedTo: ['Sales Rep'], status: TaskStatus.IN_PROGRESS, startDate: '2023-10-02', dueDate: '2023-10-05', priority: TaskPriority.HIGH },
    { id: 'task-2', projectId: 'proj-1', title: 'تصميم المنشورات', assignedTo: [], status: TaskStatus.TODO, startDate: '2023-10-06', dueDate: '2023-10-10', priority: TaskPriority.MEDIUM }
];

let mockInvoices: Invoice[] = [
    { id: 'inv-001', clientName: 'مؤسسة النور', amount: 15000, status: InvoiceStatus.PAID, issueDate: '2023-10-01', dueDate: '2023-10-15', description: 'دفعة كاملة للحملة', projectId: 'proj-1', dealId: 'deal-2', ownerId: 'user-2', scope: 'KSA' }
];

let mockAccounts: Account[] = [
    { id: 'acc-1', name: 'شركة الأفق', website: 'horizon.com', industry: 'Technology', status: 'Active' },
    { id: 'acc-2', name: 'مؤسسة النور', website: 'alnoor.com', industry: 'Retail', status: 'Active' }
];

let mockGroups: Group[] = [
    { id: 'group-1', name: 'فريق مبيعات الرياض', managerId: 'user-1', scope: 'KSA' }
];

let mockActivityLog: ActivityLogEntry[] = [
    { id: 'log-1', userId: 'user-2', userName: 'Sales Rep', userAvatar: '', action: 'سجّل الدخول للنظام', timestamp: new Date().toISOString() },
    { id: 'log-2', userId: 'user-2', userName: 'Sales Rep', userAvatar: '', action: 'أضاف عميل محتمل جديد: شركة الأفق', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'log-3', userId: 'user-3', userName: 'Project Manager', userAvatar: '', action: 'بدأ مشروع: حملة تسويقية - النور', timestamp: new Date(Date.now() - 172800000).toISOString() }
];

let mockQuotes: Quote[] = [
    { 
        id: 'q-1', 
        quoteNumber: 'Q-1001', 
        dealId: 'deal-1', 
        clientName: 'شركة الأفق', 
        issueDate: '2023-10-01', 
        expiryDate: '2023-10-31', 
        status: QuoteStatus.SENT, 
        items: [
            { id: 'qi-1', description: 'تصميم وتطوير موقع إلكتروني', quantity: 1, unitPrice: 5000 }
        ], 
        terms: 'شروط قياسية', 
        subtotal: 5000, 
        discount: 0, 
        tax: 15, 
        total: 5750 
    }
];


/**
 * A wrapper for the native fetch API to handle common settings for API calls.
 * - Sets appropriate headers for JSON communication.
 * - Includes credentials (cookies) for authenticated sessions with Sanctum.
 * - Parses JSON responses and throws structured errors.
 * @param endpoint The API endpoint to call (e.g., '/api/users').
 * @param options Standard RequestInit options for fetch.
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    if (isDemoMode()) return null; // Should not happen if all functions are mocked properly

    const defaultHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // CRITICAL for Laravel Sanctum cookie-based authentication
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        // Attempt to parse a JSON error response from the backend
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        // Create a meaningful error message
        const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }

    // Handle responses that don't have a body (e.g., 204 No Content)
    if (response.status === 204) {
        return null;
    }

    return response.json();
};


// --- Authentication ---
export const getCsrfCookie = () => isDemoMode() ? Promise.resolve() : apiFetch('/sanctum/csrf-cookie');
export const loginApi = (credentials: {email: string, password: string}) => isDemoMode() ? Promise.resolve() : apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
});
export const logoutApi = () => {
    if (isDemoMode()) {
        localStorage.removeItem('saqqr_demo_mode');
        localStorage.removeItem('saqqr_demo_email');
        return Promise.resolve();
    }
    return apiFetch('/logout', { method: 'POST' });
};

export const fetchCurrentUser = (): Promise<User> => {
    if (isDemoMode()) {
        const email = localStorage.getItem('saqqr_demo_email');
        const user = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
        return Promise.resolve(user);
    }
    return apiFetch('/api/user');
};


// --- Data Fetching ---
export const fetchLeads = (): Promise<Lead[]> => isDemoMode() ? Promise.resolve(mockLeads) : apiFetch('/api/leads');
export const fetchOpportunities = (): Promise<any[]> => isDemoMode() ? Promise.resolve(mockDeals.map(dealToApi)) : apiFetch('/api/opportunities');
export const fetchAccounts = (): Promise<Account[]> => isDemoMode() ? Promise.resolve(mockAccounts) : apiFetch('/api/accounts');
export const fetchProjects = (): Promise<Project[]> => isDemoMode() ? Promise.resolve(mockProjects) : apiFetch('/api/projects');
export const fetchTasks = (): Promise<Task[]> => isDemoMode() ? Promise.resolve(mockTasks) : apiFetch('/api/tasks');
export const fetchInvoices = (): Promise<Invoice[]> => isDemoMode() ? Promise.resolve(mockInvoices) : apiFetch('/api/invoices');
export const fetchQuotes = (): Promise<Quote[]> => isDemoMode() ? Promise.resolve(mockQuotes) : apiFetch('/api/quotes');
export const fetchUsers = (): Promise<User[]> => isDemoMode() ? Promise.resolve(MOCK_USERS) : apiFetch('/api/users');
export const fetchGroups = (): Promise<Group[]> => isDemoMode() ? Promise.resolve(mockGroups) : apiFetch('/api/groups');
export const fetchActivityLog = (): Promise<ActivityLogEntry[]> => isDemoMode() ? Promise.resolve(mockActivityLog) : apiFetch('/api/activity-log');
export const fetchContactActivity = async (startDate: Date, endDate: Date): Promise<Record<string, Record<string, number>>> => {
    if (isDemoMode()) {
        // Generate randomized mock activity data
        const data: Record<string, Record<string, number>> = {};
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        
        MOCK_USERS.forEach(u => {
            if (u.role === UserRole.Sales || u.role === UserRole.Telesales) {
                data[u.id] = {};
                for(let i=1; i<=30; i++) {
                    const day = String(i).padStart(2, '0');
                    const dateKey = `${year}-${String(month).padStart(2, '0')}-${day}`;
                    // Random activity count between 0 and 8
                    data[u.id][dateKey] = Math.floor(Math.random() * 9); 
                }
            }
        });
        return Promise.resolve(data);
    }
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return apiFetch(`/api/reports/contact-activity?start_date=${start}&end_date=${end}`);
};


// --- Data Mutation ---
// Simple mocks for mutation: update local mock arrays and return the object
export const createLead = (lead: Partial<Lead>): Promise<Lead> => {
    if (isDemoMode()) {
        const newLead = { ...lead, id: `lead-${Date.now()}`, activity: [], services: [] } as Lead;
        mockLeads.unshift(newLead);
        return Promise.resolve(newLead);
    }
    return apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(lead) });
};

export const updateLead = (id: string, leadUpdate: Partial<Lead>): Promise<Lead> => {
    if (isDemoMode()) {
        mockLeads = mockLeads.map(l => l.id === id ? { ...l, ...leadUpdate } : l);
        return Promise.resolve(mockLeads.find(l => l.id === id) as Lead);
    }
    return apiFetch(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(leadUpdate) });
};

export const convertLeadApi = (id: string): Promise<{ account: Account, opportunity: any }> => {
    if (isDemoMode()) {
        const lead = mockLeads.find(l => l.id === id);
        if (!lead) throw new Error('Lead not found');
        const newAccount = { id: `acc-${Date.now()}`, name: lead.companyName, status: 'Active' } as Account;
        mockAccounts.push(newAccount);
        const newDeal = { 
            id: `deal-${Date.now()}`, 
            title: `New Deal - ${lead.companyName}`, 
            companyName: lead.companyName, 
            status: DealStatus.NEW_OPPORTUNITY,
            value: 0,
            contactPerson: lead.contactPerson,
            ownerId: lead.ownerId,
            scope: lead.scope,
            services: lead.services,
            accountId: newAccount.id,
            paymentStatus: PaymentStatus.PENDING,
            activity: [],
        } as Deal;
        mockDeals.push(newDeal);
        return Promise.resolve({ account: newAccount, opportunity: dealToApi(newDeal) });
    }
    return apiFetch(`/api/leads/${id}/convert`, { method: 'POST' });
};

export const createAccount = (account: Partial<Account>): Promise<Account> => {
    if (isDemoMode()) {
        const newAccount = { ...account, id: `acc-${Date.now()}` } as Account;
        mockAccounts.push(newAccount);
        return Promise.resolve(newAccount);
    }
    return apiFetch('/api/accounts', { method: 'POST', body: JSON.stringify(account) });
};

export const updateAccount = (id: string, accountUpdate: Partial<Account>): Promise<Account> => {
    if (isDemoMode()) {
        mockAccounts = mockAccounts.map(a => a.id === id ? { ...a, ...accountUpdate } : a);
        return Promise.resolve(mockAccounts.find(a => a.id === id) as Account);
    }
    return apiFetch(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(accountUpdate) });
};

export const deleteAccount = (id: string): Promise<void> => {
    if (isDemoMode()) {
        mockAccounts = mockAccounts.filter(a => a.id !== id);
        return Promise.resolve();
    }
    return apiFetch(`/api/accounts/${id}`, { method: 'DELETE' });
};

export const createOpportunity = (opportunity: any): Promise<any> => {
    if (isDemoMode()) {
        const newDeal = apiToDeal({ ...opportunity, id: `deal-${Date.now()}` });
        mockDeals.push(newDeal);
        return Promise.resolve(dealToApi(newDeal));
    }
    return apiFetch('/api/opportunities', { method: 'POST', body: JSON.stringify(opportunity) });
};

export const updateOpportunity = (id: string, opportunity: any): Promise<any> => {
    if (isDemoMode()) {
        const updatedDeal = apiToDeal({ ...opportunity, id });
        // Merge
        mockDeals = mockDeals.map(d => d.id === id ? { ...d, ...updatedDeal, id } : d); 
        return Promise.resolve(opportunity);
    }
    return apiFetch(`/api/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(opportunity) });
};

export const winOpportunity = (id: string, dealUpdate: any): Promise<{ opportunity: any, project: Project }> => {
    if (isDemoMode()) {
        const deal = mockDeals.find(d => d.id === id);
        if (!deal) throw new Error('Deal not found');
        
        // Merge dealUpdate (which is in API format) into the deal object
        const currentApiDeal = dealToApi(deal);
        const mergedApiDeal = { ...currentApiDeal, ...dealUpdate };
        const updatedDeal = { ...apiToDeal(mergedApiDeal), status: DealStatus.WON };
        
        mockDeals = mockDeals.map(d => d.id === id ? updatedDeal : d);
        
        const newProject: Project = {
            ...BLANK_PROJECT,
            id: `proj-${Date.now()}`,
            dealId: id,
            name: updatedDeal.title,
            clientName: updatedDeal.companyName,
            status: ProjectStatus.PLANNING,
            projectManagerId: updatedDeal.projectManagerId,
            services: updatedDeal.services,
            scope: updatedDeal.scope
        } as Project;
        mockProjects.push(newProject);
        
        return Promise.resolve({ opportunity: dealToApi(updatedDeal), project: newProject });
    }
    return apiFetch(`/api/opportunities/${id}/win`, {
        method: 'POST',
        body: JSON.stringify(dealUpdate)
    });
};

export const createProject = (project: Partial<Project>): Promise<Project> => {
    if (isDemoMode()) {
        const newProject = { ...project, id: `proj-${Date.now()}` } as Project;
        mockProjects.push(newProject);
        return Promise.resolve(newProject);
    }
    return apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(project) });
};

export const updateProject = (id: string, projectUpdate: Partial<Project>): Promise<Project> => {
    if (isDemoMode()) {
        mockProjects = mockProjects.map(p => p.id === id ? { ...p, ...projectUpdate } : p);
        return Promise.resolve(mockProjects.find(p => p.id === id) as Project);
    }
    return apiFetch(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(projectUpdate) });
};

export const createTask = (task: Partial<Task>): Promise<Task> => {
    if (isDemoMode()) {
        const newTask = { ...task, id: `task-${Date.now()}` } as Task;
        mockTasks.push(newTask);
        return Promise.resolve(newTask);
    }
    return apiFetch('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
};

export const updateTask = (id: string, taskUpdate: Partial<Task>): Promise<Task> => {
    if (isDemoMode()) {
        mockTasks = mockTasks.map(t => t.id === id ? { ...t, ...taskUpdate } : t);
        return Promise.resolve(mockTasks.find(t => t.id === id) as Task);
    }
    return apiFetch(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskUpdate) });
};

export const createInvoice = (invoice: Partial<Invoice>): Promise<Invoice> => {
    if (isDemoMode()) {
        const newInvoice = { ...invoice, id: `inv-${Date.now()}` } as Invoice;
        mockInvoices.push(newInvoice);
        return Promise.resolve(newInvoice);
    }
    return apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(invoice) });
};

export const updateInvoice = (id: string, invoiceUpdate: Partial<Invoice>): Promise<Invoice> => {
    if (isDemoMode()) {
        mockInvoices = mockInvoices.map(i => i.id === id ? { ...i, ...invoiceUpdate } : i);
        return Promise.resolve(mockInvoices.find(i => i.id === id) as Invoice);
    }
    return apiFetch(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(invoiceUpdate) });
};

export const createQuote = (quote: Partial<Quote>): Promise<Quote> => {
    if (isDemoMode()) {
        const newQuote = { ...quote, id: `quote-${Date.now()}`, quoteNumber: `Q-${Date.now()}` } as Quote;
        mockQuotes.push(newQuote);
        return Promise.resolve(newQuote);
    }
    return apiFetch('/api/quotes', { method: 'POST', body: JSON.stringify(quote) });
};

export const updateQuote = (id: string, quoteUpdate: Partial<Quote>): Promise<Quote> => {
    if (isDemoMode()) {
        mockQuotes = mockQuotes.map(q => q.id === id ? { ...q, ...quoteUpdate } : q);
        return Promise.resolve(mockQuotes.find(q => q.id === id) as Quote);
    }
    return apiFetch(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(quoteUpdate) });
};

export const createUser = (user: Partial<User>): Promise<User> => {
    if (isDemoMode()) return Promise.resolve({ ...user, id: `user-${Date.now()}` } as User);
    return apiFetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
};

export const updateUser = (id: string, userUpdate: Partial<User>): Promise<User> => {
    if (isDemoMode()) return Promise.resolve({ ...userUpdate, id } as User);
    return apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(userUpdate) });
};

export const deleteUser = (id: string): Promise<void> => {
    if (isDemoMode()) return Promise.resolve();
    return apiFetch(`/api/users/${id}`, { method: 'DELETE' });
};

export const saveGroup = (group: Group, memberIds: string[]): Promise<{ savedGroup: Group, updatedUsers: User[] }> => {
    if (isDemoMode()) {
        const savedGroup = { ...group, id: group.id || `group-${Date.now()}` };
        if (!group.id) mockGroups.push(savedGroup);
        else mockGroups = mockGroups.map(g => g.id === group.id ? savedGroup : g);
        return Promise.resolve({ savedGroup, updatedUsers: [] });
    }
    return apiFetch(group.id ? `/api/groups/${group.id}` : '/api/groups', {
        method: group.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...group, members: memberIds }),
    });
};

export const deleteGroup = (id: string): Promise<void> => {
    if (isDemoMode()) {
        mockGroups = mockGroups.filter(g => g.id !== id);
        return Promise.resolve();
    }
    return apiFetch(`/api/groups/${id}`, { method: 'DELETE' });
};

export const createActivityLogEntry = (entry: Omit<ActivityLogEntry, 'id'>): Promise<ActivityLogEntry> => {
    if (isDemoMode()) {
        const newEntry = { ...entry, id: `log-${Date.now()}` };
        mockActivityLog.unshift(newEntry);
        return Promise.resolve(newEntry);
    }
    return apiFetch('/api/activity-log', { method: 'POST', body: JSON.stringify(entry) });
};

export const requestPasswordReset = (email: string): Promise<{ code: string }> => {
    if (isDemoMode()) return Promise.resolve({ code: '123456' });
    return apiFetch('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
};

export const resetPassword = (data: any): Promise<void> => {
    if (isDemoMode()) return Promise.resolve();
    return apiFetch('/reset-password', { method: 'POST', body: JSON.stringify(data) });
};


// --- AI Services (via Backend) ---
export const summarizeTextApi = (text: string): Promise<{ summary: string }> => {
    if (isDemoMode()) return Promise.resolve({ summary: "هذا ملخص تجريبي للنص المقدم. (Demo Mode)" });
    return apiFetch('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};

export const generateFollowUpEmailApi = (target: Lead | Deal, user: User): Promise<{ subject: string; body: string }> => {
    if (isDemoMode()) return Promise.resolve({ subject: "متابعة: " + ('title' in target ? target.title : target.companyName), body: "مرحباً،\n\nأود متابعة الأمر معكم بخصوص...\n\nتحياتي." });
    return apiFetch('/api/ai/generate-email', {
        method: 'POST',
        body: JSON.stringify({ target, user }),
    });
};

export const suggestProjectTasksApi = (description: string): Promise<{ tasks: string[] }> => {
    if (isDemoMode()) return Promise.resolve({ tasks: ["Task 1", "Task 2", "Task 3"] });
    return apiFetch('/api/ai/suggest-tasks', {
        method: 'POST',
        body: JSON.stringify({ description }),
    });
};

// --- AI Services (Client-Side for Chatbot) ---
export const chatWithGemini = async (history: any[], newMessage: string, model: string, config: any = {}) => {
    if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 1000));
        return {
            candidates: [
                {
                    content: {
                        parts: [{ text: "أنا في الوضع التجريبي الآن، ولا يمكنني الوصول للبيانات الحقيقية أو الذكاء الاصطناعي. لكن في النسخة الكاملة، يمكنني مساعدتك في تحليل بياناتك!" }],
                        role: 'model'
                    }
                }
            ]
        };
    }
    try {
        // 1. استدعاء الواجهة الخلفية (Backend) الآمنة الخاصة بنا
        const response = await apiFetch('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                history: history,
                message: newMessage
            }),
        });

        // 2. نقوم بإعادة بناء شكل الرد ليطابق ما تتوقعه واجهة المستخدم
        const simulatedGoogleResponse = {
            candidates: [
                {
                    content: {
                        parts: [{ text: response.text }],
                        role: 'model'
                    }
                }
            ]
        };

        return simulatedGoogleResponse;

    } catch (error) {
        console.error("Secure chat error:", error);
        throw new Error('فشل الاتصال بخدمة الشات الآمنة.');
    }
};


// --- Scheduling (These would call your backend) ---
export const getAvailableSlots = (date: string): Promise<string[]> => {
    if (isDemoMode()) return Promise.resolve(["09:00", "10:00", "14:00", "15:30"]);
    return apiFetch(`/api/scheduling/slots?date=${date}`);
};
export const fetchPublicDealInfo = (dealId: string): Promise<{ title: string }> => {
    if (isDemoMode()) return Promise.resolve({ title: "Demo Deal Title" });
    return apiFetch(`/api/scheduling/deal/${dealId}`);
};
export const bookMeeting = (dealId: string, clientName: string, clientEmail: string, meetingDateTime: Date): Promise<void> => {
    if (isDemoMode()) return Promise.resolve();
    return apiFetch('/api/scheduling/book', {
        method: 'POST',
        body: JSON.stringify({ dealId, clientName, clientEmail, meetingDateTime: meetingDateTime.toISOString() }),
    });
};
export const scheduleMeetingForDeal = (dealId: string, meetingDateTime: Date): Promise<any> => {
    if (isDemoMode()) {
        const deal = mockDeals.find(d => d.id === dealId);
        if (deal) {
            deal.nextMeetingDate = meetingDateTime.toISOString().split('T')[0];
            deal.nextMeetingTime = meetingDateTime.toTimeString().split(' ')[0].substring(0,5);
            return Promise.resolve(dealToApi(deal));
        }
        throw new Error('Deal not found in mock data');
    }
    return apiFetch(`/api/deals/${dealId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ meetingDateTime: meetingDateTime.toISOString() }),
    });
};


// --- Data Transformers ---
export function apiToDeal(opportunity: any): Deal {
  return {
    id: opportunity.id,
    accountId: opportunity.account_id,
    title: opportunity.name,
    companyName: opportunity.company_name,
    contactPerson: opportunity.contact_person,
    value: parseFloat(opportunity.value),
    status: opportunity.status as DealStatus,
    contactEmail: opportunity.contact_email,
    contactPhone: opportunity.contact_phone,
    source: opportunity.source,
    nextMeetingDate: opportunity.next_meeting_date,
    nextMeetingTime: opportunity.next_meeting_time,
    googleMeetLink: opportunity.google_meet_link,
    paymentStatus: opportunity.payment_status as PaymentStatus,
    projectManagerId: opportunity.project_manager_id,
    services: opportunity.services || [],
    activity: opportunity.activity || [],
    ownerId: opportunity.owner_id,
    scope: opportunity.scope,
    lostReason: opportunity.lost_reason,
    lostReasonDetails: opportunity.lost_reason_details,
    notes: opportunity.notes,
  };
}

export function dealToApi(deal: Deal): any {
  return {
    account_id: deal.accountId,
    name: deal.title,
    value: deal.value,
    status: deal.status,
    contact_person: deal.contactPerson,
    contact_email: deal.contactEmail,
    contact_phone: deal.contactPhone,
    source: deal.source,
    next_meeting_date: deal.nextMeetingDate,
    next_meeting_time: deal.nextMeetingTime,
    payment_status: deal.paymentStatus,
    project_manager_id: deal.projectManagerId,
    services: deal.services,
    lost_reason: deal.lostReason,
    lost_reason_details: deal.lostReasonDetails,
    notes: deal.notes,
    company_name: deal.companyName // Included for mock convenience
  };
}
