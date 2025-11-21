import type { Task } from "../../types/task";
import { db } from "../firebase/config";
import { CoreTaskFields } from "../../types/task";
import type { CoreTaskFieldsType } from "../../types/task";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  limit,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { getProjectById, getTaskIndex, incTaskIndex } from "./projects";
import type { GanttMember, Member } from "../../types/member";
import { addNotification, notifyProjectOwner } from "./notifications";
import { NotificationType } from "../../types/notification";
import { getUserById } from "./user";
import type { OtherResource } from "../../types/other-resource";
import type { GanttResource } from "../../types/resource";

export async function createTask(projectId: string, newTask: Task) {
  try {
    // use project taskindex here
    const newTaskId = await getTaskIndex(projectId);

    const tasksRef = doc(db, "projects", projectId, "tasks", String(newTaskId));
    await setDoc(tasksRef, {
      ...newTask,
      docId: newTaskId,
    });

    // increment project taskindex
    incTaskIndex(projectId, newTaskId);
  } catch (e) {
    console.log(e);
  }
}

export async function getAllTasks(projectId: string) {
  const tasksCol = collection(db, "projects", projectId, "tasks");
  const tasksSnapshot = await getDocs(tasksCol);
  const tasks = tasksSnapshot.docs.map((doc) => {
    const docData = doc.data();
    return {
      id: doc.id,
      docId: Number(doc.id),
      ...docData,
      startDate: docData.startDate.toDate(),
    };
  });
  return tasks as Task[];
}

export function listenToTask(
  projectId: string,
  taskId: string,
  callback: (task: Task | null) => void
) {
  const taskDoc = doc(db, "projects", projectId, "tasks", String(taskId));
  return onSnapshot(taskDoc, (doc) => {
    const docData = doc.data();
    const task = doc.exists()
      ? ({
          id: doc.id,
          docId: Number(doc.id),
          ...docData,
          startDate: docData?.startDate?.toDate?.() || new Date(),
        } as Task)
      : null;
    callback(task);
  });
}

export function listenToTasks(
  projectId: string,
  callback: (tasks: Task[]) => void,
  loadedCallback?: (loaded: boolean) => void
) {
  const tasksCol = collection(db, "projects", projectId, "tasks");
  return onSnapshot(tasksCol, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        docId: Number(doc.id),
        ...docData,
        startDate: docData.startDate?.toDate?.() || new Date(),
      } as Task;
    });
    tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    callback(tasks as Task[]);

    if (loadedCallback) loadedCallback(true);
  });
}
export function getCriticalPath(
  projectId: string,
  callback: (tasks: number) => void
) {
  const tasksCol = doc(db, "projects", projectId);
  return onSnapshot(tasksCol, (snapshot) => {
    const tasks = snapshot.data()?.critical || 0;
    getCriticalTasks = tasks;
    callback(tasks);
  });
}
export let getCriticalTasks = 0;

export function getActiveTasks(
  projectId: string,
  callback: (tasks: number) => void
) {
  const todayDate = new Date().valueOf();

  const tasksRef = collection(db, "projects", projectId, "tasks");
  let a = 0;
  return onSnapshot(tasksRef, (snapshot) => {
    snapshot.forEach((doc) => {
      const endDate = new Date(doc.data().startDate.toDate().toDateString());
      endDate.setDate(
        endDate.getDate() +
          // (doc.data().duration != 0 ? doc.data().duration - 1 : 0)
          doc.data().duration
      );
      const endDateStr = endDate.valueOf();
      if (
        !snapshot.empty &&
        todayDate >= doc.data().startDate.toDate().valueOf() &&
        todayDate <= endDateStr
      ) {
        a++;
      } else {
        callback(0);
      }
    });
    callback(a);
  });
}

export function getProjectStart(
  projectId: string,
  callback: (startDate: Date) => void
) {
  const tasksRef = collection(db, "projects", projectId, "tasks");
  const q = query(tasksRef, orderBy("startDate", "asc"), limit(1));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const startDate = doc.data()?.startDate?.toDate?.() || new Date();
      callback(startDate);
    } else {
      callback(new Date()); // fallback if no tasks
    }
  });
}

