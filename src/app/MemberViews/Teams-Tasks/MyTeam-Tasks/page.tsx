import { useEffect, useState } from "react";
import type { Task } from "../../../../types/task";
import TaskItemLeader from "../../../../components/tl-task-item";
import TaskModal from "../../../../components/TaskModal/task-modal";
import { addDays } from "../../../../util/date";

interface MyTeamTasksProps {
  tasks: Task[];
  projectId: string;
}

export default function MyTeamTasks({ tasks, projectId }: MyTeamTasksProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [totalProgress, setTotalProgress] = useState<number>(0);

  function handleTaskItemClick(task: Task) {
    setSelectedTask(task);
    setIsModalOpen(true);
  }

  useEffect(() => {
    // Calculate total progress whenever tasks change
    if (tasks.length > 0) {
      const progress = Math.round(
        tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
      );
      setTotalProgress(progress);
    } else {
      setTotalProgress(0);
    }
  }, [tasks]);

  return (
    <>
      {/* Total Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-[#0f6cbd] text-lg">
            Total Progress
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {/* {totalProgress}% */}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-[#e6f0fa]">
          <div
            className={`h-full rounded-full ${
              totalProgress === 100
                ? "bg-gradient-to-r from-green-400 to-green-600"
                : totalProgress >= 70
                ? "bg-gradient-to-r from-blue-400 to-blue-600"
                : "bg-gradient-to-r from-yellow-300 to-yellow-500"
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>
      {/* Filters and Search */}
      {/* Sort Buttons */}
      {/* <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-sm font-semibold text-gray-700">
          Sort by Due Date:
        </span>
        <button
          className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${
            sortOrder === "asc"
              ? "bg-[#e6f0fa] text-[#0f6cbd] border-[#b3d1f7]"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => setSortOrder("asc")}
          title="Sort Ascending"
        >
          Ascending ↑
        </button>
        <button
          className={`px-3 py-1 rounded-lg border text-xs font-semibold transition ${
            sortOrder === "desc"
              ? "bg-[#e6f0fa] text-[#0f6cbd] border-[#b3d1f7]"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => setSortOrder("desc")}
          title="Sort Descending"
        >
          Descending ↓
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select className="border border-[#b3d1f7] rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#0f6cbd]/30">
          <option value="">All Assignees</option>
          <option value="Jane Doe">Jane Doe</option>
          <option value="John Smith">John Smith</option>
          <option value="Alex Lee">Alex Lee</option>
        </select>
        <input
          type="text"
          placeholder="Search tasks..."
          className="border border-[#b3d1f7] rounded px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#0f6cbd]/30 flex-1 min-w-[200px]"
        />
      </div> */}
      {/* Card Layout for Tasks */}
      <div className="overflow-x-auto rounded-2xl shadow-xl border border-[#e6f0fa] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f7fafd] text-[#0f6cbd]">
            <tr>
              <th className="px-6 py-4 text-left font-semibold rounded-tl-2xl">
                Task
              </th>
              <th className="px-6 py-4 text-left font-semibold">ID</th>
              <th className="px-6 py-4 text-left font-semibold">Start Date</th>
              <th className="px-6 py-4 text-left font-semibold">Due Date</th>
              <th className="px-6 py-4 text-left font-semibold">Duration</th>
              <th className="px-6 py-4 text-left font-semibold">Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <TaskItemLeader
                key={task.docId}
                task={task}
                idx={idx}
                onClick={() => handleTaskItemClick(task)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selectedTask && (
        <TaskModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            selectedTask && setSelectedTask(null);
          }}
          projectId={projectId}
          task={selectedTask}
        />
      )}
    </>
  );
}
