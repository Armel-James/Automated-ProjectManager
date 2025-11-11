import { useState } from "react";
import CollaborationSettings from "./Collaboration/page";
import ProjectSpecificSettings from "./Project/page";

interface ProjectSettingsProps {
  projectId: string;
}

export default function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const [tab, setTab] = useState<"project" | "collaborators">("project");

  return (
    <div className="flex min-h-[400px] bg-white rounded-xl overflow-hidden border border-gray-200">
      {/* Sidebar */}
      <div className="w-56 bg-[#f7fafd] border-r border-gray-200 flex flex-col py-8 gap-1">
        <button
          className={`relative px-8 py-3 text-left rounded-none transition-all font-medium text-gray-700 hover:bg-[#e6f0fa] hover:text-[#0f6cbd] flex items-center group
            ${
              tab === "project"
                ? "bg-[#e6f0fa] text-[#0f6cbd] font-bold border-l-4 border-[#0f6cbd]"
                : "border-l-4 border-transparent"
            }`}
          onClick={() => setTab("project")}
        >
          <span className="ml-2">Project</span>
        </button>
        {/* <button
          className={`relative px-8 py-3 text-left rounded-none transition-all font-medium text-gray-700 hover:bg-[#e6f0fa] hover:text-[#0f6cbd] flex items-center group
            ${
              tab === "collaborators"
                ? "bg-[#e6f0fa] text-[#0f6cbd] font-bold border-l-4 border-[#0f6cbd]"
                : "border-l-4 border-transparent"
            }`}
          onClick={() => setTab("collaborators")}
        >
          <span className="ml-2">Collaborator</span>
        </button> */}
      </div>
      {/* Main content */}
      <div className="flex-1 p-10 bg-white">
        {tab === "project" && <ProjectSpecificSettings projectId={projectId} />}
        {/* {tab === "collaborators" && (
          <CollaborationSettings projectId={projectId} />
        )} */}
      </div>
    </div>
  );
}