export function getProjectEnd(
  projectId: string,
  callback: (startDate: Date) => void
) {
  const tasksRef = collection(db, "projects", projectId, "tasks");
  const q = query(tasksRef, orderBy("startDate", "desc"), limit(1));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const startDate: Date = data?.startDate?.toDate?.() || new Date();
      const duration: number = data?.duration || 0;

      // 🔹 Compute end date by adding duration (in days)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (duration != 0 ? duration - 1 : 0));

      callback(endDate);
    } else {
      callback(new Date()); // fallback if no tasks
    }
  });
}

export function listenToTaskByTeam(
  projectId: string,
  teamName: string,
  callback: (tasks: Task[]) => void
) {
  const tasksCol = collection(db, "projects", projectId, "tasks");
  return onSnapshot(tasksCol, (snapshot) => {
    const tasks = snapshot.docs
      .map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          docId: Number(doc.id),
          ...docData,
          startDate: new Date(docData.startDate?.toDate?.()),
        } as Task;
      })
      .filter((task) => {
        return task.assignedResource?.some((member) => {
          const memberNow = member;
          return memberNow.teamName === teamName;
        });
      });
    callback(tasks as Task[]);
  });
}

export function listenToTasksByAssignedMember(
  projectId: string,
  memberId: string,
  callback: (tasks: Task[]) => void,
  loadedCallback?: (loaded: boolean) => void
) {
  const tasksCol = collection(db, "projects", projectId, "tasks");
  return onSnapshot(tasksCol, (snapshot) => {
    const tasks = snapshot.docs
      .map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          docId: Number(doc.id),
          ...docData,
          startDate: docData.startDate?.toDate?.() || new Date(),
          assignedResource:
            docData.assignedMembers?.map((id: string) => ({
              id,
            })) || [],
        } as Task;
      })
      .filter((task) => {
        //console.log("Checking task:", task.assignedMembers?.[0].id.id);
        return task.assignedResource?.some((member) => {
          //console.log("Comparing member:", member.id.id, "with", memberId);
          // make sure to fix this in the future with proper typing
          const memberNow: any = member;
          return memberNow.id.id === memberId;
        });
      });
    //console.log("All tasks:", tasks);
    callback(tasks as Task[]);

    if (loadedCallback) loadedCallback(true);
  });
}

export async function deleteTask(
  projectId: string,
  taskId: string,
  members: Member[]
) {
  const task = await getTaskById(projectId, taskId);

  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await deleteDoc(docRef);

  await addNotification(projectId, {
    projectId: projectId,
    message: `The task "${task?.name}" assigned to you has been deleted.`,
    type: NotificationType.TaskDeleted,
    isMemberSpecific: true,
    targetMembers:
      task?.assignedResource
        ?.map(
          (member) =>
            members.find(
              (m) => m.id === (typeof member === "string" ? member : member.id)
            )?.emailAddress
        )
        .filter((email): email is string => typeof email === "string") || [],
  });
}

export async function getTaskById(
  projectId: string,
  taskId: string
): Promise<Task | null> {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? ({ id: docSnap.id, ...docSnap.data() } as Task)
    : null;
}

// Update task properties
export async function updateTask(
  projectId: string,
  taskId: string,
  field: CoreTaskFieldsType,
  value: any
) {
  console.log("Updating field:", field, "with value:", value);
  switch (field) {
    case CoreTaskFields.name:
      await updateTaskName(projectId, taskId, value);
      break;
    case CoreTaskFields.duration:
      await updateTaskDuration(projectId, taskId, value);
      break;
    case CoreTaskFields.startDate:
      await updateTaskStartDate(projectId, taskId, value);
      break;
    case CoreTaskFields.dependency:
      await updateTaskDependency(projectId, taskId, value);
      break;
    case CoreTaskFields.progress:
      await updateTaskProgress(projectId, taskId, value);
      break;
    case CoreTaskFields.order:
      await updateTaskOrder(projectId, taskId, value);
      break;
    case CoreTaskFields.notes:
      await updateTaskNotes(projectId, taskId, value);
      break;
    case CoreTaskFields.parentId:
      await updateTaskParentId(projectId, taskId, value);
      break;
    case CoreTaskFields.assignedResource:
      await updateTaskResource(projectId, taskId, value);
      break;
    case CoreTaskFields.critical:
      await updateCriticalTasks(projectId, value);
      break;
    case CoreTaskFields.totalCost:
      console.log("Updating total cost:", value);
      await updateTotalCost(projectId, taskId, value);
      break;
    default:
      console.log("Unknown field received:", field);
  }
}

