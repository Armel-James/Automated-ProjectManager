export interface Member {
  id: string;
  name: string;
  role: string;
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
}

export interface GanttMember {
  id: string;
  name: string;
  unit: number; // Allocation percentage (0-100)
  role: string;
  teamName?: string;
}
