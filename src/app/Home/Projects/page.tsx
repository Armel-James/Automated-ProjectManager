import ProjectCard from "../../../components/project-card";
import {
  getProjectsByOwner,
  createProject,
  onProjectsByMemberEmailSnapshot,
  onProjectByOwnerSnapshot,
  createProjectFromTemplate,
} from "../../../services/firestore/projects";
import Modal from "../../../components/modal";
import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import type { CSVItemData } from "../../../util/csv";
import type { Project } from "../../../types/project";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../../services/firebase/auth-context";
import OwnedProjects from "./Owned/page";
import AssociatedProjects from "./Associated/page";
import { convertCSVFiletoJSON } from "../../../util/csv";

export default function Projects() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[] | undefined>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"owned" | "associated">("owned");
  const [associatedProjects, setAssociatedProjects] = useState<Project[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedCSVData, setParsedCSVData] = useState<CSVItemData[] | null>(
    null
  );
  const navigate = useNavigate();
  // Load Projects
  useEffect(() => {
    async function load() {
      const results = await getProjectsByOwner(user?.uid);
      setProjects(results);
    }

    if (user?.uid) load();

    const unsubscribeProjectsByOwner = onProjectByOwnerSnapshot(
      user?.uid,
      setProjects
    );
    const unsubscribeProjectsbyMemberEmail = onProjectsByMemberEmailSnapshot(
      user?.email ?? "",
      setAssociatedProjects
    );

    return () => {
      unsubscribeProjectsbyMemberEmail();
      //unsubscribeProjectsByOwner();
    };
  }, [user?.uid, user?.email]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    if (e.target.files.length > 1) {
      alert("Please select only one file");
      e.target.value = ""; // reset
      return;
    }
    const file = e.target.files[0];
    setUploadedFile(file);
  }

  function removeFile() {
    setUploadedFile(null);
  }

  async function handleFileUpload() {
    if (uploadedFile) {
      const parsedData: CSVItemData[] | null = await convertCSVFiletoJSON(
        uploadedFile
      );
      if (parsedData) setParsedCSVData(parsedData);
      if (parsedData && user && projectName && projectDescription) {
        createProjectFromTemplate(
          user,
          projectName,
          projectDescription,
          parsedData
        );
        setIsUploadModalOpen(false);
        setUploadedFile(null);
        setParsedCSVData(null);
        setProjectName("");
        setProjectDescription("");
      }
    }
  }

  useEffect(() => {
    //console.log("Associated Projects:", associatedProjects);
  }, [associatedProjects]);

  const handleCreateProject = () => {
    const newProject = {
      id: "",
      name: projectName,
      description: projectDescription,
      ownerID: "",
      members: [],
      progress: 0,
      status: "active",
      expectedEndDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      taskIndex: 0,
    } as Project;

    createProject(newProject, user);
    navigate("/");

    setProjectName("");
    setProjectDescription("");
  };

  return (
    <div>
      {" "}
      {/*<<<< project design template*/}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-2">
        <h1 className="text-2xl font-bold text-[#0f6cbd] tracking-tight">
          My Projects
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white text-[#155a8a] hover:text-white font-semibold rounded-xl px-6 py-2 shadow border border-[#155a8a] hover:bg-[#155a8a] transition w-full md:w-auto order-first"
          >
            Start with CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0f6cbd] text-white font-semibold rounded-xl px-6 py-2 shadow hover:bg-[#155a8a] transition w-full md:w-auto"
          >
            + New Project
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
            activeTab === "owned"
              ? "bg-[#e6f0fa] text-[#0f6cbd] border border-[#b3d1f7]"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-[#f7fafd]"
          }`}
          onClick={() => setActiveTab("owned")}
        >
          Owned
        </button>
        <button
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
            activeTab === "associated"
              ? "bg-[#e6f0fa] text-[#0f6cbd] border border-[#b3d1f7]"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-[#f7fafd]"
          }`}
          onClick={() => setActiveTab("associated")}
        >
          Associated
        </button>
      </div>
      <div>
        {activeTab === "owned" ? (
          <OwnedProjects projects={projects ?? []} />
        ) : (
          <AssociatedProjects projectsAssociated={associatedProjects ?? []} />
        )}
      </div>
      <Modal
        open={isModalOpen ?? false}
        setIsOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectName("");
          setProjectDescription("");
        }}
        onConfirm={handleCreateProject}
        title={"New Project"}
        isViewOnly={false}
      >
        <form>
          <div className="flex flex-col">
            <input
              type="text"
              id="first_name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary block w-full p-2.5 m-1"
              placeholder="Project Name"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <textarea
              id="message"
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary m-1"
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            ></textarea>
          </div>
        </form>
      </Modal>
      <Modal
        open={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setProjectName("");
          setProjectDescription("");
          setUploadedFile(null);
        }}
        title="Upload Project"
        onConfirm={handleFileUpload}
      >
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full p-4 border rounded-lg bg-[#f7fafd]">
              <p className="text-gray-700 text-sm">{uploadedFile.name}</p>
              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div>
              Use this{" "}
              <a
                className="font-semibold text-blue-500 hover:underline cursor-pointer"
                href="https://firebasestorage.googleapis.com/v0/b/project-manager-1c297.firebasestorage.app/o/assets%2Ftasks.xlsx?alt=media&token=4a762cd0-af1b-458f-bff3-a863d45e04a8"
              >
                CSV template
              </a>{" "}
              to format your project data correctly.
            </div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#0f6cbd] rounded-lg cursor-pointer bg-[#f7fafd] hover:bg-[#e6f0fa] transition"
            >
              <svg
                className="w-10 h-10 text-[#0f6cbd] mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm text-[#0f6cbd] font-semibold">
                Click to upload a file
              </span>
              <input
                id="file-upload"
                type="file"
                onChange={handleFile}
                accept=".csv"
                className="hidden"
              />
            </label>
          </div>
        )}
        <div className="mt-4">
          <label
            htmlFor="project-name"
            className="block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0f6cbd] focus:border-[#0f6cbd] sm:text-sm"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label
            htmlFor="project-description"
            className="block text-sm font-medium text-gray-700"
          >
            Project Description
          </label>
          <textarea
            id="project-description"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0f6cbd] focus:border-[#0f6cbd] sm:text-sm"
            placeholder="Enter project description"
            rows={4}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          ></textarea>
        </div>
      </Modal>
    </div>
  );
}
