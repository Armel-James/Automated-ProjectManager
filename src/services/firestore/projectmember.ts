import { db } from "../firebase/config";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  QuerySnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { Member, ProjectMember } from "../../types/member";
import type { GanttMember } from "../../types/member";
import type { Notification } from "../../types/notification";
import { addNotification } from "./notifications";
import { NotificationType } from "../../types/notification";
import { getProjectById } from "./projects";

const membersCollection = (projectId: string) =>
  collection(db, `projects/${projectId}/members`);

export async function addProjectMember(
  projectMember: ProjectMember,
  projectId: string
): Promise<string> {
  try {
    const memberRef = doc(
      db,
      `projects/${projectId}/projectmembers`,
      projectMember.employeeId
    );
    await setDoc(memberRef, projectMember);

    getProjectById(projectId).then((project) => {
      addNotification(projectId, {
        projectId: projectId,
        message: `${projectMember.employeeId} has been added as a member to the project ${project?.name} as a ${projectMember.level}.`,
        type: NotificationType.MemberAdded,
        isMemberSpecific: true,
        targetMembers: [projectMember.emailAddress],
      } as Notification);
    });

    return memberRef.id;
  } catch (e) {
    console.error("Error creating project member:", e);
    throw e;
  }
}

export function listenToProjectMembers(
  projectId: string,
  callback: (members: ProjectMember[]) => void
) {
  const membersRef = collection(db, `projects/${projectId}/projectmembers`);
  return onSnapshot(membersRef, (snapshot) => {
    const members: ProjectMember[] = [];
    snapshot.forEach((doc) => {
      members.push(doc.data() as ProjectMember);
    });
    callback(members);
  });
}

export async function updateProjectMember(
  projectId: string,
  employeeId: string,
  updatedData: Partial<ProjectMember>
): Promise<void> {
  const memberRef = doc(db, `projects/${projectId}/projectmembers`, employeeId);
  console.log("Updating project member:", employeeId, updatedData);
  try {
    await updateDoc(memberRef, updatedData);
  } catch (e) {
    console.error("Error updating project member:", e);
    throw e;
  }
}
