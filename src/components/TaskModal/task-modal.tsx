import Modal from "../modal";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import TaskDetailsPage from "./Details/page";
import TaskCommentsPage from "./Comments/page";
import type { Task } from "../../types/task";
import TaskUploadsPage from "./Uploads/page";

interface TaskModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  task: Task;
  projectId: string;
}

export default function TaskModal({
  isOpen,
  setIsOpen,
  onClose,
  task,
  projectId,
}: TaskModalProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "comments" | "uploads"
  >("details");

  useEffect(() => {
    console.log("TaskModal opened for task:", task);
  }, [task]);

  return (
    <Modal
      open={isOpen}
      setIsOpen={setIsOpen}
      onClose={onClose}
      onConfirm={() => {}}
      title={task.name}
      isViewOnly={true}
    >
      <div className="w-[700px] flex h-[400px]">
        <div className="flex flex-col w-40 border-r pr-2 mr-4 gap-1">
          <button
            className={`px-4 py-2 text-left font-semibold rounded-lg transition border-l-4 ${
              activeTab === "details"
                ? "border-[#0f6cbd] bg-[#e6f0fa] text-[#0f6cbd]"
                : "border-transparent text-gray-500 hover:bg-[#e6f0fa] hover:text-[#0f6cbd]"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 text-left font-semibold rounded-lg transition border-l-4 ${
              activeTab === "comments"
                ? "border-[#0f6cbd] bg-[#e6f0fa] text-[#0f6cbd]"
                : "border-transparent text-gray-500 hover:bg-[#e6f0fa] hover:text-[#0f6cbd]"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </button>
          <button
            className={`px-4 py-2 text-left font-semibold rounded-lg transition border-l-4 ${
              activeTab === "uploads"
                ? "border-[#0f6cbd] bg-[#e6f0fa] text-[#0f6cbd]"
                : "border-transparent text-gray-500 hover:bg-[#e6f0fa] hover:text-[#0f6cbd]"
            }`}
            onClick={() => setActiveTab("uploads")}
          >
            Uploads
          </button>
        </div>
        <div className="flex-1 pl-2">
          {activeTab === "details" && (
            <div>
              {/* Details content here */}
              <TaskDetailsPage task={task} projectId={projectId} />
            </div>
          )}
          {activeTab === "comments" && (
            <div>
              {/* Comments content here */}
              <TaskCommentsPage
                projectId={projectId}
                taskId={String(task.docId)}
              />
            </div>
          )}
          {activeTab === "uploads" && (
            <div>
              {/* Uploads content here */}
              <TaskUploadsPage
                projectId={projectId}
                taskId={String(task.docId)}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
