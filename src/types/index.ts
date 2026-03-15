// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string;
  role: 'MEMBER' | 'ADMIN' | 'DISTRICT_ADMIN';
  employeeId: string;
  requiresPinChange: boolean;
}

export interface AuthUser {
  userId: string;
  role: string;
  employeeId: string;
  requiresPinChange: boolean;
}

// ─── Member ──────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  fullName: string;
  mobileNo?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  currentAddress?: Record<string, string>;
  permanentAddress?: Record<string, string>;
  createdAt: string;
  // relations (as returned by the API)
  designation?: { id: string; name: string };
  district?: { id: string; name: string };
  employer?: { id: string; name: string; shortName: string };
  workUnit?: { id: string; name: string; unitType: string };
  user?: { employeeId: string; email: string; role: string; lastLoginAt: string };
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
  author?: { fullName: string };
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
