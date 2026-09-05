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
  [key: string]: unknown;
  id: number;
  name: string;
  description: string | null;
  permissions: number[];
}

export interface groupData {
    [key: string]: unknown;

    id: number;
    name?: string;

    manager?: {
        id: number;
        username: string;
        name: string;
    } | null;
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
  uploaded_at?: string;
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
  target_date: string;
  assigned_to_name?: string | null;
  creator_name?: string;
  creator?: number;
  assigned_to: number | "";
  logs?: TicketLog[];
  latestAcceptedLog?: TicketLog | null;
  display_status?: string;
  status?: string;
  created_at?: string;
  created_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  act_hours?: number;
  rating?: number;
  latest_logremarks?: string;
  work_efficiency?: number | string;
  schedule_efficiency?: number | string;
  files?: TicketFile[] | null;
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


// =========================================================
// Submission Types
// =========================================================

export interface TaskEntry {
  [date: string]: number | string;
}

 export interface AssignedTask {
  assign_id: number;
  assign_by: string | null;
  name: string;
  entries: TaskEntry;
}

export interface Milestone {
  id: number;
  name: string;
  assigned_tasks: AssignedTask[];
}

export interface SubmissionProject {
  id: number;
  code: string;
  quotation_id: number;
  description:string,
  milestones: Milestone[];
}


export interface ERPQuotation {
  [key: string]: unknown;
  id: number;
  quotation_no: string;
  revision_number: number;
  sale_type: string;
  status: string;
  create_date: string;
  customer_name: string;
  custom_project_name: string | null;
  system_name: string | null;
  project__name?: string | null;
}
export interface permissionData {
  [key: string]: unknown;
  id: number;
  name: string;
  codename: string;
  app_label?: string;
  model?: string;
}



export interface timesheetStatusData {
    id: number;
    uid: string;
    first_name: string;
    timesheet_status: string;
    weeknumber: number;
    submission_status: boolean;
    action_status: boolean;
    weekyear: number;
    created_date: string;
    unlock_reason: string;
    unlock_status: string | null;
    updated_date: string;
    comments: string | null;
}

export interface ApprovalRow {
  [key: string]: unknown;

  id: number;
  name: string;
  reporting_to: string;
  hours: number;
  overview: "Submitted" | "Accepted" | "Rejected" | "Requested" | "Unlocked" | "Not Submitted" | "Unlock Rejected";
  submission_status: "OnTime" | "Delayed" | `Due by ${string}`;
  action_status: "OnTime" | "Delayed" | "Pending" | `Due by ${string}`;
  approval_status?: "OnTime" | "Delayed" | "Pending" | `Due by ${string}`;
}

export interface ApiTaskRow {
    id: number;

    projectId: number;

    project: string;

    task: string;

    budgetOwner: string;

    hours: string[];

    rating: string | number;

    status: string;

    approvedStatus?: boolean;

    rejectionReason?: string | null;
}

export interface TaskRow {
    [key: string]: unknown;

    id: number;

    projectId: number;

    project: string;

    task: string;

    budgetOwner: string;

    hours: string[];

    rating: string;

    status: string;

    rowType:
        | "project"
        | "milestone";

    approvedStatus?: boolean;

    rejectionReason?: string | null;
}
