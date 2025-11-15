import React, { useState } from "react";
import Manpower from "./Manpower/page";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("Manpower");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#0f6cbd] mb-4">Resources</h1>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#b3d1ea] mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Manpower"
              ? "text-[#0f6cbd] border-b-2 border-[#0f6cbd]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Manpower")}
        >
          Manpower
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "Equipment"
              ? "text-[#0f6cbd] border-b-2 border-[#0f6cbd]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("Equipment")}
        >
          Tools & Equipment
        </button>
      </div>

      {/* Tabs Content */}
      <div>
        {activeTab === "Manpower" && <Manpower />}
        {activeTab === "Equipment" && (
          <div>
            <h2 className="text-xl font-semibold text-[#0f6cbd] mb-2">
              Equipment
            </h2>
            <p className="text-gray-700">
              Track and allocate equipment for your projects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
