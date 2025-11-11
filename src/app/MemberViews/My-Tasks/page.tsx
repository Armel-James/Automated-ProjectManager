import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import notifIcon from "../../../assets/images/notification.png";
import helpIcon from "../../../assets/images/help.png";
import NavDropdown from "../../../components/nav-dropdown";
import homeIcon from "../../../assets/images/home.png";
import { useAuth } from "../../../services/firebase/auth-context";
import TaskItem from "../../../components/task-item";
import { listenToTasksByAssignedMember } from "../../../services/firestore/tasks";
import type { Task } from "../../../types/task";
import { getProjectMemberByEmail } from "../../../services/firestore/members";
import UserTasks from "./UserTasks/page";
import NotifDropdown from "../../../components/notif-dropdown";

export default function MyTasks() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projectId } = useParams();
  const [myIdOnProject, setMyIdOnProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mytasks">("mytasks");
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleHomeClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    if (projectId && myIdOnProject) {
      const unsubscribeMembers = listenToTasksByAssignedMember(
        projectId,
        myIdOnProject || "",
        (tasks) => {
          setTasks(tasks);
        }
      );

      return () => {
        unsubscribeMembers();
      };
    }
  }, [myIdOnProject]);

  useEffect(() => {
    if (user && projectId && user.email) {
      getProjectMemberByEmail(projectId, user?.email).then((member) => {
        setMyIdOnProject(member?.id || null);
      });
    }
  }, [user]);

  return (
    <div className="grid bg-white [grid-template-rows:auto_1fr] overflow-hidden [grid-template-columns:auto_1fr] h-screen font-display">
      <nav className="col-span-2 sticky top-0 z-30 w-screen container mx-auto bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200">
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
              Slope
            </span>
          </div>
          {/* Right-side Icons */}
          <div className="flex items-center justify-end gap-3 pr-4">
            {projectId && <NotifDropdown projectId={projectId} />}
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
      <aside className="bg-white w-screen border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex pt-4 pb-2 min-h-[250px]">
            {/* Vertical Tabs */}
            <div className="flex flex-col gap-2 pr-8 border-r border-gray-200 min-w-[140px]">
              <button
                className={`px-4 py-2 rounded-l-lg font-semibold text-left transition ${
                  activeTab === "mytasks"
                    ? "bg-[#e6f0fa] text-[#0f6cbd] border-l-4 border-[#0f6cbd]"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("mytasks")}
              >
                My Tasks
              </button>
            </div>
            {/* Tab Content */}
            <div className="flex-1 pl-8 pt-2">
              {activeTab === "mytasks" && (
                <UserTasks tasks={tasks} projectId={projectId} />
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
