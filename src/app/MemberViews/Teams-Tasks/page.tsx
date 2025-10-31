import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect } from "react";
import homeIcon from "../../../assets/images/home.png";
import helpIcon from "../../../assets/images/help.png";
import notifIcon from "../../../assets/images/notification.png";
import NavDropdown from "../../../components/nav-dropdown";
import { useAuth } from "../../../services/firebase/auth-context";
import { useState } from "react";
import MyTeamTasks from "./MyTeam-Tasks/page";
import type { Member } from "../../../types/member";
import { getMemberByEmail } from "../../../services/firestore/members";
import type { Task } from "../../../types/task";
import { listenToTaskByTeam } from "../../../services/firestore/tasks";
import type { Project } from "../../../types/project";
import type { User } from "firebase/auth";
import { getUserById } from "../../../services/firestore/user";
import { getProjectById } from "../../../services/firestore/projects";
import NotifDropdown from "../../../components/notif-dropdown";

export default function TeamTasks() {
  const [activeTab, setActiveTab] = useState<"myteam-tasks" | "other-reports">(
    "myteam-tasks"
  );

  const [me, setMe] = useState<Member | null>(null);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [projectOwner, setProjectOwner] = useState<User | null>(null);

  const projectId = useParams().projectId;
  const [project, setProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);

  const handleHomeClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    // The User's Info as a member of this project
    getMemberByEmail(projectId || "", user?.email || "").then((member) => {
      setMe(member);
    });

    if (projectId && me?.teamName) {
      const unsubscribeToTeamTasks = listenToTaskByTeam(
        projectId,
        me.teamName,
        setTeamTasks
      );

      getProjectById(projectId).then((proj) => {
        setProject(proj);
      });

      return () => {
        unsubscribeToTeamTasks();
      };
    }
  }, [projectId, me?.teamName]);

  useEffect(() => {
    if (project) {
      getUserById(project.ownerID).then((ownerUser) => {
        if (ownerUser) {
          setProjectOwner(ownerUser);
        }
      });
    }
  }, [project]);

  /*
  
    Get all the members of the team for this project
    Get all tasks
    Filter the tasks according to team name
    Get all tasks assigned to the team members
  */

  return (
    <div className="grid bg-white [grid-template-rows:auto_1fr] overflow-hidden grid-cols-[220px_1fr] h-screen font-display">
      {/* NAVBAR - DO NOT CHANGE */}
      <nav className="col-span-2 sticky top-0 z-30 w-screen container mx-auto bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="grid [grid-template-columns:56px_1fr_auto] z-0 text-black items-center min-h-[60px]">
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
          </div>
          {/* Right-side Icons */}
          <div className="flex items-center justify-end gap-3 pr-4">
            {projectId && (<NotifDropdown projectId={projectId} />)}
            
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
      {/* Vertical Tabs Sidebar */}
      <aside className="bg-white w-screen border-b border-gray-200">
        <div className="container mx-auto h-full">
          <div className="flex pt-4 pb-2 min-h-[250px] h-full">
            {/* Vertical Tabs */}
            <div className="flex flex-col gap-2 pr-8 border-r border-gray-200 min-w-[140px]">
              <div>
                <button
                  className={`px-4 py-2 rounded-l-lg font-semibold text-left transition ${
                    activeTab === "myteam-tasks"
                      ? "bg-[#e6f0fa] text-[#0f6cbd] border-l-4 border-[#0f6cbd]"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("myteam-tasks")}
                >
                  My Team Tasks
                </button>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-[#0f6cbd] leading-normal">
                    {project?.name}
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <img
                      src={projectOwner?.photoURL || ""}
                      alt={projectOwner?.displayName || "Owner"}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                    />
                    <span className="font-medium">
                      {projectOwner?.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    Project Owner
                  </span>
                </div>
              </div>
            </div>
            {/* Tab Content */}
            <div className="flex-1 pl-8 pt-2">
              {activeTab === "myteam-tasks" && projectId && (
                <MyTeamTasks tasks={teamTasks} projectId={projectId} />
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
