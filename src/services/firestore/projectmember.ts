import { db } from "../firebase/config";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import type { ProjectMember } from "../../types/member";
import type { Notification } from "../../types/notification";
import { addNotification } from "./notifications";
import { NotificationType } from "../../types/notification";
import { getProjectById } from "./projects";
import { updateProjectMembersField } from "./projects";
import { getUserEmployees } from "./employees";
import type { Employee } from "../../types/employee";
import type { Project } from "../../types/project";

const membersCollection = (projectId: string) =>
  collection(db, `projects/${projectId}/members`);

export async function addProjectMember(
  projectMember: ProjectMember,
  projectId: string,
  employeeEmail: string
): Promise<string> {
  try {
    const memberRef = doc(
      db,
      `projects/${projectId}/projectmembers`,
      projectMember.employeeId
    );
    await setDoc(memberRef, { ...projectMember, resourceType: "manpower" });

    getProjectById(projectId).then((project) => {
      addNotification(projectId, {
        projectId: projectId,
        message: `${projectMember.employeeId} has been added as a member to the project ${project?.name} as a ${projectMember.level}.`,
        type: NotificationType.MemberAdded,
        isMemberSpecific: true,
        targetMembers: [projectMember.emailAddress],
      } as Notification);

      updateProjectMembersField(projectId, "add", employeeEmail);
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
  try {
    await updateDoc(memberRef, updatedData);
  } catch (e) {
    console.error("Error updating project member:", e);
    throw e;
  }
}

export async function deleteProjectMember(
  projectId: string,
  employeeId: string,
  employeeEmail: string
) {
  const memberRef = doc(db, `projects/${projectId}/projectmembers`, employeeId);

  updateProjectMembersField(projectId, "remove", "", employeeEmail);

  return deleteDoc(memberRef);
}

export async function getProjectMembers(projectId: string) {
  const membersRef = collection(db, `projects/${projectId}/projectmembers`);

  const employeesSnapshot = await getDocs(membersRef);

  // Extract and return the JSON data
  const members = employeesSnapshot.docs.map((doc) => ({
    ...doc.data(), // Spread the document data
  }));

  return members as ProjectMember[]; // Return the array of member objects
}

export async function getMyMemberDataOnProject(
  projectId: string,
  myEmail: string
): Promise<ProjectMember | null> {
  const projectMembers = await getProjectMembers(projectId);

  const myProjectMemberData = projectMembers.find((member: any) => {
    return member.emailAddress.toLowerCase() === myEmail.toLowerCase();
  });

  return myProjectMemberData || null;
}
