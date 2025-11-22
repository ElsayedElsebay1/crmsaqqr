import { Deal, DealStatus, Lead, LeadStatus, PaymentStatus, Stage, ProjectStatus, TaskStatus, InvoiceStatus, ProjectType, User, Role, Permissions, Project, Invoice, TaskPriority, WidgetKey, DashboardPreferences, UserRole, Theme, Account, QuoteStatus } from './types';

export const STAGES: Stage[] = [
  { id: DealStatus.NEW_OPPORTUNITY, title: 'فرصة جديدة' },
  { id: DealStatus.MEETING_SCHEDULED, title: 'اجتماع محدد' },
  { id: DealStatus.PROPOSAL_SENT, title: 'عرض مُرسل' },
  { id: DealStatus.NEGOTIATION, title: 'تفاوض' },
  { id: DealStatus.WON, title: 'فوز' },
  { id: DealStatus.LOST, title: 'خسارة' },
];

export const LEAD_STATUSES = [
    { id: LeadStatus.NEW, title: 'جديد' },
    { id: LeadStatus.CONTACTED, title: 'تم التواصل' },
    { id: LeadStatus.QUALIFIED, title: 'مؤهل' },
    { id: LeadStatus.NOT_INTERESTED, title: 'غير مهتم' },
    { id: LeadStatus.CONVERTED, title: 'تم تحويله' },
];

export const LEAD_SOURCES = [
  { id: 'website_contact', name: 'الموقع - صفحة اتصل بنا' },
  { id: 'google_ads', name: 'حملات جوجل' },
  { id: 'email_campaign', name: 'حملات البريد الإلكتروني' },
  { id: 'social_facebook', name: 'التواصل الاجتماعي - فيسبوك' },
  { id: 'social_instagram', name: 'التواصل الاجتماعي - انستغرام' },
  { id: 'social_x', name: 'التواصل الاجتماعي - X (تويتر)' },
  { id: 'social_linkedin', name: 'التواصل الاجتماعي - لينكدإن' },
  { id: 'referral', name: 'توصية / إحالة' },
  { id: 'cold_call', name: 'مكالمة باردة' },
  { id: 'other', name: 'أخرى' },
];

export const PROJECT_STATUSES = [
    { id: ProjectStatus.PLANNING, title: 'تخطيط' },
    { id: ProjectStatus.IN_PROGRESS, title: 'قيد التنفيذ' },
    { id: ProjectStatus.COMPLETED, title: 'مكتمل' },
    { id: ProjectStatus.ON_HOLD, title: 'معلق' },
    { id: ProjectStatus.ARCHIVED, title: 'مؤرشف' },
];

export const PROJECT_TYPES = [
    { id: ProjectType.GENERAL, title: 'عام' },
    { id: ProjectType.WEB_DEVELOPMENT, title: 'تطوير مواقع وتطبيقات' },
    { id: ProjectType.DIGITAL_MARKETING, title: 'تسويق رقمي' },
];

export const MARKETING_SERVICES = [
  { id: 'social_media_management', name: 'إدارة حسابات التواصل الاجتماعي' },
  { id: 'ad_campaign_management', name: 'إدارة الحملات الإعلانية' },
  { id: 'google_ads', name: 'Google إعلانات' },
  { id: 'seo', name: 'تحسين محركات البحث (SEO)' },
  { id: 'cro', name: 'تحسين معدل التحويل (CRO)' },
  { id: 'web_design_development', name: 'تصميم وبرمجة المواقع' },
  { id: 'b2b_partnership', name: 'الشريك التنفيذي لوكالات التسويق (B2B)' },
];


export const TASK_STATUSES = [
    { id: TaskStatus.TODO, title: 'للقيام به' },
    { id: TaskStatus.IN_PROGRESS, title: 'قيد التنفيذ' },
    { id: TaskStatus.DONE, title: 'مكتمل' },
]

export const TASK_PRIORITIES = [
    { id: TaskPriority.HIGH, title: 'عالية' },
    { id: TaskPriority.MEDIUM, title: 'متوسطة' },
    { id: TaskPriority.LOW, title: 'منخفضة' },
];

export const INVOICE_STATUSES = [
    { id: InvoiceStatus.DRAFT, title: 'مسودة' },
    { id: InvoiceStatus.SENT, title: 'مرسلة' },
    { id: InvoiceStatus.PAID, title: 'مدفوعة' },
    { id: InvoiceStatus.OVERDUE, title: 'متأخرة' },
]