export async function updateTaskName(
  projectId: string,
  taskId: string,
  newName: string
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    name: newName,
  });
}

export async function updateTaskDuration(
  projectId: string,
  taskId: string,
  newDuration: number
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    duration: newDuration,
  });
}

export async function updateTaskStartDate(
  projectId: string,
  taskId: string,
  newStartDate: Date
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    startDate: newStartDate,
  });
}

export async function updateTaskProgress(
  projectId: string,
  taskId: string,
  newProgress: number
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    progress: newProgress,
  });

  const task = await getTaskById(projectId, taskId);
  if (!task) return;

  notifyProjectOwner(
    projectId,
    `The progress of task ID "${task.name}" has been updated to ${newProgress}%.`,
    NotificationType.TaskUpdated
  );
}

export async function updateTaskDependency(
  projectId: string,
  taskId: string,
  newDependency: string
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    dependency: newDependency,
  });
}

export async function updateTaskParentId(
  projectId: string,
  taskId: string,
  newParentId: number
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    parentId: newParentId,
  });
}

export async function updateTaskNotes(
  projectId: string,
  taskId: string,
  newNotes: string
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    notes: newNotes,
  });
}

export async function updateTaskOrder(
  projectId: string,
  taskId: string,
  order: number
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    order: order,
  });
}

export async function updateTotalCost(
  projectId: string,
  taskId: string,
  totalCost: number
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));
  await updateDoc(docRef, {
    totalCost: totalCost,
  });
}

export async function updateTaskResource(
  projectId: string,
  taskId: string,
  assignedResource: GanttResource[]
) {
  const docRef = doc(db, "projects", projectId, "tasks", String(taskId));

  console.log("Updating task resources:", assignedResource);

  const formattedResources = assignedResource.map((resource) => {
    const resourceData: any = {
      id: resource.id,
      name: resource.name,
      group: resource.group,
      unit: resource.unit,
    };

    if (resource.roles) {
      resourceData.roles = resource.roles;
    }

    if (resource.email) {
      resourceData.email = resource.email;
    }

    return resourceData;
  });

  await updateDoc(docRef, {
    assignedResource: formattedResources,
  });

  if (assignedResource.length === 0) return;

  // const recipients = assignedResource
  //   .map((member) => member.emailAddress)
  //   .join(", ");

  // addNotification(projectId, {
  //   projectId: projectId,
  //   message: `The assigned members for task ID "${taskId}" have been updated. The new members are: ${recipients}.`,
  //   type: NotificationType.TaskAssigned,
  //   isMemberSpecific: true,
  //   targetMembers: assignedMembers.map((member) => member.emailAddress),
  // });
}

export async function updateCriticalTasks(projectId: string, duration: number) {
  const docRef = doc(db, "projects", projectId);
  await updateDoc(docRef, {
    critical: duration,
  });
}

export async function getTaskAssignedMembersEmails(
  projectId: string,
  taskId: string
) {}

export async function createTasksInBulk(projectId: string, tasks: Task[]) {
  try {
    const batch = writeBatch(db);

    for (const task of tasks) {
      const newTaskId = await getTaskIndex(projectId);
      const taskRef = doc(
        db,
        "projects",
        projectId,
        "tasks",
        String(newTaskId)
      );

      batch.set(taskRef, {
        ...task,
        docId: newTaskId,
      });

      // Increment task index for each task
      incTaskIndex(projectId, newTaskId);
    }

    await batch.commit();
  } catch (e) {
    console.error("Error creating tasks in bulk:", e);
  }
}
