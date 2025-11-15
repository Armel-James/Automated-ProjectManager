export interface Project {
  id?: string;
  name: string;
  description: string;
  ownerID: string;
  members?: string[];
  progress: number;
  status: "active" | "completed" | "on-hold";
  startDate?: Date;
  expectedEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  taskIndex: number;
  projectRoles?: string[];
}
