// Formatted member that is used for ui
export interface Member {
  id: string;
  name: string;
  roles: string[];
  emailAddress: string;
  phoneNumber: string;
  teamName?: string;
  level: "Leader" | "Member";
  unit?: number; // Optional unit property
}

export interface ProjectMember {
  employeeId: string;
  roles: string[];
  teamId: string;
  level: "Leader" | "Member";
  emailAddress: string;
}

export interface GanttMember {
  id: string;
  name: string;
  unit: number; // Allocation percentage (0-100)
  role: string;
  teamName?: string;
}
