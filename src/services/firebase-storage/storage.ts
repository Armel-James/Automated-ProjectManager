// src/services/storageService.js
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import type { FileUpload } from "../../types/fileupload";
import type { User } from "firebase/auth";
import { addUploadRecord } from "../firestore/files";

/**
 * Uploads a file to Firebase Storage with optional progress tracking.
 * @param {File} file - The file to upload.
 * @param {string} path - The storage path (e.g. "projects/123/attachments").
 * @param {function} [onProgress] - Optional callback for progress updates (0–100).
 * @returns {Promise<string>} - The file's public download URL.
 */
export function uploadFile(
  user: User,
  file: any,
  projectId: string,
  taskId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `${Date.now()}-${file.name}`;

    const fileRef = ref(
      storage,
      `projects/${projectId}/tasks/${taskId}/uploads/${uniqueFileName}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);
    // const { uid, email, displayName } = user;

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);

        const newUpload: FileUpload = {
          fileName: uniqueFileName,
          downloadURL: url,
          uploadedBy: {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          },
          uploadedAt: new Date(),
        };
        addUploadRecord(newUpload, projectId, taskId);
      }
    );
  });
}
