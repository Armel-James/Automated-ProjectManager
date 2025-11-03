import { db } from "../firebase/config";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  QuerySnapshot,
  arrayUnion,
} from "firebase/firestore";
import type { Notification, NotificationType } from "../../types/notification";
import { getProjectById } from "./projects";
import { getUserById } from "./user";

const notificationsCollection = (projectId: string) =>
  collection(db, "projects", projectId, "notifications");

export async function addNotification(
  projectId: string,
  notification: Omit<Notification, "id" | "createdAt" | "readBy">
) {
  const docRef = await addDoc(notificationsCollection(projectId), {
    ...notification,
    createdAt: new Date(),
    readBy: [],
  });
  return docRef.id;
}

export function listenToNotifications(
  projectId: string,
  userEmail: string,
  callback: (notifications: Notification[]) => void
) {
  
  const unsubscribe = onSnapshot(
    notificationsCollection(projectId),
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Notification[];
      const filteredNotifications = notifications.filter((notification) => {
        if (notification.isMemberSpecific) {
          return notification.targetMembers?.includes(userEmail);
        } else {
          console.log("This is still on development.");
          return false;
        }
      });
      filteredNotifications.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      callback(filteredNotifications);
    }
  );

  return unsubscribe;
}

export async function markNotificationAsRead(
  projectId: string,
  notificationId: string,
  userEmail: string
) {
  const notificationRef = doc(
    notificationsCollection(projectId),
    notificationId
  );
  return updateDoc(notificationRef, {
    readBy: arrayUnion(userEmail),
  });
}

export async function notifyProjectOwner(projectId: string, message: string, type: NotificationType) {
  const project = await getProjectById(projectId);
  const projectOwner = await getUserById(project?.ownerID!);

  addNotification(projectId, {
    projectId: projectId,
    message: message,
    isMemberSpecific: true,
    targetMembers: [projectOwner?.email || ""],
    type: type,
  });
}

export async function notifyTaskAssignedMembers(projectId: string, message: string, memberEmails: string[], type: NotificationType) {
  addNotification(projectId, {
    projectId: projectId,
    message: message,
    isMemberSpecific: true,
    targetMembers: memberEmails,
    type: type,
  });
}

