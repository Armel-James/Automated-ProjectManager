import { db } from "../firebase/config";
import type { Project } from "../../types/project";
import {
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { CSVItemData } from "../../util/csv";
import { createTasksInBulk } from "./tasks";
import { addDays } from "../../util/date";

const projectsRef = collection(db, "projects");

/* Create a project */
export async function createProject(project: Project, user: any) {
  //const { user } = useAuth();
  if (!user) {
    throw new Error("Invalid Owner of Project");
  }

  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      ownerID: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      taskIndex: 0,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding project");
  }
}

export async function createProjectFromTemplate(
  user: User,
  projectName: string,
  projectDescription: string,
  tasks: CSVItemData[]
) {
  if (!user) {
    throw new Error("Invalid Owner of Project");
  }

  const totalDuration = tasks.reduce((sum, task) => {
    return sum + Number(task.duration);
  }, 0);

  createProject(
    {
      name: projectName,
      description: projectDescription,
      ownerID: user.uid,
      members: [],
      status: "active",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      taskIndex: 0,
      expectedEndDate: addDays(new Date(), totalDuration),
    } as Project,
    user
  ).then((newProjectId) => {
    const structuredTasks = tasks.map((task, index) => ({
      id: String(index),
      name: task.name,
      duration: Number(task.duration),
      notes: task.notes || "",
      startDate: task.startDate || new Date(),
      progress: 0,
      dependency: "",
      order: 0,
      parentId: null,
      assignedMembers: [],
      docId: 0,
    }));

    createTasksInBulk(newProjectId as string, structuredTasks);

    console.log(
      "Created project from template with ID:",
      newProjectId,
      structuredTasks
    );
  });
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
) {
  if (projectId) {
    updateDoc(doc(db, "projects", projectId), {
      ...updates,
      updatedAt: new Date(),
    });
  }
}

/* Get a specific project document*/
export async function getProjectById(projectId: string) {
  const specificProjectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(specificProjectRef);
  const data = projectSnap.data();
  if (projectSnap.exists() && data) {
    return {
      id: projectSnap.id,
      name: data.name,
      description: data.description,
      ownerID: data.ownerID,
      members: data.members ?? [],
      progress: data.progress,
      status: data.status,
      expectedEndDate: (data.expectedEndDate as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Project;
  } else {
    return null;
  }
}

export function onProjectByOwnerSnapshot(
  userId: string | undefined,
  callback: (projects: Project[]) => void
) {
  if (!userId) {
    console.log("Error: User is not logged in");
    return;
  }

  const q = query(projectsRef, where("ownerID", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        ownerID: data.ownerID,
        members: data.members ?? [],
        progress: data.progress,
        status: data.status,
        expectedEndDate: (data.expectedEndDate as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
        taskIndex: data.taskIndex,
      } as Project;
    });
    callback(projects);
  });
}

/* Get all projects of a specified user */
export async function getProjectsByOwner(userId: string | undefined) {
  if (!userId) {
    console.log("Error: User is not logged in");
    return;
  }

  const q = query(projectsRef, where("ownerID", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      ownerID: data.ownerID,
      members: data.members ?? [],
      progress: data.progress,
      status: data.status,
      expectedEndDate: (data.expectedEndDate as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      taskIndex: data.taskIndex,
    } as Project;
  });
}

// Delete Project
export async function deleteProject(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  await deleteDoc(projectRef);
}

// Last task ID
export async function getTaskIndex(projectId: string) {
  const projectRef = doc(db, "projects", projectId);
  const snap = await getDoc(projectRef);

  if (snap.exists()) {
    return snap.get("taskIndex");
  } else {
    return null;
  }
}

export async function incTaskIndex(projectId: string, lastTaskId: number) {
  if (projectId) {
    updateDoc(doc(db, "projects", projectId), {
      taskIndex: lastTaskId + 1,
      updatedAt: new Date(),
    });
  }
}

export function onProjectsByMemberEmailSnapshot(
  userEmail: string,
  callback: (projects: Project[]) => void
) {
  const q = query(
    collection(db, "projects"),
    where("members", "array-contains", userEmail)
  );
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        ownerID: data.ownerID,
        members: data.members ?? [],
        progress: data.progress,
        status: data.status,
        expectedEndDate: data.expectedEndDate
          ? (data.expectedEndDate as Timestamp).toDate()
          : undefined,
        createdAt: data.createdAt
          ? (data.createdAt as Timestamp).toDate()
          : undefined,
        updatedAt: data.updatedAt
          ? (data.updatedAt as Timestamp).toDate()
          : undefined,
        taskIndex: data.taskIndex,
      } as Project;
    });
    callback(projects);
  });
}

export function onProjectSnapshot(
  projectId: string,
  callback: (project: Project | null) => void
) {
  const specificProjectRef = doc(db, "projects", projectId);
  return onSnapshot(specificProjectRef, (projectSnap) => {
    const data = projectSnap.data();
    if (projectSnap.exists() && data) {
      callback({
        id: projectSnap.id,
        name: data.name,
        description: data.description,
        ownerID: data.ownerID,
        members: data.members ?? [],
        progress: data.progress,
        status: data.status,
        expectedEndDate: data.expectedEndDate
          ? (data.expectedEndDate as Timestamp).toDate()
          : undefined,
        createdAt: data.createdAt
          ? (data.createdAt as Timestamp).toDate()
          : undefined,
        updatedAt: data.updatedAt
          ? (data.updatedAt as Timestamp).toDate()
          : undefined,
      } as Project);
    } else {
      callback(null);
    }
  });
}
