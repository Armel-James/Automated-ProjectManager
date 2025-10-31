// import React from "react";

import { doc, DocumentReference, getDoc } from "firebase/firestore";
import { getProjectById } from "../../../services/firestore/projects";
import {
  getCriticalPath,
  getCriticalTasks,
  getProjectEnd,
  getProjectStart,
  listenToTasks,
} from "../../../services/firestore/tasks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import React, { useEffect, useState } from "react";
import type { Task } from "../../../types/task";
import type { Project } from "../../../types/project";
import { capitalizeWords } from "../../../util/string-processing";
import { addDays } from "../../../util/date";
// import { CriticalPath } from "@syncfusion/ej2-gantt/src/gantt/actions/critical-path";

// import handleGetCriticalTasks from "../Project/Tasks/page";
// import Task from "../../components/task";
// import { getProjectById } from "../../services/firestore/projects";
// import TasksView  from "../Project/Tasks/page";
// import type { Gantt } from "@syncfusion/ej2-react-gantt";
// import GanttChart from "../../components/gantt-chart";

// interface Task {
//   id: string;
//   name: string;
//   startDate: string;
//   endDate: string;
//   isCritical: boolean;
// }

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-500 h-2 rounded-full"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

interface ReportsManagementProps {
  projectId: string;
  //   tasks: Task[];
}

