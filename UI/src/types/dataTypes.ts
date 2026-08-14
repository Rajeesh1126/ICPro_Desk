export interface UsersData {
  [key: string]: unknown;
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role?: string;
  role_permissions?: string[];
  department: string[];
  groups?: string[];
  reporting_to?: string;
  location?: string;
  dept_role?: boolean | false;
  exe_role?: boolean | false;
  designation?: string;
  resign_date?: string | null;
}

export interface UsersFormData {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  role?: string;
  department?: string[];
  groups?: string[];
  reporting_to?: string;
  location?: string;
  dept_role?: boolean | false;
  exe_role?: boolean | false;
  designation?: string;
  resign_date?: string | null;
  is_active?: boolean;
}

export interface UserSummary {
  id?: number;
  users_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  group_id?: number;
  group_name?: string;
}

export interface ReportingEmployees {
  id?: number;
  first_name?: string;
}

export interface rolesData {
  id: number;
  name: string;
  description: string | null;
  permissions: any[];
}

export interface groupData {
  [key: string]: unknown;
  id: number;
  name?: string;
}

export interface TicketLog {
  id?: number;
  status: string;
  assigned_to?: number;
  remarks?: string;
  created_at: string;
  updated_at?: string;
  creator_name?: string;
  changed_by_name?: string;
}

export interface TicketFile {
  id?: number;
  file?: string;
  updated_at?: string;
}

export interface TicketData {
  [key: string]: unknown;
  id?: number;
  number: string;
  task: string;
  description: string;
  department?: number | "";
  est_hours?: number;
  priority: string;
  current_status: string;

  log_id?: number;
  target_date: string;
  assigned_to_name: string;
  creator_name?: string;
  creator?: number;
  assigned_to: number | "";
  assigned_to_details?: UserSummary;
  creator_details?: UserSummary;
  logs?: TicketLog[];
  latestAcceptedLog?: TicketLog | null;
  display_status?: string;
  status: string;
  created_at?: string;
  created_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  act_hours?: number;
  rating?: number;
  latest_logremarks?: string;
  work_efficiency?: number | string;
  schedule_efficiency?: number | string;
  full_ticket?: unknown;
  files?: TicketFile[] | null;
  attachments?: TicketFile[] | [] | null;
  department_name?: string;
}

export interface TicketFormData {
  id?: number;
  task: string;
  description: string;
  department?: number | "";
  est_hours?: number;
  current_status?: string;
  priority: string;
  log_id?: number;
  target_date: string;
  assigned_to: number | "";
  files: TicketFile[];   // existing files from API
  newAttachments: File[];      // files selected in browser
  deletedFileIds: number[]; // IDs of files to be deleted
}

export type TicketCollections = {
  all: TicketData[];
  assigned: TicketData[];
  created: TicketData[];
  closed: TicketData[];
  rejected: TicketData[];
  recalled: TicketData[];
};

export type SelfTicketCollections = {
  all: SelfTicketData[];
  self: SelfTicketData[];
  others: SelfTicketData[];
};

export interface SelfTicketLog {
  id: number;
  self_ticket: number;
  comments: string;
  creator: number;
  creator_name?: string;
  created_at: string;
  status?: string;
}

export interface SelfTicketData {
  [key: string]: unknown;
  id?: number;
  number: string;
  task: string;
  description: string;
  est_hours?: number;
  priority: string;
  current_status: string;
  target_date: string;
  creator: number;
  created_at: string;
  type: string;
  ticket_number: string;
  reporting_to: number;
  creator_name?: string;
  reminder_interval?: number | 0;
  comments?: string | "";
  team?: number;
  team_name?: string;
  logs: SelfTicketLog[];
}

export interface SelfTicketFormData {
  id?: number;
  task: string;
  description: string;
  est_hours?: number | 0;
  current_status?: string;
  priority: string;
  target_date: string;
  creator: number | "";
  type: string;
  ticket_number: string;
  reminder_interval?: number | 0;
  comments?: string | "";
}

export type NotificationsType = {
  selfticketOpenCount: number;
  ticketOpenCount: number;
};
