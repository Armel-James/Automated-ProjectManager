import type { Project } from "../../../../types/project";
import ProjectCard from "../../../../components/project-card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../services/firebase/auth-context";
import { useEffect, useState } from "react";
import type { Employee } from "../../../../types/employee";
import { listenToEmployees } from "../../../../services/firestore/employees";

interface AssociatedProjectsProps {
  projectsAssociated: Project[];
  projectId?: string;
}

export default function AssociatedProjects({
  projectsAssociated,
}: AssociatedProjectsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userEmail = user?.email;

  const handleCardClick = (projectId: string) => {
    console.log("Navigating to project:", projectId);
    navigate(`/mytasks/${projectId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {projectsAssociated != undefined && projectsAssociated?.length > 0 ? (
        projectsAssociated
          ?.filter((project) => project.ownerID !== user?.uid) // Exclude owned projects
          .map(
            (project) =>
              project.id != undefined && (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onCardClick={() => handleCardClick(project.id ?? "")}
                  isAssociated={true}
                />
              )
          )
      ) : (
        <p className="col-span-full text-center text-gray-400 py-10">
          It seems like there's nothing here yet.
        </p>
      )}
    </div>
  );
}
