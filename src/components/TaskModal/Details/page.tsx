import { useEffect, useState } from "react";
import type { Task } from "../../../types/task";
import {
  listenToTask,
  updateTask,
  updateTaskProgress,
} from "../../../services/firestore/tasks";
import { addDays, daysLeft, formatDate } from "../../../util/date";
import type { GanttMember, Member } from "../../../types/member";
import { listenToProjectMembers } from "../../../services/firestore/projectmember";

interface TaskDetailsPageProps {
  task: Task;
  projectId: string;
}

export default function TaskDetailsPage({
  task,
  projectId,
}: TaskDetailsPageProps) {
  const [progress, setProgress] = useState(50);
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  const [daysLeftCount, setDaysLeftCount] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribeTask = listenToTask(projectId, task.docId, setCurrentTask);
    const unsubscribeMembers = listenToProjectMembers(projectId, setMembers);

    return () => {
      unsubscribeTask();
      unsubscribeMembers();
    };
  }, [task]);

  useEffect(() => {
    console.log("Members: ", members);
  }, [members]);

  useEffect(() => {
    if (currentTask) {
      setProgress(currentTask.progress);

      if (currentTask) {
        if (currentTask?.startDate instanceof Date) {
          setDaysLeftCount(
            daysLeft(addDays(currentTask?.startDate, currentTask?.duration))
          );
        }
      }
      console.log("Assigned Members: ", currentTask.assignedResource);
      //   currentTask.assignedMembers?.forEach((id, teamName, unit) => {
      //     console.log(id, teamName, unit);
      //   });
    }
  }, [currentTask]);

  return (
    <div className="p-2 bg-white rounded-2xl overflow-y-auto max-h-[400px]">
      <h2 className="text-xl font-bold text-[#0f6cbd] mb-4 tracking-tight">
        Task Details
      </h2>
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">
          Progress
        </label>
        <div className="flex items-center gap-3 w-full min-w-[400px]">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-64 accent-[#0f6cbd] flex-shrink-0"
          />
          <span className="text-sm font-semibold text-[#0f6cbd] w-12 text-right block">
            {progress}%
          </span>
          <button
            className="ml-4 px-4 py-2 bg-white text-[#0f6cbd] font-semibold rounded-lg border border-[#0f6cbd] shadow hover:bg-[#e6f0fa] transition flex-shrink-0"
            onClick={() => {
              setProgress(progress);
              updateTaskProgress(projectId, task.docId, progress);
            }}
          >
            Update
          </button>
          <button
            className="ml-2 px-4 py-2 bg-[#0f6cbd] text-white font-semibold rounded-lg shadow hover:bg-[#155fa0] transition flex-shrink-0"
            onClick={() => {
              setProgress(100);
              updateTaskProgress(projectId, task.docId, 100);
              console.log("Task approved:", task.docId);
            }}
          >
            Approve
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Start date:</span>
          <span className="text-gray-500">
            {task?.startDate instanceof Date
              ? formatDate(task?.startDate)
              : "invalid data object"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">End date:</span>
          <span className="text-gray-500">
            {task?.startDate instanceof Date
              ? formatDate(addDays(task.startDate, task.duration))
              : "invalid data object"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Duration:</span>
          <span className="text-gray-500">{task?.duration} days</span>
        </div>

        {currentTask?.progress != 100 && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Days Left:</span>
            <span
              className={
                daysLeftCount !== null && daysLeftCount < 0
                  ? "text-red-600 font-semibold"
                  : "text-gray-500"
              }
            >
              {daysLeftCount !== null && daysLeftCount < 0
                ? daysLeftCount * -1 + " days (overdue)"
                : daysLeftCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 mt-4">
        <span className="font-medium text-gray-700">Description:</span>
        <span className="text-gray-500 whitespace-pre-line">
          {task?.notes || "No description available"}
        </span>
      </div>

      <div className="flex items-start gap-2 mt-4">
        <span className="font-medium text-gray-700">Assigned Members:</span>
        <ul className="text-gray-500 list-none pl-0">
          {members &&
            currentTask?.assignedResource?.map((member) => {
              const foundMember: GanttMember | undefined = members.find(
                (m) => m.id === member.id
              ) as GanttMember | undefined;
              return (
                <li key={member.id}>
                  {foundMember
                    ? foundMember.name + " - " + foundMember.role
                    : "Unknown Member"}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
