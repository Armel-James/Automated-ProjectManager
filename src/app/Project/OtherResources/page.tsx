import React, { useEffect, useState } from "react";
import Modal from "../../../components/modal";
import {
  addOtherResource,
  deleteOtherResource,
  listenToOtherResources,
  updateOtherResource,
} from "../../../services/firestore/otherresource";
import type { OtherResource } from "../../../types/other-resource";

interface OtherResourcesPageProps {
  projectId: string;
}

const initialResource: OtherResource = {
  id: "",
  name: "",
  details: "",
  category: "Tool",
  quantity: 0,
  pricePerQuantity: 0,
  provider: "",
};

export default function OtherResourcesPage({
  projectId,
}: OtherResourcesPageProps) {
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (projectId) {
      const unsubscribeToOtherResources = listenToOtherResources(
        projectId,
        (fetchedResources) => {
          setResources(fetchedResources);
        }
      );
      return () => unsubscribeToOtherResources();
    }
  }, [projectId]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState<OtherResource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalResource, setCurrentModalResource] =
    useState<OtherResource>(initialResource);
  const [isEditing, setIsEditing] = useState(false);
  useState<OtherResource | null>(null);

  useEffect(() => {
    const cost = resources.reduce((sum, resource) => {
      return sum + resource.quantity * resource.pricePerQuantity;
    }, 0);
    setTotalCost(cost);
  }, [resources]);

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      filter === "all" || resource.category.toLowerCase() === filter;
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentModalResource((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "pricePerQuantity"
          ? Math.max(0, parseFloat(value)) // Prevent negative numbers
          : value,
    }));
  };

  function handleEditResource(resource: OtherResource) {
    setIsEditing(true);
    setCurrentModalResource({
      id: resource.id,
      name: resource.name,
      details: resource.details,
      category: resource.category,
      quantity: resource.quantity,
      pricePerQuantity: resource.pricePerQuantity,
      provider: resource.provider,
    });
    setIsModalOpen(true);
  }

  const handleSaveResource = () => {
    if (currentModalResource.name.trim() === "") {
      alert("Name is required.");
      return;
    }
    if (currentModalResource.quantity < 0) {
      alert("Quantity cannot be negative.");
      return;
    }
    if (currentModalResource.pricePerQuantity < 0) {
      alert("Price per Quantity cannot be negative.");
      return;
    }

    if (isNaN(currentModalResource.pricePerQuantity)) {
      alert("Price per Quantity is required.");
      return;
    }

    if (
      isNaN(currentModalResource.quantity) ||
      currentModalResource.quantity <= 0
    ) {
      alert("Quantity must be greater than zero.");
      return;
    }

    if (currentModalResource.provider.trim() === "") {
      alert("Provider is required.");
      return;
    }

    if (isEditing) {
      console.log("Updating resource:", currentModalResource);
      // Update existing resource
      updateOtherResource(projectId, currentModalResource);
      setIsEditing(false);
    } else {
      addOtherResource(projectId, currentModalResource);
    }

    setIsModalOpen(false);
    setCurrentModalResource(initialResource);
  };

  function handleAddNewResource() {
    setIsModalOpen(true);
  }

  return (
    <div className="w-full p-8 flex flex-col gap-8 items-start">
      <h2 className="text-3xl font-bold text-[#0f6cbd] mb-1 tracking-tight">
        Tools, Equipment & Materials
      </h2>

      {/* Total Cost Display */}
      <div className="w-full bg-[#eaf4ff] border-l-4 border-[#0f6cbd] p-4 rounded-lg mb-1">
        <h3 className="text-lg font-semibold text-[#0f6cbd]">
          Total Cost of Resources
        </h3>
        <p className="text-2xl font-bold">
          ₱{totalCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
      </div>

      {/* Filter and Search Inputs */}
      <div className="w-full flex flex-col md:flex-row items-center gap-4 mb-1">
        <select
          className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="tool">Tool</option>
          <option value="equipment">Equipment</option>
          <option value="material">Material</option>
        </select>

        <input
          type="text"
          placeholder="Search by name"
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="ml-auto">
          <button
            className="bg-[#0f6cbd] text-white font-semibold rounded-lg px-6 py-2 hover:bg-[#155a8a] text-sm transition shadow"
            onClick={handleAddNewResource}
          >
            Add New Resource
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow p-1">
        <div className="overflow-x-auto rounded-xl max-h-[420px] overflow-y-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#f4f8fb] text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Details</th>
                <th className="py-3 px-4 text-left font-semibold">Category</th>
                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Price per Quantity
                </th>
                <th className="py-3 px-4 text-left font-semibold">Provider</th>
              </tr>
            </thead>
            <tbody className="max-h-96">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource, index) => (
                  <tr
                    key={resource.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-[#f7fafd]"
                    } hover:bg-[#dceefb] cursor-pointer transition-colors duration-200`}
                    onClick={() => handleEditResource(resource)}
                  >
                    <td className="py-3 px-4">{resource.name}</td>
                    <td className="py-3 px-4">
                      {resource.details === "" ? "N/A" : resource.details}
                    </td>
                    <td className="py-3 px-4">{resource.category}</td>
                    <td className="py-3 px-4">{resource.quantity}</td>
                    <td className="py-3 px-4">₱{resource.pricePerQuantity}</td>
                    <td className="py-3 px-4">{resource.provider}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        title={isEditing ? "Edit Resource" : "Add New Resource"}
        setIsOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setCurrentModalResource(initialResource);
        }}
        onConfirm={handleSaveResource}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.category}
              onChange={handleInputChange}
            >
              <option value="Tool">Tool</option>
              <option value="Equipment">Equipment</option>
              <option value="Material">Material</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.quantity}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="pricePerQuantity"
              placeholder="Price per Quantity"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.pricePerQuantity}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="provider"
              placeholder="Provider"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.provider}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <input
              type="text"
              name="details"
              placeholder="Details"
              className="border border-gray-300 rounded-lg p-2 w-full"
              value={currentModalResource.details}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            {isEditing && (
              <button
                className="bg-red-500 text-white font-semibold rounded-lg px-4 py-2 hover:bg-red-600 text-sm transition shadow"
                onClick={() => {
                  deleteOtherResource(projectId, currentModalResource.id!);
                  setCurrentModalResource(initialResource);
                  setIsModalOpen(false);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
