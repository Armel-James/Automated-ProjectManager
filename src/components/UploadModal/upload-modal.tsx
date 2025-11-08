import { useEffect, useState } from "react";
import Modal from "../modal";
import type { FileUpload } from "../../types/fileupload";
import FileItem from "../file-item";
import { getAuth } from "firebase/auth";
import { uploadFile } from "../../services/firebase-storage/storage";
import type { User } from "firebase/auth";
import { listenToUploads } from "../../services/firestore/files";

interface UploadModalProps {
  projectId: string;
  taskId: string;
  onClose: () => void;
  canAddFiles: boolean;
}

export default function UploadModal({
  projectId,
  taskId,
  onClose,
  canAddFiles = true,
}: UploadModalProps) {
  const [uploads, setUploads] = useState<FileUpload[] | null>(null);
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    // Fetch existing uploads for the task from Firestore if needed
    // For now, we initialize with an empty array

    const unsubscribeToUploads = listenToUploads(projectId, taskId, setUploads);

    return () => {
      // Cleanup subscription if needed
      unsubscribeToUploads();
    };
  }, [taskId]);

  useEffect(() => {
    console.log("Current uploads:", uploads);
  }, [uploads]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && currentUser) {
      Array.from(files).forEach((file) => {
        uploadFile(currentUser, file, projectId, taskId).then((url) => {
          console.log(`File uploaded successfully: ${url}`);
        });
      });
    }
  };

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Modal
      open={true}
      title="Manage Task Files"
      onClose={onClose}
      setIsOpen={() => {}}
      onConfirm={handleConfirm}
      isViewOnly={true}
    >
      <div className="flex flex-col gap-4 w-[700px] h-[500px]">
        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-[#0f6cbd]">Task Files</h2>
          {canAddFiles && (
            <div>
              <label
                htmlFor="file-upload"
                className="bg-[#0f6cbd] text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium hover:bg-[#0d5ca8] transition shadow-md"
              >
                + Add Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>

        {!uploads || uploads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No files uploaded</p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-120 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
            {uploads.map((file, index) => (
              <FileItem
                key={index}
                taskId={taskId}
                projectId={projectId}
                file={file}
                index={index}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
