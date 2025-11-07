export interface FileUpload {
  id?: string; // Optional Firestore document ID
  fileName: string; // Name of the uploaded file
  downloadURL: string; // URL to access the uploaded file
  uploadedBy: {
    uid: string; // User ID of the uploader
    email: string; // Email of the uploader
    displayName?: string; // Display name of the uploader (optional)
  };
  uploadedAt: Date; // Timestamp of when the file was uploaded
}
