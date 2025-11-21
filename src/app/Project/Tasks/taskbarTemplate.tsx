import React, { useEffect } from "react";

export const TaskbarTemplate = (props: any) => {
  const taskData = props.taskData || {};
  const progress = taskData.progress || 0;
  const hasResources =
    taskData.assignedResource && taskData.assignedResource.length > 0;

  const hasManpowerResource = taskData.assignedResource?.some(
    (resource: any) => {
      return resource.group === "Manpower";
    }
  );

  const hasOtherResource = taskData.assignedResource?.some((resource: any) => {
    return resource.group !== "Manpower";
  });

  useEffect(() => {
    // You can add any side effects or logging here if needed
    console.log(
      "Rendering TaskbarTemplate with progress:",
      progress,
      "and resources:",
      props
    );
  }, [progress, props.Resources]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "4px",
        background: "#d3d3d3", // Updated to a lighter gray
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          background: "#0f6cbd", // Updated to primary color
          height: "100%",
          borderRadius: "4px",
          width: `${progress}%`, // Set width based on progress
        }}
      ></div>

      {/* Manpower resource indicator */}
      <div
        style={{
          position: "absolute",
          left: "40%", // Center horizontally
          top: "-5px", // Position above the taskbar
          transform: "translateX(-50%)", // Center alignment
          width: "10px",
          height: "10px",
          background: hasManpowerResource ? "#3498DB" : "#d3d3d3", // Blue for manpower, gray if false
          borderRadius: "50%",
          border: "1px solid #fff",
          boxShadow: "0 0 3px rgba(0,0,0,0.3)",
        }}
      ></div>

      {/* Other resource indicator */}
      <div
        style={{
          position: "absolute",
          left: "60%", // Center horizontally
          top: "-5px", // Position above the manpower indicator
          transform: "translateX(-50%)", // Center alignment
          width: "10px",
          height: "10px",
          background: hasOtherResource ? "#E67E22" : "#d3d3d3", // Orange for other resources, gray if false
          borderRadius: "50%",
          border: "1px solid #fff",
          boxShadow: "0 0 3px rgba(0,0,0,0.3)",
        }}
      ></div>
    </div>
  );
};
