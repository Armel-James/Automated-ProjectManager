import type { FileUpload } from "../../types/fileupload";
import { db } from "../firebase/config";
import {
  addDoc,
  onSnapshot,
  collection,
  doc,
  deleteDoc,
} from "firebase/firestore";

export async function addUploadRecord(
  upload: FileUpload,
  projectId: string,
  taskId: string
) {
  try {
    return await addDoc(
      collection(db, `projects/${projectId}/tasks/${taskId}/uploads`),
      {
        ...upload,
      }
    );
  } catch (error) {
    console.error("Error adding upload record:", error);
  }
}

export async function deleteUploadRecord(
  uploadId: string,
  projectId: string,
  taskId: string
) {
  try {
    const docRef = doc(
      db,
      `projects/${projectId}/tasks/${taskId}/uploads`,
      uploadId
    );
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting upload record:", error);
  }
}

export function listenToUploads(
  projectId: string,
  taskId: string,
  callback: (uploads: FileUpload[]) => void
) {
  const unsubscribe = onSnapshot(
    collection(db, `projects/${projectId}/tasks/${taskId}/uploads`),
    (snapshot) => {
      const uploads: FileUpload[] = [];
      snapshot.forEach((doc) => {
        uploads.push({
          id: doc.id,
          ...doc.data(),
          uploadedAt: new Date(
            doc.data().uploadedAt.seconds * 1000 +
              doc.data().uploadedAt.nanoseconds / 1e6
          ),
        } as FileUpload);
      });
      callback(uploads);
    }
  );

  return unsubscribe;
}
