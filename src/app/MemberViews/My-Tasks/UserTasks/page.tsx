import { useEffect, useState } from "react";
import TaskItem from "../../../../components/task-item";
import type { Task } from "../../../../types/task";

interface UserTasksProps {
  tasks: Task[];
  projectId?: string;
}

export default function UserTasks({ tasks, projectId }: UserTasksProps) {
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setCurrentTasks(tasks);
  }, [tasks]);

  return (
    <div className="flex flex-row gap-8">
      {/* Main Task List */}
      <div className="flex-1">
        <ul className="space-y-4">
          {currentTasks.length == 0 ? (
            <span className="text-gray-500">
              "It seems like there are no tasks assigned to you yet."
            </span>
          ) : (
            currentTasks.map((task) => (
              <TaskItem key={task.id} task={task} projectId={projectId} />
            ))
          )}
        </ul>
      </div>
      {/* Filter Options */}
      {/* <aside className="min-w-[220px] max-w-xs bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-4 h-fit self-start">
        <div className="text-lg font-semibold text-[#0f6cbd] mb-2">Filters</div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select className="border border-[#b3d1f7] rounded px-2 py-1 text-sm">
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            className="border border-[#b3d1f7] rounded px-2 py-1 text-sm"
          />
        </div>
        <button className="mt-2 bg-[#0f6cbd] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#095a9d] transition">
          Apply Filters
        </button>
      </aside> */}
    </div>
  );
}
