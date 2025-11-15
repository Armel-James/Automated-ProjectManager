import { Timestamp } from "firebase/firestore";
import type { GanttMember } from "./member";

export interface Task {
  id: string;
  name: string;
  startDate: Date | Timestamp;
  notes?: string;
  progress: number;
  duration: number;
  parentId?: string | null;
  dependency: string | null;
  assignedMembers?: GanttMember[] | null;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  order: number;
  docId: number;
}

export const CoreTaskFields: any = {
  docId: "docId",
  name: "name",
  duration: "duration",
  startDate: "startDate",
  dependency: "dependency",
  progress: "progress",
  order: "order",
  notes: "notes",
  parentId: "parentId",
  assignedMembers: "assignedMembers",
} as const;

export type CoreTaskFieldsType =
  (typeof CoreTaskFields)[keyof typeof CoreTaskFields];