export default function Reports({ projectId }: ReportsManagementProps) {
  const [getCriticalTasks, setCriticalTasks] = useState(0);
  const [get_ProjectStart, setProjectStart] = useState<Date>();
  const [get_ProjectEnd, setProjectEnd] = useState<Date>();
  const [tasks, setTask] = useState<Task[]>([]);
  const [taskWithoutMilestones, setTaskWithoutMilestones] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [overdueRate, setOverDueRate] = useState<number>(0);

  useEffect(() => {
    // Subscribe to Firestore updates
    const unsubscribe = getCriticalPath(projectId, (tasks) => {
      setCriticalTasks(tasks);
      console.log("Live critical tasks:", tasks);
    });
    const unsubProjectEnd = getProjectEnd(projectId, (startDate) => {
      setProjectEnd(startDate);
      // console.log("Live project start date:", startDate);
    });

    getProjectById(projectId).then((proj) => {
      setProject(proj);
    });

    const unsubProjectStart = getProjectStart(projectId, (startDate) => {
      setProjectStart(startDate);
      // console.log("Live project start date:", startDate);
    });

    const unsubscribeTasks = listenToTasks(projectId, setTask)
    // Cleanup listener on unmount
    return () => {
      unsubscribe(); 
      unsubscribeTasks();
      unsubProjectEnd();
      unsubProjectStart();
    };
  }, [projectId]);

  useEffect(() => {
    const filteredTasks = tasks.filter((task) => task.duration != 0);
    setTaskWithoutMilestones(filteredTasks);
  }, [tasks]);

  useEffect(() => {

    if (taskWithoutMilestones.length === 0) return;

    const totalTasksNumber = taskWithoutMilestones.length;

    let progressAverage = 0;
    taskWithoutMilestones.forEach(element => {
      progressAverage += element.progress;
    });

    setOverallProgress(progressAverage / totalTasksNumber);

    const dateNow = new Date();
    const overdueTasks = taskWithoutMilestones.filter((task) => {
      if (task.startDate instanceof Date) {
      const taskEndDate = addDays(task.startDate, task.duration);

      return taskEndDate < dateNow && task.progress < 100;
      }
    });

    setOverDueRate((overdueTasks.length / totalTasksNumber) * 100);
    
  }, [taskWithoutMilestones]);

  // export default function Reports() {
  //  const criticalPath = new CriticalPath();
  //  const criticalTasks = criticalPath.getCriticalTasks();

  //  console.log("Critical Tasks:", TasksView);
  // console.log(Task.toString());

  const kpis = [
    { title: "Overall Progress", value: 82, unit: "%" },
    { title: "Completed Tasks", value: 46, unit: "of 56" },
    { title: "Active Tasks", value: 7, unit: "in progress" },
    { title: "Critical Path Length", value: getCriticalTasks, unit: "days" },
  ];

  const milestoneData = [
    { name: "Planning", date: "Sep 25, 2025", progress: 100 },
    { name: "Design", date: "Oct 15, 2025", progress: 100 },
    { name: "Development", date: "Oct 28, 2025", progress: 70 },
    { name: "Testing", date: "Nov 10, 2025", progress: 45 },
    { name: "Deployment", date: "Nov 20, 2025", progress: 0 },
  ];

  const chartData = [
    { name: "Week 1", tasks: 8 },
    { name: "Week 2", tasks: 10 },
    { name: "Week 3", tasks: 13 },
    { name: "Week 4", tasks: 9 },
    { name: "Week 5", tasks: 6 },
  ];

  return (
    <div className="w-full px-8 py-6 space-y-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0f6cbd] mb-1 tracking-tight">
          Project Reports
        </h2>
        <p className="text-gray-500 mb-4">Detailed report for your project:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gradient-to-r from-[#e6f0fa] via-white to-[#f7fafd] rounded-xl p-4 border border-[#b3d1f7]">
          <div>
            <span className="text-sm text-gray-500">Project Name</span>
            <div className="font-bold text-[#0f6cbd] text-lg">
              {project?.name}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Start Date</span>
            <div className="font-bold text-gray-700 text-lg">
              {get_ProjectStart?.toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">End Date</span>
            <div className="font-bold text-gray-700 text-lg">
              {get_ProjectEnd?.toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <div className="font-bold text-green-600 text-lg">{project?.status && capitalizeWords(project?.status)}</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tasks Completed</span>
            <div className="font-bold text-blue-600 text-lg">{
              ((taskWithoutMilestones.filter((task) => task.progress === 100).length / taskWithoutMilestones.length) * 100).toFixed(2)
            }%</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Overdue Rate</span>
            <div className="font-bold text-red-600 text-lg">{overdueRate.toFixed(2)}%</div>
          </div>
          <div></div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
            className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start"
          >
            <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
              Overall Progress
            </span>
            <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
              {overallProgress.toFixed(2)}
              <span className="text-base text-gray-500 ml-1">%</span>
            </span>
              <ProgressBar value={Number(((taskWithoutMilestones.filter((task) => task.progress === 100).length / taskWithoutMilestones.length) * 100).toFixed(2))} />
        </div>


        <div
            className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start"
          >
            <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
              Number of Completed Tasks
            </span>
            <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
              {taskWithoutMilestones.filter((task) => task.progress === 100).length}
              <span className="text-base text-gray-500 ml-1">of {taskWithoutMilestones.length}</span>
            </span>
        </div>

        <div
            className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start"
          >
            <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
              Active Tasks
            </span>
            <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
              {taskWithoutMilestones.filter((task) => task.progress !== 100).length}
              <span className="text-base text-gray-500 ml-1">of {taskWithoutMilestones.length}</span>
            </span>
        </div>

        <div
            className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start"
          >
            <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
              Critical Path Length
            </span>
            <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
              {getCriticalTasks}
              <span className="text-base text-gray-500 ml-1">days</span>
            </span>
        </div>
      </div>

      {/* Task Completion Trend Chart */}
      <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-6">
        <h3 className="text-lg font-bold text-[#0f6cbd] mb-4">
          Task Completion Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#0f6cbd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone Summary */}
      <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-6">
        <h3 className="text-lg font-bold text-[#0f6cbd] mb-4">
          Project Milestones Summary
        </h3>
        <div className="space-y-4">
          {milestoneData.map((milestone, index) => (
            <div key={index} className="border-b border-gray-200 pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-700">
                  {milestone.name}
                </span>
                <span className="text-xs text-gray-500">{milestone.date}</span>
              </div>
              <ProgressBar value={milestone.progress} />
              <span className="text-xs text-gray-500 mt-1 block">
                {milestone.progress}% complete
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
