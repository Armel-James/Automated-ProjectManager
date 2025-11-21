import type { Task } from "../../../types/task";

const sampleTasks: Task[] = [
  {
    id: "1",
    name: "Task 1",
    startDate: new Date("2025-10-01"),
    duration: 5,
    progress: 50,
    parentId: undefined, // Updated to match the expected type
    dependency: null,
    notes: "This is the first task.",
    order: 0,
    docId: "doc1",
    assignedResource: [],
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
  },
  {
    id: "2",
    name: "Task 2",
    startDate: new Date("2025-10-06"),
    duration: 3,
    progress: 20,
    parentId: "1",
    dependency: "1",
    notes: "This is a subtask of Task 1.",
    order: 1,
    docId: "doc2",
    assignedResource: [],
    createdAt: new Date("2025-10-06"),
    updatedAt: new Date("2025-10-06"),
  },
  {
    id: "3",
    name: "Task 3",
    startDate: new Date("2025-10-10"),
    duration: 7,
    progress: 0,
    parentId: undefined, // Updated to match the expected type
    dependency: null,
    notes: "This is an independent task.",
    order: 2,
    docId: "doc3",
    assignedResource: [],
    createdAt: new Date("2025-10-10"),
    updatedAt: new Date("2025-10-10"),
  },
];

export default sampleTasks;
