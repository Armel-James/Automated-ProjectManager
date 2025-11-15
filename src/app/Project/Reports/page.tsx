// import React from "react";

import { doc, DocumentReference, getDoc } from "firebase/firestore";
import { getProjectById } from "../../../services/firestore/projects";
import {
  getActiveTasks,
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
import React, { useEffect, useState, useRef } from "react";
import type { Task } from "../../../types/task";
import type { Project } from "../../../types/project";
import { capitalizeWords } from "../../../util/string-processing";
import { addDays } from "../../../util/date";
// import { CriticalPath } from "@syncfusion/ej2-gantt/src/gantt/actions/critical-path";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

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
  const [taskWithoutMilestones, setTaskWithoutMilestones] = useState<Task[]>(
    []
  );
  const [project, setProject] = useState<Project | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [overdueRate, setOverDueRate] = useState<number>(0);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [chartData, setChartData] = useState<{ name: string; tasks: number }[]>(
    []
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [get_ActiveTasks, setActiveTasks] = useState(0);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubGetActiveTasks = getActiveTasks(projectId, (tasks) => {
      setActiveTasks(tasks);
    });
    return () => {
      unsubGetActiveTasks();
    };
  }, [projectId]);

  useEffect(() => {
    // Subscribe to Firestore updates
    const unsubscribe = getCriticalPath(projectId, (tasks) => {
      setCriticalTasks(tasks);
    });
    const unsubProjectEnd = getProjectEnd(projectId, (startDate) => {
      setProjectEnd(startDate);
    });

    getProjectById(projectId).then((proj) => {
      setProject(proj);
    });

    const unsubProjectStart = getProjectStart(projectId, (startDate) => {
      setProjectStart(startDate);
    });

    const unsubscribeTasks = listenToTasks(projectId, setTask);
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
    setCurrentTime(new Date());
  }, [tasks]);

  useEffect(() => {
    if (taskWithoutMilestones.length === 0) return;

    const totalTasksNumber = taskWithoutMilestones.length;

    let progressAverage = 0;
    taskWithoutMilestones.forEach((element) => {
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
    setTasksCompleted(
      (taskWithoutMilestones.filter((task) => task.progress === 100).length /
        taskWithoutMilestones.length) *
        100
    );
  }, [taskWithoutMilestones]);

  useEffect(() => {
    if (tasks.length === 0 || !get_ProjectStart) return;

    // Group tasks by week starting from project start date
    const projectStartDate = new Date(get_ProjectStart);
    const tasksByWeek = tasks.reduce<Record<number, number>>((acc, task) => {
      if (task.progress === 100 && task.startDate instanceof Date) {
        const week = getWeekFromProjectStart(task.startDate, projectStartDate); // Helper function to get week number from project start
        acc[week] = (acc[week] || 0) + 1;
      }
      return acc;
    }, {});

    // Convert to chart data format
    const chartData = Object.keys(tasksByWeek).map((week) => ({
      name: `Week ${week}`,
      tasks: tasksByWeek[Number(week)],
    }));

    setChartData(chartData); // Update state for the chart
  }, [tasks, get_ProjectStart]);

  // Helper function to calculate week number from project start
  function getWeekFromProjectStart(taskDate: any, projectStartDate: any) {
    const diffInMs = taskDate - projectStartDate;
    const diffInDays = Math.floor(diffInMs / (24 * 60 * 60 * 1000));
    return Math.ceil((diffInDays + 1) / 7);
  }

  function handleExport() {
    const input = reportRef.current;
    if (!input) return;

    // Hide the export button before capturing
    const exportButton = input.querySelector("#export-btn") as HTMLElement;
    if (exportButton) exportButton.style.display = "none";

    html2canvas(input, {
      scale: 2, // improves quality
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Restore export button after capture
      if (exportButton) exportButton.style.display = "block";

      pdf.save(`${project?.name || "project-report"}.pdf`);
    });
  }

  const milestoneData = [
    { name: "Planning", date: "Sep 25, 2025", progress: 100 },
    { name: "Design", date: "Oct 15, 2025", progress: 100 },
    { name: "Development", date: "Oct 28, 2025", progress: 70 },
    { name: "Testing", date: "Nov 10, 2025", progress: 45 },
    { name: "Deployment", date: "Nov 20, 2025", progress: 0 },
  ];

  return (
    <div
      ref={reportRef}
      className="w-full px-8 py-6 space-y-8 bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Project Reports</h1>
          <button
            id="export-btn"
            className="px-4 py-2 bg-[#0f6cbd] text-white rounded shadow hover:bg-[#0d5ca1] focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]/50"
            onClick={() => handleExport()}
          >
            Export to PDF
          </button>
        </div>
        <p className="text-gray-500 mb-4">
          Detailed report for your project as of {currentTime.toLocaleString()}
        </p>
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
            <div className="font-bold text-green-600 text-lg">
              {project?.status && capitalizeWords(project?.status)}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tasks Completed</span>
            <div className="font-bold text-blue-600 text-lg">
              {tasksCompleted.toFixed(2)}%
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Overdue Rate</span>
            <div className="font-bold text-red-600 text-lg">
              {overdueRate.toFixed(2)}%
            </div>
          </div>
          <div></div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
            Overall Progress
          </span>
          <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
            {overallProgress.toFixed(2)}
            <span className="text-base text-gray-500 ml-1">%</span>
          </span>
          <ProgressBar value={Number(overallProgress.toFixed(2))} />
        </div>

        <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
            Number of Completed Tasks
          </span>
          <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
            {
              taskWithoutMilestones.filter((task) => task.progress === 100)
                .length
            }
            <span className="text-base text-gray-500 ml-1">
              of {taskWithoutMilestones.length}
            </span>
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
            Active Tasks
          </span>
          <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
            {
              /* {taskWithoutMilestones.filter((task) => task.progress !== 100).length} */ get_ActiveTasks
            }
            <span className="text-base text-gray-500 ml-1">today</span>
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-5 flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1 font-medium tracking-wide">
            Critical Path Length
          </span>
          <span className="text-3xl font-bold text-[#0f6cbd] mb-2">
            {(Number(get_ProjectEnd) - Number(get_ProjectStart)) / 86400000}
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
      {/* <div className="bg-gradient-to-br from-[#e6f0fa] to-white rounded-xl shadow border border-[#b3d1f7] p-6">
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
      </div> */}
    </div>
  );
}
