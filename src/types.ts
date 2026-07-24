export type CaseStatus = 'completed' | 'in_progress' | 'pending' | 'repeat_requested';

export type PriorityLevel = 'routine' | 'urgent';

export interface PathologyCase {
  id: string;
  caseNumber: string; // e.g., "M983"
  patientInitials?: string; // e.g., "A.K."
  tissueSource: string; // e.g., "Akciğer Biyopsisi"
  tests: string[]; // e.g., ["ALK", "ROS1", "PD-L1"]
  completedTests?: string[]; // e.g., ["ALK", "ROS1"]
  doctorName: string; // e.g., "Dr. Ahmet Yılmaz"
  department: string; // e.g., "Tıbbi Onkoloji"
  status: CaseStatus;
  priority: PriorityLevel;
  createdAt: string; // ISO date string or YYYY-MM-DD HH:mm
  completedAt?: string; // ISO date string or YYYY-MM-DD HH:mm
  technicianNotes?: string;
  blockNumber?: string; // e.g., "Blok C-1"
  weekNumber: number; // e.g., 30
  year: number; // e.g., 2026
}

export interface NotificationLog {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'completed' | 'updated' | 'urgent';
  doctorName?: string;
}

export interface FilterState {
  searchQuery: string;
  statusFilter: string;
  doctorFilter: string;
  departmentFilter: string;
  testFilter: string;
  timeRange: 'all' | 'this_week' | 'today' | 'last_week';
}
