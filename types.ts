export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  CONVERTED = 'CONVERTED',
}

// Add new types for Activity Log
export type ActivityType = 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING';

export interface Activity {
  id: string;
  type: ActivityType;
  content: string;
  userId: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  ownerId: string;
  services: string[];
  activity: Activity[];
  notInterestedReason?: string;
  lastUpdatedAt: string;
  scope: string; // For data visibility (KSA, EGY, etc.)
}

export enum DealStatus {
  NEW_OPPORTUNITY = 'NEW_OPPORTUNITY',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
}

export type DealLostReason = 'price' | 'competitor' | 'timeline' | 'scope' | 'unresponsive' | 'other';

export interface Deal {
  id: string;
  accountId: string;
  title: string;
  companyName: string;
  contactPerson: string;
  value: number;
  status: DealStatus;
  contactEmail: string;
  contactPhone: string;
  source: string;
  nextMeetingDate: string | null;
  nextMeetingTime?: string;
  googleMeetLink?: string;
  paymentStatus: PaymentStatus;
  projectManagerId: string | null;
  services: string[];
  activity: Activity[];
  ownerId: string;
  scope: string;
  lostReason?: DealLostReason;
  lostReasonDetails?: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  status: 'Active' | 'Inactive';
}

export enum ProjectStatus {
    PLANNING = 'PLANNING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    ARCHIVED = 'ARCHIVED',
}

export enum ProjectType {
    GENERAL = 'GENERAL',
    WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
    DIGITAL_MARKETING = 'DIGITAL_MARKETING',
}

export interface WebDevelopmentDetails {
    stages: {
        analysis: boolean;
        design: boolean;
        programming: boolean;
        testing: boolean;
        launch: boolean;
    };
}

export interface MarketingDetails {
    platforms: string;
    campaignDurationDays: number;
    monthlyBudget: number;
}

export interface Project {
  id: string;
  dealId: string;
  name: string;
  clientName: string;
  projectManagerId: string | null;
  status: ProjectStatus;
  startDate: string;
  services: string[];
  projectType: ProjectType;
  description?: string;
  developmentDetails?: WebDevelopmentDetails;
  marketingDetails?: MarketingDetails;
  scope: string;
}


export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Task {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  assignedTo: string[];
  status: TaskStatus;
  startDate: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  description?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  description: string;
  projectId: string | null;
  dealId: string | null;
  ownerId: string;
  scope: string;
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  dealId: string;
  clientName: string; // denormalized for convenience
  issueDate: string;
  expiryDate: string;
  status: QuoteStatus;
  items: QuoteItem[];
  terms: string;
  subtotal: number;
  discount: number; // as a fixed amount
  tax: number; // as a percentage
  total: number;
}


export enum NotificationType {
  NEW_LEAD_ASSIGNED = 'NEW_LEAD_ASSIGNED',
  DEAL_WON = 'DEAL_WON',
  PROJECT_STATUS_CHANGED = 'PROJECT_STATUS_CHANGED',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  MEETING_REMINDER = 'MEETING_REMINDER',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DEADLINE_APPROACHING = 'TASK_DEADLINE_APPROACHING',
  LEAD_STALE = 'LEAD_STALE',
  DAILY_DIGEST_INACTIVE_LEADS = 'DAILY_DIGEST_INACTIVE_LEADS',
  GENERAL_ERROR = 'GENERAL_ERROR',
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationPreferences {
  onNewLead: boolean;
  onDealWon: boolean;
  onProjectStatusChange: boolean;
}

export enum UserRole {
    Admin = 'admin',
    Manager = 'manager',
    Sales = 'sales',
    Telesales = 'telesales',
    ProjectManager = 'pm',
    Finance = 'finance',
}

export interface Role {
  id: UserRole;
  name: string;
  permissions: Permissions;
}

export interface Permissions {
  dashboard: { read: boolean };
  leads: { create: boolean; read: boolean; update: boolean; delete: boolean };
  deals: { create: boolean; read: boolean; update: boolean; delete: boolean };
  projects: { create: boolean; read: boolean; update: boolean; delete: boolean };
  accounts: { create: boolean; read: boolean; update: boolean; delete: boolean };
  financials: { read: boolean };
  invoices: { create: boolean; read: boolean; update: boolean; delete: boolean };
  users: { create: boolean; read: boolean; update: boolean; delete: boolean };
  teams: { create: boolean; read: boolean; update: boolean; delete: boolean };
  settings: { read: boolean };
  reports: { read: boolean };
  calendar: { read: boolean };
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  password?: string; // For create form
  role: UserRole;
  avatarUrl: string;
  targets: {
    monthlyDeals: number;
    monthlyCalls: number;
    monthlyRevenue: number;
  };
  officeLocation: string;
  isActive: boolean;
  scope: string;
  groupId: string | null;
}

export interface Group {
    id: string;
    name: string;
    managerId: string;
    scope: string;
}


export interface Stage {
  id: DealStatus;
  title: string;
}

export type WidgetKey = 'quickStats' | 'projectStatusSummary' | 'analyticsGrid' | 'salesFunnel' | 'projectsStatusChart' | 'recentActivity' | 'upcomingDeadlines';

export interface DashboardPreferences {
    widgets: Record<WidgetKey, boolean>;
    order: WidgetKey[];
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  timestamp: string;
}

export interface ProjectFile {
    name: string;
    size: number;
    type: string;
    content: string; // Base64 data URL
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: Record<string, string>;
}

export type Page = 'dashboard' | 'leads' | 'deals' | 'projects' | 'accounts' | 'financials' | 'users' | 'settings' | 'reports' | 'calendar' | 'teams';

export type ProjectModalTab = 'details' | 'tasks' | 'timeline' | 'files';