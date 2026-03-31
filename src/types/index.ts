// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'zonal_officer' | 'rep' | 'member';

export interface LoginResponse {
  accessToken: string;
  roles: UserRole[];
  employeeId: string;
  requiresPinChange: boolean;
}

export interface AuthUser {
  userId: string;
  roles: UserRole[];
  employeeId: string;
  requiresPinChange: boolean;
}

/** Returns true if the user holds at least one of the given roles */
export function hasRole(user: AuthUser | null, ...check: UserRole[]): boolean {
  if (!user) return false;
  return check.some(r => user.roles.includes(r));
}

/** Returns true if the user can manage content (create/edit/delete events, news) */
export function canManageContent(user: AuthUser | null): boolean {
  return hasRole(user, 'admin', 'super_admin', 'zonal_officer');
}

// ─── Member ──────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNo?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  currentAddress?: Record<string, string>;
  permanentAddress?: Record<string, string>;
  createdAt: string;
  // relations (as returned by the API)
  union?: { id: string; name: string; shortName: string };
  designation?: { id: string; name: string };
  district?: { id: string; name: string };
  employer?: { id: string; name: string; shortName: string };
  workUnit?: { id: string; name: string; unitType: string };
  user?: { employeeId: string; email: string; roles: UserRole[]; lastLoginAt: string };
}

// ─── Ticket ──────────────────────────────────────────────────────────────────
export type TicketPriority = 'standard' | 'urgent' | 'critical';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId?: string;
  category?: { id: string; name: string };
  assignedRepId?: string;
  assignedRep?: { id: string; employeeId: string };
  districtId?: string;
  workUnitId?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  author?: { firstName: string; middleName?: string; lastName: string };
}

// ─── News ────────────────────────────────────────────────────────────────────
export interface NewsArticle {
  id: string;
  titleEn: string;
  titleTe?: string;
  bodyEn: string;
  bodyTe?: string;
  published: boolean;
  createdAt: string;
}

// ─── Event ───────────────────────────────────────────────────────────────────
export interface UnionEvent {
  id: string;
  titleEn: string;
  titleTe?: string;
  descriptionEn?: string;
  location?: string;
  eventDate: string;
  published: boolean;
  districtId?: string;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
