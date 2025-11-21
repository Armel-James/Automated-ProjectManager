import React, { useState } from "react";
import Manpower from "./Manpower/page";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("Manpower");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#0f6cbd] mb-4">
        Manpower Management
      </h1>

      {/* Tabs Content */}
      <div>{activeTab === "Manpower" && <Manpower />}</div>
    </div>
  );
};

export default Resources;
