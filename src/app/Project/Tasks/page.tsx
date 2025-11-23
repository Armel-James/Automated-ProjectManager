import "../../../styles/frappe-gantt.css";
import { TaskbarTemplate } from "./taskbarTemplate";
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
import type { GanttMember, Member, ProjectMember } from "../../../types/member";

import { changedTaskFields } from "../../../util/task-processing";
import {
  onGanttMembersSnapshot,
  onProjectMembersSnapshot,
} from "../../../services/firestore/members";
import sampleTasks from "./sampleData";
import UploadModal from "../../../components/UploadModal/upload-modal";
import type { GanttResource } from "../../../types/resource";
import type { OtherResource } from "../../../types/other-resource";
import { listenToProjectMembers } from "../../../services/firestore/projectmember";
import { listenToOtherResources } from "../../../services/firestore/otherresource";
import { listenToEmployees } from "../../../services/firestore/employees";
import type { Employee } from "../../../types/employee";
import { getAuth } from "firebase/auth";

interface TasksViewProps {
  projectId?: string;
}

function TasksView({ projectId }: TasksViewProps) {
  const currentUser = getAuth().currentUser;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toItemDependency, setToItemDependency] = useState<any>(null);
  const ganttRef = useRef<GanttComponent>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const currentTaskToEdit = useRef<any>(null);
  const [members, setMembers] = useState<GanttMember[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);

  // Resources
  const [formattedResources, setFormattedResources] = useState<GanttResource[]>(
    []
  );
  const [membersCollection, setMembersCollection] = useState<ProjectMember[]>(
    []
  );
  const [otherResourcesCollection, setOtherResourcesCollection] = useState<
    OtherResource[]
  >([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);

  const editOptions: EditSettingsModel = {
    allowAdding: true,
    allowEditing: true,
    allowDeleting: true,
    mode: "Dialog",
    allowTaskbarEditing: true,
  };

  const today = new Date();

  useEffect(() => {
    // console.log("Members Collection:", membersCollection);
    // console.log("Other Resources Collection:", otherResourcesCollection);
    // console.log("Formatted Resources:", formattedResources);
    // console.log("Global Employees:", globalEmployees);

    const formattedMembers: GanttResource[] = membersCollection.map(
      (member) => {
        const employee = globalEmployees.find(
          (emp) => emp.id === member.employeeId
        );

        return {
          id: member.employeeId,
          name: employee?.firstName + " " + employee?.lastName || "",
          group: "Manpower",
          unit: 100,
        };
      }
    );

    const formattedOtherResources: GanttResource[] =
      otherResourcesCollection.map((resource) => ({
        id: resource.id,
        name: resource.name,
        group: resource.category,
        unit: 100,
      }));

    setFormattedResources([...formattedMembers, ...formattedOtherResources]);
  }, [membersCollection, otherResourcesCollection, globalEmployees, projectId]);

  function handleToolbarClick(args: any) {
    if (!ganttRef.current) {
      console.error("Gantt reference is null");
      return;
    }

    if (selectedRow == null) {
      return;
    }

    if (args.item.id === "SubmissionsButton") {
      setIsUploadModalOpen(true);
      console.log(formattedResources);
    }
  }

  const rowSelected = (args: any) => {
    if (!args.data) return;
    if (ganttRef.current) {
      ganttRef.current.enableItems(["SubmissionsButton"], true); // Enable the button
    }

    if (args.data.length > 1) setSelectedRow(null);
    else setSelectedRow(args.data);
  };

  const rowDeselected = () => {
    if (ganttRef.current) {
      ganttRef.current.enableItems(["SubmissionsButton"], false); // Disable the button
    }
  };

  useEffect(() => {
    if (!projectId || !currentUser) return;

    const unsubscribeTasks = listenToTasks(projectId, setTasks);
    const unsubscribeToEmployees = listenToEmployees(
      currentUser.uid,
      setGlobalEmployees
    );
    const unsubscribeToProjectMembers = listenToProjectMembers(
      projectId,
      setMembersCollection
    );
    const unsubscribeToOtherResources = listenToOtherResources(
      projectId,
      setOtherResourcesCollection
    );

    const unsubscribeMembers = onGanttMembersSnapshot(projectId, setMembers);
    const unsubscribeProjectMembers = onProjectMembersSnapshot(
      projectId,
      (projectMembers) => {
        setProjectMembers(projectMembers);
      }
    );

    return () => {
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeProjectMembers();
      unsubscribeToProjectMembers();
      unsubscribeToOtherResources();
      unsubscribeToEmployees();
    };
  }, [projectId, currentUser]);

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
    resourceInfo: "assignedResource",
    totalCost: "totalCost",
    baselineStartDate: "baselineStartDate",
    baselineEndDate: "baselineEndDate",
  };

  const resourceFields = {
    id: "id",
    name: "name",
    group: "group",
  };

  const toolbarOptions = [
    "PrevTimeSpan",
    "NextTimeSpan",
    "ExpandAll",
    "CollapseAll",
    "Search",
    "Indent",
    "Outdent",
    "renderBaseline",
    { text: "Submissions", id: "SubmissionsButton" },
  ];

  const editDialogFields: EditDialogFieldSettingsModel[] = [
    {
      type: "General",
      fields: ["id", "name", "startDate", "duration", "progress", "totalCost"],
    },
    { type: "Dependency" },
    { type: "Resources" },
    { type: "Notes" },
  ];

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

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
      {projectId && formattedResources.length >= 0 && (
        <GanttComponent
          baselineColor="red"
          renderBaseline={true}
          ref={ganttRef}
          key={tasks.length}
          enablePersistence={true}
          resources={formattedResources}
          resourceFields={resourceFields}
          rowSelected={rowSelected}
          rowDeselected={rowDeselected}
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
            { field: "totalCost", headerText: "Total Cost", width: 100 },
          ]}
          taskFields={taskFields}
          dataSource={tasks}
          taskType="FixedDuration"
          height="800px"
          editDialogFields={editDialogFields}
          width="100%"
          renderBaseline={true}
          baselineColor="blue"
          gridLines={"Horizontal"}
          allowSelection={true}
          editSettings={editOptions} // Apply the edit settings with the custom template
          toolbar={toolbarOptions}
          taskbarTemplate={TaskbarTemplate}
          enableCriticalPath={true}
          toolbarClick={handleToolbarClick}
          eventMarkers={[
            {
              day: today,
              label: `Today: ${today.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              cssClass: "today-line",
            },
          ]}
          selectionSettings={{
            mode: "Row",
            type: "Multiple",
          }}
          allowRowDragAndDrop={true}
          enableContextMenu={true}
          taskbarEditing={(args) => {
            if (args.data.progress > 0) {
              args.cancel = true; // Prevents dragging/resizing
            }

            currentTaskToEdit.current = {
              ...args.data,
            };

            if (args.taskBarEditAction === "ProgressResizing") {
              args.cancel = true; // Prevent progress bar editing
            }
          }}
          taskbarEdited={() => {}}
          actionBegin={(args) => {
            if (args.requestType === "beforeOpenEditDialog") {
              currentTaskToEdit.current = {
                ...args.rowData,
              };

              setTimeout(() => {
                const inputElement = document.querySelector(
                  'input[name="totalCost"]'
                );

                if (inputElement) {
                  inputElement.setAttribute("type", "number");
                  inputElement.setAttribute("min", "0");
                  inputElement.setAttribute("step", "0.01");

                  // inputElement.addEventListener(
                  //   "keydown",
                  //   (event: KeyboardEvent) => {
                  //     if (event.key === "e") {
                  //       event.preventDefault();
                  //     }
                  //   }
                  // );
                }
              }, 0.2);
            }
            if (args.rowData && args.rowData.progress > 1) {
              setTimeout(() => {
                // Disable specific fields in the dialog
                const dialog = args.dialogModel.content;

                if (!dialog) return;
                const forms = document.querySelectorAll(".e-edit-form-column");
                forms.forEach((formElement: any) => {
                  formElement.setAttribute("disabled", "true");
                  formElement.style.pointerEvents = "none"; // Prevent interaction
                  formElement.style.opacity = "0.7"; // Add visual indication
                });

                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === "childList") {
                      const dependencyAddDelElements =
                        dialog.querySelectorAll(".e-tbar-btn");

                      const notesElement = dialog.querySelector(
                        ".e-content.e-lib.e-keyboard"
                      );

                      const resourceInputs = dialog.querySelectorAll(
                        "input[type='checkbox']"
                      );

                      const resourceInputsWrappers = dialog.querySelectorAll(
                        ".e-checkbox-wrapper"
                      );

                      if (args.rowData.progress === 100) {
                        resourceInputsWrappers.forEach((wrapper: any) => {
                          wrapper.setAttribute("disabled", "true");
                          wrapper.style.pointerEvents = "none"; // Prevent interaction
                          wrapper.style.opacity = "0.7"; // Add visual indication
                        });
                      }

                      for (
                        let i = 0;
                        i < dependencyAddDelElements.length;
                        i++
                      ) {
                        const element: any = dependencyAddDelElements[i];
                        element.setAttribute("disabled", "true");
                        element.style.pointerEvents = "none"; // Prevent interaction
                        element.style.opacity = "0.7"; // Add visual indication
                      }

                      if (notesElement) {
                        notesElement.setAttribute("disabled", "true");
                        notesElement.style.pointerEvents = "none"; // Prevent interaction
                        notesElement.style.opacity = "0.7"; // Add visual indication
                      }

                      if (notesElement && dependencyAddDelElements) {
                        observer.disconnect(); // Stop observing once the element is found
                      }
                    }
                  });
                });

                // Start observing the dialog for changes
                observer.observe(dialog, { childList: true, subtree: true });
              }, 0.2);
            }

            if (args.requestType === "taskbarediting") {
              setToItemDependency(null);
            }

            if (args.requestType === "ValidateDependency") {
              setToItemDependency(args.toItem);
            }

            if (args.requestType === "beforeSave" && toItemDependency) {
              if (toItemDependency.progress > 0) {
                args.cancel = true;
              }
              setTimeout(() => {
                setToItemDependency(null);
              }, 0);
            }

            if (args.requestType === "beforeOpenEditDialog") {
              // if (args.rowData.progress > 0) {
              //   args.cancel = true;
              // }
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
                  }
                });
              }, 0);
            }
          }}
          actionComplete={(args) => {
            if (args.requestType === "add") {
              // Get parent id of new Task
              const parentId = args.data.taskData.parentId;

              getTaskIndex(projectId).then((taskIndex: number) => {
                const newTask: Task = {
                  ...args.data.taskData,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  docId: taskIndex,
                  assignedResource: [],
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
                    totalCost: Number(t.taskData?.totalCost) || 0,
                  })) || [];
                if (!allTasks) return;

                const childrenOfParent = allTasks.filter(
                  (task) => task.parentId === parentId
                );

                const newTaskIndex = childrenOfParent.findIndex(
                  (task) => task.id == newTask.id
                );

                if (newTaskIndex < 0) return;

                childrenOfParent[newTaskIndex].docId = taskIndex;
                for (
                  let i = newTaskIndex + 1;
                  i < childrenOfParent.length;
                  i++
                ) {
                  childrenOfParent[i].order = i;
                  updateTaskOrder(
                    projectId,
                    String(childrenOfParent[i].docId),
                    i
                  );
                }
                createTask(projectId, {
                  ...childrenOfParent[newTaskIndex],
                  order: newTaskIndex,
                  name: "New Task",
                  progress: 0,
                  totalCost: 0,
                  baselineStartDate: null,
                  baselineEndDate: null,
                } as Task);
              });
            } else if (args.requestType === "save") {
              if (!currentTaskToEdit?.current) {
                return;
              }

              const newTask = {
                ...args.data.taskData,
                totalCost: Number(args.data.taskData.totalCost) || 0,
              } as any;

              console.log("New Task Data:", newTask);

              const previousTaskState = {
                docId: currentTaskToEdit?.current?.taskData.docId,
                id: currentTaskToEdit?.current?.id,
                dependency: currentTaskToEdit?.current?.dependency || "",
                notes: currentTaskToEdit?.current?.notes,
                progress: currentTaskToEdit?.current?.progress,
                startDate: currentTaskToEdit?.current?.startDate,
                name: currentTaskToEdit?.current?.name,
                duration: currentTaskToEdit?.current?.duration,
                totalCost: Number(currentTaskToEdit?.current?.totalCost) || 0,
              } as Task;

              const changes = changedTaskFields(previousTaskState, newTask);
              const docId = newTask.docId;

              console.log("Changes Detected:", changes);

              if (!changes) return;
              Object.entries(changes).forEach(([key, value]) => {
                updateTask(projectId, docId, key, value);
              });

              //console.log("Updated Task:", newTask.assignedResource);
              // members changed in here
              updateTask(
                projectId,
                String(newTask.docId),
                "assignedResource",
                newTask.assignedResource?.map((m: GanttResource) => ({
                  id: m.id,
                  unit: m.unit,
                  group: m.group,
                  roles: membersCollection.find(
                    (mem) => mem.employeeId === m.id
                  )?.roles, // Corrected 'role' to 'roles'
                  name: m.name,
                  email: globalEmployees.find((mem) => mem.id === m.id)?.email,
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
      {selectedRow && isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          taskId={selectedRow.taskData.docId}
          projectId={projectId || ""}
          canAddFiles={false}
        />
      )}
    </div>
  );
}

export default TasksView;
