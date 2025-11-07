import taskIcon from "../../assets/images/tasks.png";
import membersIcon from "../../assets/images/members.png";
import reportsIcon from "../../assets/images/reports.png";
import notifIcon from "../../assets/images/notification.png";
import helpIcon from "../../assets/images/help.png";
import TasksView from "./Tasks/page";
import homeIcon from "../../assets/images/home.png";
import settingIcon from "../../assets/images/settings.png";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project } from "../../types/project";
import { useAuth } from "../../services/firebase/auth-context";
import NavDropdown from "../../components/nav-dropdown";
import {
  getProjectById,
  onProjectSnapshot,
} from "../../services/firestore/projects";
import MembersManagement from "./Members/page";
import ProjectSettings from "./Settings/page";
import Reports from "./Reports/page";
import NotifDropdown from "../../components/notif-dropdown";

function ProjectView() {
  const [activeTab, setActiveTab] = useState("tasks-tab");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  const handleHomeClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    async function loadProject(id: string) {
      const result = await getProjectById(id);
      setProject(result ?? null);
    }
    //loadProject(String(id));

    const unsubscribeProject = onProjectSnapshot(String(id), (proj) => {
      setProject(proj);
    });

    return () => {
      unsubscribeProject();
    };
  }, [id]);

  const renderContent = () => {
    if (activeTab === "tasks-tab") {
      if (project) return <TasksView projectId={project?.id} />;
    } else if (activeTab === "members-tab") {
      if (project) return <MembersManagement projectId={project?.id} />;
    } else if (activeTab === "reports-tab") {
      if (project) return <Reports projectId={project?.id} />;
    } else if (activeTab === "settings-tab") {
      if (project) return <ProjectSettings projectId={project?.id} />;
    }
  };

  return (
    <div className="grid bg-white [grid-template-rows:auto_1fr] overflow-hidden [grid-template-columns:auto_1fr] h-screen font-display">
      <nav className="col-span-2 sticky top-0 z-30 w-screen bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="grid [grid-template-columns:56px_1fr_auto] text-black items-center min-h-[60px]">
          {/* Home Button */}
          <div className="flex items-center justify-center h-full border-r border-gray-200 bg-white/80">
            <button
              className="rounded-xl p-2 transition hover:bg-[#e6f0fa] focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]/40"
              onClick={handleHomeClick}
              aria-label="Home"
            >
              <img src={homeIcon} className="w-7 h-7" />
            </button>
          </div>
          {/* App Name & TitleInput */}
          <div className="flex items-center gap-6 pl-4">
            <span className="text-lg font-bold text-[#0f6cbd] tracking-tight drop-shadow-sm select-none">
              AutoProject
            </span>
            <div className="w-full max-w-lg">
              {project ? (
                <h1
                  className="text-base font-bold text-[#0f6cbd] tracking-tight bg-gradient-to-r from-[#e6f0fa] via-white to-[#f7fafd] px-3 py-1 rounded-xl shadow-sm border border-[#b3d1f7] select-none"
                  style={{
                    letterSpacing: "0.02em",
                    boxShadow: "0 1px 4px 0 rgba(15,108,189,0.07)",
                    display: "inline-block",
                    minWidth: "120px",
                  }}
                >
                  {project.name}
                </h1>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
            </div>
          </div>
          {/* Right-side Icons */}
          <div className="flex items-center justify-end gap-3 pr-4">
            {project && <NotifDropdown projectId={project.id} />}
            <NavDropdown
              actions={{
                Logout: () => {
                  logout();
                  navigate("/");
                },
              }}
            >
              <img
                src={user?.photoURL || ""}
                className="rounded-full w-7 h-7 object-cover border border-gray-200 shadow-sm"
              />
            </NavDropdown>
          </div>
        </div>
      </nav>
      <aside
        className="border-r h-full border-r-gray-200 flex flex-col bg-white text-center py-4 px-1 shadow-sm"
        style={{ minWidth: 56 }}
      >
        {/* Task Tab Button */}
        <button
          className={`flex justify-center items-center my-1 rounded-xl transition-all duration-150 p-1.5 mx-auto w-12 h-12 shadow-sm
            ${
              activeTab === "tasks-tab"
                ? "bg-[#e6f0fa] border-2 border-[#0f6cbd] shadow-md"
                : "hover:bg-[#f4f8fb] border border-transparent"
            }
          `}
          aria-label="Tasks"
          onClick={() => setActiveTab("tasks-tab")}
        >
          <img src={taskIcon} className="h-7 w-7" />
        </button>

        {/* Members Tab Button */}
        <button
          className={`flex justify-center items-center my-1 rounded-xl transition-all duration-150 p-1.5 mx-auto w-12 h-12 shadow-sm
            ${
              activeTab === "members-tab"
                ? "bg-[#e6f0fa] border-2 border-[#0f6cbd] shadow-md"
                : "hover:bg-[#f4f8fb] border border-transparent"
            }
          `}
          aria-label="Members"
          onClick={() => setActiveTab("members-tab")}
        >
          <img src={membersIcon} className="h-7 w-7" />
        </button>

        {/* Reports Tab Button */}
        <button
          className={`flex justify-center items-center my-1 rounded-xl transition-all duration-150 p-1.5 mx-auto w-12 h-12 shadow-sm
            ${
              activeTab === "reports-tab"
                ? "bg-[#e6f0fa] border-2 border-[#0f6cbd] shadow-md"
                : "hover:bg-[#f4f8fb] border border-transparent"
            }
          `}
          aria-label="Reports"
          onClick={() => setActiveTab("reports-tab")}
        >
          <img src={reportsIcon} className="h-7 w-7" />
        </button>

        {/* Settings Tab Button */}
        <button
          className={`flex justify-center items-center my-1 rounded-xl transition-all duration-150 p-1.5 mx-auto w-12 h-12 shadow-sm
            ${
              activeTab === "settings-tab"
                ? "bg-[#e6f0fa] border-2 border-[#0f6cbd] shadow-md"
                : "hover:bg-[#f4f8fb] border border-transparent"
            }
          `}
          aria-label="Settings"
          onClick={() => setActiveTab("settings-tab")}
        >
          <img src={settingIcon} className="h-7 w-7" />
        </button>
      </aside>
      <main className="p-3 border-1 border-gray-200 w-full overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default ProjectView;
