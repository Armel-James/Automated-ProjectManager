import { useEffect, useState } from "react";
import type { FileUpload } from "../types/fileupload";
import ProgressBar from "./progress-bar";
import { getAuth } from "firebase/auth";
import { FaFileAlt, FaTrashAlt } from "react-icons/fa";
import { deleteUploadRecord } from "../services/firestore/files";
import { deleteFile } from "../services/firebase-storage/storage";
import Modal from "./modal";

interface FileItemProps {
  taskId: string;
  projectId: string;
  file: FileUpload;
  index: number;
}

export default function FileItem({
  taskId,
  projectId,
  file,
  index,
}: FileItemProps) {
  const currentUser = getAuth().currentUser;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  function handleDelete() {
    if (!file.id) return;

    deleteFile(file, projectId, taskId);
    setIsDeleteModalOpen(false); // Close the modal after deletion
  }

  useEffect(() => {}, [file]);

  return (
    <>
      <li className="flex items-center justify-between bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-lg">
            <FaFileAlt className="text-blue-600 text-xl" />
          </div>
          <div className="flex flex-col w-64">
            <a
              className="text-sm text-gray-900 font-semibold truncate hover:text-blue-600 w-100 hover:underline"
              href={file.downloadURL}
              title={file.fileName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.fileName}
            </a>
            <span className="text-xs text-gray-600">
              Uploaded by:{" "}
              {file.uploadedBy.displayName || file.uploadedBy.email}
            </span>
            <span className="text-xs text-gray-500">
              {file.uploadedAt.toLocaleString()}
            </span>
          </div>
        </div>
        {currentUser && currentUser.uid === file.uploadedBy.uid && (
          <button
            className="flex items-center gap-2 text-red-500 text-sm font-medium hover:underline hover:text-red-700 transition"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <FaTrashAlt className="text-red-500 text-base" />
            Delete
          </button>
        )}
      </li>

      {isDeleteModalOpen && (
        <Modal
          open={isDeleteModalOpen}
          title="Confirm Deletion"
          onClose={() => setIsDeleteModalOpen(false)}
          setIsOpen={setIsDeleteModalOpen}
          onConfirm={handleDelete}
          isViewOnly={false}
          isDelete={true}
        >
          <p>
            Are you sure you want to delete this file? This action cannot be
            undone.
          </p>
        </Modal>
      )}
    </>
  );
}