export const QUOTE_STATUSES = [
    { id: QuoteStatus.DRAFT, title: 'مسودة' },
    { id: QuoteStatus.SENT, title: 'مرسل' },
    { id: QuoteStatus.ACCEPTED, title: 'مقبول' },
    { id: QuoteStatus.REJECTED, title: 'مرفوض' },
];

export const BLANK_DEAL: Omit<Deal, 'id' | 'scope'> = {
  accountId: '',
  title: '',
  companyName: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  value: 0,
  status: DealStatus.NEW_OPPORTUNITY,
  source: '',
  nextMeetingDate: null,
  nextMeetingTime: '',
  googleMeetLink: '',
  paymentStatus: PaymentStatus.PENDING,
  projectManagerId: null,
  services: [],
  activity: [],
  ownerId: '',
  lostReason: undefined,
  lostReasonDetails: '',
  notes: '',
};

export const BLANK_LEAD: Omit<Lead, 'id'> = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  source: '',
  status: LeadStatus.NEW,
  ownerId: '',
  services: [],
  activity: [],
  notInterestedReason: '',
  lastUpdatedAt: new Date().toISOString(),
  scope: '', // Retained for data visibility/scoping
};

export const BLANK_PROJECT: Omit<Project, 'id' | 'dealId'> = {
  name: '',
  clientName: '',
  projectManagerId: null,
  status: ProjectStatus.PLANNING,
  startDate: new Date().toISOString().split('T')[0],
  services: [],
  projectType: ProjectType.GENERAL,
  description: '',
  scope: '',
  developmentDetails: {
    stages: { analysis: false, design: false, programming: false, testing: false, launch: false }
  },
  marketingDetails: {
    platforms: '',
    campaignDurationDays: 30,
    monthlyBudget: 0
  }
};

export const BLANK_INVOICE: Omit<Invoice, 'id' | 'scope'> = {
  clientName: '',
  amount: 0,
  status: InvoiceStatus.DRAFT,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  description: '',
  projectId: null,
  dealId: null,
  ownerId: '',
};

export const BLANK_USER: Omit<User, 'id' | 'passwordHash'> = {
    name: '',
    email: '',
    password: '',
    role: UserRole.Sales,
    avatarUrl: '',
    targets: { monthlyDeals: 0, monthlyCalls: 0, monthlyRevenue: 0 },
    officeLocation: 'المكتب الرئيسي',
    isActive: true,
    scope: 'KSA',
    groupId: null,
};

export const BLANK_ACCOUNT: Omit<Account, 'id'> = {
    name: '',
    website: '',
    industry: '',
    status: 'Active',
};


export const WIDGETS_CONFIG: { id: WidgetKey; title: string; description: string }[] = [
    { id: 'quickStats', title: 'إحصائيات سريعة', description: 'عرض الفرص المفتوحة، الفواتير المتأخرة، والمهام المستحقة اليوم.' },
    { id: 'projectStatusSummary', title: 'ملخص حالة المشاريع', description: 'نظرة سريعة على عدد المشاريع في كل حالة.' },
    { id: 'analyticsGrid', title: 'شبكة التحليلات', description: 'مقاييس الأداء الرئيسية مثل الإيرادات ومعدلات النجاح.' },
    { id: 'salesFunnel', title: 'مسار المبيعات', description: 'عرض مرئي لمراحل الفرص البيعية من البداية إلى الفوز.' },
    { id: 'projectsStatusChart', title: 'مخطط حالة المشاريع', description: 'رسم بياني يوضح توزيع حالات المشاريع.' },
    { id: 'recentActivity', title: 'آخر الأنشطة في النظام', description: 'عرض لآخر الإجراءات التي قام بها المستخدمون في النظام.' },
    { id: 'upcomingDeadlines', title: 'المواعيد والمهام القادمة', description: 'قائمة بأقرب الاجتماعات والمهام المستحقة.' },
];

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
    widgets: {
        quickStats: true,
        projectStatusSummary: true,
        analyticsGrid: true,
        salesFunnel: true,
        projectsStatusChart: true,
        recentActivity: true,
        upcomingDeadlines: true,
    },
    order: WIDGETS_CONFIG.map(w => w.id),
};

