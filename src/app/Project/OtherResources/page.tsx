import React, { useState } from "react";

interface OtherResourcesPageProps {
  projectId: string;
}

export default function OtherResourcesPage({
  projectId,
}: OtherResourcesPageProps) {
  const [filter, setFilter] = useState("all");

  const resources = [
    { name: "Hammer", category: "Tool", quantity: "15", status: "Available" },
    {
      name: "Drill Machine",
      category: "Equipment",
      quantity: "5",
      status: "In Use",
    },
    {
      name: "Cement",
      category: "Material",
      quantity: "50 Bags",
      status: "Low Stock",
    },
  ];

  const filteredResources =
    filter === "all"
      ? resources
      : resources.filter(
          (resource) => resource.category.toLowerCase() === filter
        );

  return (
    <div className="w-full p-8 flex flex-col gap-8 items-start">
      <h2 className="text-3xl font-bold text-[#0f6cbd] mb-7 tracking-tight">
        Tools, Equipment & Materials
      </h2>

      {/* Filter Dropdown */}
      <div className="w-full flex items-center gap-4 mb-5">
        <select
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="tool">Tool</option>
          <option value="equipment">Equipment</option>
          <option value="material">Material</option>
        </select>
      </div>

      {/* Resources Table */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow p-8">
        <div className="overflow-x-auto rounded-xl max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#f4f8fb] text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">
                  Resource Name
                </th>
                <th className="py-3 px-4 text-left font-semibold">Category</th>
                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-[#f7fafd]"
                    } hover:bg-[#e6f0fa] cursor-pointer`}
                  >
                    <td className="py-3 px-4">{resource.name}</td>
                    <td className="py-3 px-4">{resource.category}</td>
                    <td className="py-3 px-4">{resource.quantity}</td>
                    <td className="py-3 px-4">{resource.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button className="bg-[#0f6cbd] text-white font-semibold rounded-lg px-6 py-2 hover:bg-[#155a8a] text-sm transition shadow">
        Add New Resource
      </button>
    </div>
  );
}
