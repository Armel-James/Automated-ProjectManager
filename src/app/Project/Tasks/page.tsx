import "../../../styles/frappe-gantt.css";
import {
  GanttComponent,
  ContextMenu,
  Inject,
  Selection,
  DayMarkers,
  Edit,
  Filter,
  Toolbar,
  CriticalPath,
  RowDD,
  Dependency,
} from "@syncfusion/ej2-react-gantt";
import type {
  EditDialogFieldSettingsModel,
  EditSettingsModel,
} from "@syncfusion/ej2-react-gantt";
import { useEffect, useState, useRef } from "react";
import type { Task } from "../../../types/task";
import {
  getTaskIndex,
  incTaskIndex,
} from "../../../services/firestore/projects";
import {
  createTask,
  deleteTask,
  getAllTasks,
  listenToTasks,
  updateCriticalTasks,
  updateTask,
  updateTaskOrder,
} from "../../../services/firestore/tasks";
import type { GanttMember, Member } from "../../../types/member";

import { changedTaskFields } from "../../../util/task-processing";
import {
  onGanttMembersSnapshot,
  onProjectMembersSnapshot,
} from "../../../services/firestore/members";
import sampleTasks from "./sampleData";

interface TasksViewProps {
  projectId?: string;
}

function TasksView({ projectId }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const ganttRef = useRef<GanttComponent>(null);
  const currentTaskToEdit = useRef<any>(null);
  const [members, setMembers] = useState<GanttMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<GanttMember[]>([]);
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const editOptions: EditSettingsModel = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    mode: "Dialog",
    allowTaskbarEditing: true,
  };

  useEffect(() => {
    if (!projectId) return;
    const unsubscribeTasks = listenToTasks(projectId, setTasks, setTasksLoaded);
    const unsubscribeMembers = onGanttMembersSnapshot(
      projectId,
      setMembers,
      setMembersLoaded
    );

    const unsubscribeProjectMembers = onProjectMembersSnapshot(
      projectId,
      (projectMembers) => {
        setProjectMembers(projectMembers);
      },
      setMembersLoaded
    );

    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeProjectMembers();
    };
  }, [projectId]);


  const taskFields: any = {
    id: "id",
    name: "name",
    startDate: "startDate",
    duration: "duration",
    progress: "progress",
    parentID: "parentId",
    dependency: "dependency",
    notes: "notes",
    order: "order",
    resourceInfo: "assignedMembers",
  };

  const resourceFields = {
    id: "id",
    name: "name",
    group: "teamName",
  };

  const toolbarOptions = [
    "PrevTimeSpan",
    "NextTimeSpan",
    "ExpandAll",
    "CollapseAll",
    "Search",
    "Indent",
    "Outdent",
  ];

  const editDialogFields: EditDialogFieldSettingsModel[] = [
    { type: "General" },
    { type: "Dependency" },
    { type: "Resources" },
    { type: "Notes" },
  ];

  // const handleGetCriticalTasks = () => {
  //   if (ganttRef.current) {
  //     // Access the CriticalPath functionality
  //     const criticalTasks = ganttRef.current.getCriticalTasks();
  //     const totalDuration = criticalTasks.reduce(
  //       (sum, item) => sum + (item.ganttProperties?.duration || 0),
  //       0
  //     );
  //     // console.log("Critical Tasks1:", criticalTasks);

  //     console.log("Critical Tasks2:", totalDuration);
  //   }
  // };

  return (
    // handleGetCriticalTasks(),

    <div className="w-full h-[700px] max-h-[500px] min-w-[500px] max-w-[1820px] border-gray-300">
      {projectId && (
        <GanttComponent
          ref={ganttRef}
          key={projectId}
          enablePersistence={true}
          resources={members}
          resourceFields={resourceFields}
          workWeek={[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ]}
          columns={[
            { field: "id", headerText: "ID", width: 60 },
            { field: "name", headerText: "Task Name", width: 200 },
            { field: "startDate", headerText: "Start Date", width: 100 },
            { field: "duration", headerText: "Duration", width: 100 },
          ]}
          taskFields={taskFields}
          dataSource={tasks}
          taskType="FixedDuration"
          height="800px"
          editDialogFields={editDialogFields}
          width="1820px"
          gridLines={"Horizontal"}
          allowSelection={true}
          editSettings={editOptions}
          toolbar={toolbarOptions}
          enableCriticalPath={true}
          selectionSettings={
            {
              mode: "Row",
              type: "Multiple"
            }
          }
          allowRowDragAndDrop={true}
          enableContextMenu={true}
          taskbarEditing={(args) => {
            currentTaskToEdit.current = {
              ...args.data,
            };

            if (args.taskBarEditAction === "ProgressResizing") {
              args.cancel = true; // Prevent progress bar editing
            }
          }}
          taskbarEdited={(args) => {
            //console.log("old data: ", currentTaskToEdit.current);
          }}
          actionBegin={(args) => {

            if (args.requestType === "beforeOpenEditDialog") {
              currentTaskToEdit.current = {
                ...args.rowData,
              };
            }

            if (args.requestType === "beforeOpenEditDialog") {
              // Find the progress input and disable it
              setTimeout(() => {
                const progressInput = document.querySelector(
                  'input.e-numerictextbox[title="progress"]'
                );
                if (progressInput) {
                  progressInput.setAttribute("disabled", "true");
                }

                const spinDown = document.querySelector(
                  'span.e-input-group-icon.e-spin-down[title="Decrement value"]'
                );
                const spinUp = document.querySelector(
                  'span.e-input-group-icon.e-spin-up[title="Increment value"]'
                );
                [spinDown, spinUp].forEach((el: any) => {
                  if (el) {
                    el.style.pointerEvents = "none";
                    el.style.opacity = "0.5";
                  }
                });
              }, 0);
            }
          }}
          actionComplete={(args) => {
            if (args.requestType === "add") {

              // Get parent id of new Task
              const parentId = args.data.taskData.parentId;
              const newTaskId = args.data.taskData.id;
              
              getTaskIndex(projectId).then((taskIndex: number) => {
                const newTask: Task = {
                  ...args.data.taskData,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  docId: taskIndex,
                  assignedMembers: [],
                } as Task;

                // For ordering purposes only
                const allTasks: Task[] =
                  ganttRef.current?.flatData.map((t: any) => ({
                    id: t.taskData.id,
                    name: t.taskData.name,
                    order: t.taskData.order ?? 0,
                    startDate: t.taskData.startDate || new Date(),
                    duration: t.taskData?.duration || 1,
                    progress: t.taskData?.progress ?? 0,
                    dependency: t.taskData?.dependency ?? null,
                    parentId: t.taskData?.parentId ?? null,
                    notes: t.taskData?.notes ?? "",
                    docId: t.taskData?.docId ?? "",
                  })) || [];
                if (!allTasks) return;

                const childrenOfParent = allTasks.filter(
                  (task) => task.parentId === parentId
                );

                const newTaskIndex = childrenOfParent.findIndex(
                  (task) => task.id == newTask.id
                );

                if (newTaskIndex < 0) return;

                console.log(newTaskIndex);
                // Continue here...

                childrenOfParent[newTaskIndex].docId = String(taskIndex);
                for (let i = newTaskIndex + 1; i < childrenOfParent.length; i++) {
                      childrenOfParent[i].order = i;
                      updateTaskOrder(
                        projectId,
                        String(childrenOfParent[i].docId),
                        i
                      );
                    }
                createTask(projectId, 
                  { ...childrenOfParent[newTaskIndex], order: newTaskIndex, name: "New Task", progress: 0});
                  console.log({ ...childrenOfParent[newTaskIndex], order: newTaskIndex, name: "New Task", progress: 0});
              });


            } else if (args.requestType === "save") {
              if (!currentTaskToEdit?.current) {
                return;
              }

              const newTask = {
                ...args.data.taskData,
              } as any;

              const previousTaskState = {
                docId: currentTaskToEdit?.current?.taskData.docId,
                id: currentTaskToEdit?.current?.id,
                dependency: currentTaskToEdit?.current?.dependency || "",
                notes: currentTaskToEdit?.current?.notes,
                progress: currentTaskToEdit?.current?.progress,
                startDate: currentTaskToEdit?.current?.startDate,
                name: currentTaskToEdit?.current?.name,
                duration: currentTaskToEdit?.current?.duration,
              } as Task;

              const changes = changedTaskFields(previousTaskState, newTask);
              const docId = newTask.docId;

              if (!changes) return;
              Object.entries(changes).forEach(([key, value]) => {
                updateTask(projectId, docId, key, value);
              });

              // members changed in here
              updateTask(
                projectId,
                String(newTask.docId),
                "assignedMembers",
                newTask.assignedMembers?.map((m: GanttMember) => ({
                  id: m.id,
                  unit: m.unit,
                  teamName: m.teamName,
                  role: projectMembers.find((mem) => mem.id === m.id)?.role,
                  name: m.name,
                  emailAddress: projectMembers.find((mem) => mem.id === m.id)
                    ?.emailAddress,
                })) || []
              );

              // Recalculate critical path duration
              const d = ganttRef.current
                ? ganttRef.current
                    ?.getCriticalTasks()
                    .reduce(
                      (sum, item) =>
                        sum + (item.ganttProperties?.duration || 0),
                      0
                    )
                : 0;
              updateCriticalTasks(projectId, d);
              console.log("Total Critical Duration: ", d);

              // updateTask(
              //   projectId,
              //   String(newTask.docId),
              //   "unit",
              //   newTask.assignedMembers?.unit
              // );

              // Update units of members too
            } else if (args.requestType === "delete") {
              const deletedTasks: any = args.data;
              deletedTasks.forEach((task: any) =>
                deleteTask(projectId, task.taskData.docId, projectMembers)
              );
            } else if (
              args.requestType === "rowDropped" ||
              args.requestType === "indented" ||
              args.requestType === "outdented"
            ) {
              // Change parent id here depending on where it was dropped
              const droppedRow = args.data;
              const droppedTaskDocId = droppedRow[0].taskData.docId;
              const droppedTaskParentId = droppedRow[0].taskData.parentId;

              updateTask(
                projectId,
                String(droppedTaskDocId),
                "parentId",
                droppedTaskParentId
              );

              // Find all siblings (including the dropped task)
              const siblings = ganttRef.current?.flatData
                .filter((t: any) => t.taskData.parentId === droppedTaskParentId)
                .map((t: any) => t.taskData);

              // Sort siblings by their position in the Gantt chart
              //siblings?.sort((a, b) => a.index - b.index);

              // Update order for each sibling
              siblings?.forEach((task: any, idx: number) => {
                if (task.order !== idx) {
                  updateTask(projectId, String(task.docId), "order", idx);
                }
              });
            }
          }}
        >
          <Inject
            services={[
              Edit,
              CriticalPath,
              Selection,
              DayMarkers,
              Toolbar,
              Filter,
              RowDD,
              ContextMenu,
            ]}
          />
        </GanttComponent>
      )}
    </div>
  );
}

export default TasksView;
