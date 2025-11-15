interface ProjectSpecificSettingsProps {
  projectId: string;
}

import { useState, useEffect } from "react";
import LoadingScreen from "../../../../components/LoadingScreen";
import {
  createProject,
  deleteProject,
  getProjectById,
  updateProject,
} from "../../../../services/firestore/projects";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  createTask,
  createTasksInBulk,
  getAllTasks,
} from "../../../../services/firestore/tasks";

export default function ProjectSpecificSettings({
  projectId,
}: ProjectSpecificSettingsProps) {
  const [deleting, setDeleting] = useState(false);
  const [projectName, setProjectName] = useState(""); // Add state for project name
  const [editingName, setEditingName] = useState(false);
  const navigate = useNavigate();
  const currentUser = getAuth().currentUser;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch the project name on mount
    async function fetchProjectName() {
      const project = await getProjectById(projectId);
      if (project) {
        setProjectName(project.name);
      }
    }

    fetchProjectName();
  }, [projectId]);

  async function handleReuseProject() {
    setIsLoading(true);
    const project = await getProjectById(projectId);
    const projectTasks = await getAllTasks(projectId);
    console.log("Reusing project:", project, projectTasks);

    if (project && currentUser) {
      const newProjectData = {
        ...project,
        name: project.name + " (Copy)",
        createdAt: new Date(),
        members: [],
        progress: 0,
        status: "active" as "active" | "completed" | "on-hold",
      };
      delete newProjectData.id;

      const newProjectId = await createProject(newProjectData, currentUser);

      if (newProjectId) {
        const cleanedProjectTasks = projectTasks.map(({ ...rest }) => ({
          ...rest,
          assignedMembers: [],
        }));

        createTasksInBulk(newProjectId as string, cleanedProjectTasks)
          .then(() => {
            console.log("Project tasks duplicated successfully.");
            window.location.href = `/project/${newProjectId}`;
          })
          .catch((error) => {
            console.error("Error duplicating project tasks:", error);
          })
          .finally(() => setIsLoading(false));
      }
    }
  }

  // Placeholder for actual delete logic
  async function handleDelete() {
    if (
      prompt(
        "Are you sure you want to permanently delete this project? This action cannot be undone. Type DELETE to confirm."
      ) === "DELETE"
    ) {
      setDeleting(true);
      // TODO: Call your deleteProject(projectId) function here
      // await deleteProject(projectId);
      deleteProject(projectId);

      setDeleting(false);
      // Optionally redirect or show a message
      navigate("/");
    }
  }

  async function handleNameSave() {
    if (!projectName.trim()) return;
    await updateProject(projectId, { name: projectName });
    setEditingName(false);
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-[#0f6cbd] mb-6">Project</h2>
      {/* Editable Project Name */}
      <div className="mb-8 flex items-center gap-3">
        {" "}
        Project Name:
        {editingName ? (
          <>
            <input
              className="border border-[#b3d1f7] rounded-lg px-3 py-2 text-lg font-semibold text-[#0f6cbd] focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]/30"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
            <button
              className="bg-[#0f6cbd] text-white px-3 py-1 rounded font-semibold text-sm hover:bg-[#155a8a]"
              onClick={handleNameSave}
            >
              Save
            </button>
            <button
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold text-sm hover:bg-[#e6f0fa]"
              onClick={() => setEditingName(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="text-lg font-semibold text-[#0f6cbd]">
              {projectName || "Untitled Project"}
            </span>
            <button
              className="bg-[#e6f0fa] text-[#0f6cbd] px-3 py-1 rounded font-semibold text-sm hover:bg-[#b3d1f7]"
              onClick={() => setEditingName(true)}
            >
              Edit
            </button>
          </>
        )}
      </div>

      {/* Reuse Project Section */}
      <div className="mt-12 border-t border-gray-400 pt-8">
        <h3 className="text-lg font-semibold text-[#0f6cbd] mb-2">
          Project Duplication
        </h3>
        <p className="text-gray-700 mb-4">
          You can reuse this project as a template for creating new projects.
          This will duplicate the current project structure and settings.
        </p>
        <button
          className="bg-[#0f6cbd] hover:bg-[#155a8a] text-white font-semibold px-4 py-2 rounded-md transition text-sm"
          onClick={handleReuseProject}
        >
          Reuse Project
        </button>
      </div>

      {/* Danger Zone - Delete Project */}
      <div className="mt-12 border-t border-gray-400 pt-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-gray-700 mb-4">
          Deleting this project is irreversible. All project data will be lost.
        </p>
        <button
          className="bg-[#e53935] hover:bg-[#b71c1c] text-white font-semibold px-4 py-2 rounded-md transition disabled:opacity-60 text-sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Project Permanently"}
        </button>
      </div>
      {isLoading && <LoadingScreen />}
    </div>
  );
}
