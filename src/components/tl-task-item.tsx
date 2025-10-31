import type { Timestamp } from "firebase/firestore";
import type { Task } from "../types/task";
import { addDays, formatDate, formatDateTime } from "../util/date";
import TaskModal from "./TaskModal/task-modal";
import { useEffect, useState } from "react";

interface TaskItemLeaderProps {
  task: Task;
  idx: number;
  onClick: () => void;
}

export default function TaskItemLeader({
  task,
  idx,
  onClick,
}: TaskItemLeaderProps) {
  function handleClick() {
    onClick();
  }

  return (
    <tr
      key={task.docId}
      className={`transition ${
        idx % 2 === 0 ? "bg-white" : "bg-[#f7fafd]"
      } hover:bg-gray-300 cursor-pointer`}
      onClick={handleClick}
    >
      <td className="px-6 py-4 font-medium text-[#0f6cbd] text-base">
        {task.docId}
        {/* {task.overdue && (
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold border border-red-200">
            Overdue
          </span>
        )} */}
      </td>
      <td className="px-6 py-4 font-medium text-[#0f6cbd] text-base">
        {task.name}
        {/* {task.overdue && (
          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold border border-red-200">
            Overdue
          </span>
        )} */}
      </td>
      <td className="px-6 py-4 text-gray-500">
        {formatDate(task.startDate.toString())}
      </td>
      <td className="px-6 py-4 text-gray-500">{task.startDate instanceof Date ? formatDate(addDays(task.startDate, task.duration)) : ""}</td>
      <td className="px-6 py-4 text-gray-500">{task.duration} days</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-36 h-3 bg-gray-100 rounded-full overflow-hidden border border-[#e6f0fa]">
            <div
              className={`h-full rounded-full ${
                task.progress === 100
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : task.progress >= 70
                  ? "bg-gradient-to-r from-blue-400 to-blue-600"
                  : "bg-gradient-to-r from-yellow-300 to-yellow-500"
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-12 text-right">
            {task.progress}%
          </span>
        </div>
      </td>
    </tr>
  );
}