export const THEMES: Theme[] = [
    {
        id: 'saqqr-cyan',
        name: 'Saqqr Cyan (Default)',
        colors: {
            '--color-primary': '#00B7C1',
            '--color-primary-hover': '#00A3AD',
            '--color-primary-light': '#5BE1E8',
        }
    },
    {
        id: 'crimson-red',
        name: 'Crimson Red',
        colors: {
            '--color-primary': '#dc2626', // red-600
            '--color-primary-hover': '#b91c1c', // red-700
            '--color-primary-light': '#f87171', // red-400
        }
    },
    {
        id: 'emerald-green',
        name: 'Emerald Green',
        colors: {
            '--color-primary': '#10b981', // emerald-500
            '--color-primary-hover': '#059669', // emerald-600
            '--color-primary-light': '#6ee7b7', // emerald-300
        }
    },
     {
        id: 'royal-blue',
        name: 'Royal Blue',
        colors: {
            '--color-primary': '#3b82f6', // blue-500
            '--color-primary-hover': '#2563eb', // blue-600
            '--color-primary-light': '#93c5fd', // blue-300
        }
    }
];


// PERMISSIONS
const ADMIN_PERMISSIONS: Permissions = {
  dashboard: { read: true },
  leads: { create: true, read: true, update: true, delete: true },
  deals: { create: true, read: true, update: true, delete: true },
  projects: { create: true, read: true, update: true, delete: true },
  accounts: { create: true, read: true, update: true, delete: true },
  financials: { read: true },
  invoices: { create: true, read: true, update: true, delete: true },
  users: { create: true, read: true, update: true, delete: true },
  teams: { create: true, read: true, update: true, delete: true },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};

const MANAGER_PERMISSIONS: Permissions = {
  dashboard: { read: true },
  leads: { create: false, read: true, update: true, delete: false },
  deals: { create: false, read: true, update: true, delete: false },
  projects: { create: false, read: true, update: true, delete: false },
  accounts: { create: true, read: true, update: true, delete: false },
  financials: { read: true },
  invoices: { create: false, read: true, update: false, delete: false },
  users: { create: false, read: true, update: false, delete: false },
  teams: { create: false, read: true, update: true, delete: false },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};

const SALES_PERMISSIONS: Permissions = {
  dashboard: { read: true },
  leads: { create: false, read: true, update: true, delete: false },
  deals: { create: true, read: true, update: true, delete: false },
  projects: { create: false, read: true, update: false, delete: false },
  accounts: { create: true, read: true, update: true, delete: false },
  financials: { read: true },
  invoices: { create: false, read: true, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  teams: { create: false, read: false, update: false, delete: false },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};

const TELESALES_PERMISSIONS: Permissions = {
  dashboard: { read: false },
  leads: { create: true, read: true, update: true, delete: false },
  deals: { create: false, read: false, update: false, delete: false },
  projects: { create: false, read: false, update: false, delete: false },
  accounts: { create: false, read: true, update: false, delete: false },
  financials: { read: false },
  invoices: { create: false, read: false, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  teams: { create: false, read: false, update: false, delete: false },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};

const PM_PERMISSIONS: Permissions = {
  dashboard: { read: true },
  leads: { create: false, read: false, update: false, delete: false },
  deals: { create: false, read: true, update: false, delete: false },
  projects: { create: true, read: true, update: true, delete: false },
  accounts: { create: false, read: true, update: false, delete: false },
  financials: { read: true },
  invoices: { create: false, read: true, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  teams: { create: false, read: false, update: false, delete: false },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};

const FINANCE_PERMISSIONS: Permissions = {
  dashboard: { read: true },
  leads: { create: false, read: true, update: false, delete: false },
  deals: { create: false, read: true, update: false, delete: false },
  projects: { create: false, read: true, update: false, delete: false },
  accounts: { create: false, read: true, update: false, delete: false },
  financials: { read: true },
  invoices: { create: true, read: true, update: true, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  teams: { create: false, read: false, update: false, delete: false },
  settings: { read: true },
  reports: { read: true },
  calendar: { read: true },
};


export const ALL_ROLES: Role[] = [
  { id: UserRole.Admin, name: 'الإدارة', permissions: ADMIN_PERMISSIONS },
  { id: UserRole.Manager, name: 'مدير مبيعات', permissions: MANAGER_PERMISSIONS },
  { id: UserRole.Sales, name: 'موظف مبيعات', permissions: SALES_PERMISSIONS },
  { id: UserRole.Telesales, name: 'موظف Telesales', permissions: TELESALES_PERMISSIONS },
  { id: UserRole.ProjectManager, name: 'مدير مشروع', permissions: PM_PERMISSIONS },
  { id: UserRole.Finance, name: 'الشؤون المالية', permissions: FINANCE_PERMISSIONS },
];