export interface GanttResource {
  id: string;
  name: string;
  group: "Tool" | "Manpower" | "Materials" | "Equipment";
  unit: number;
  roles?: string[];
  email?: string;
}
