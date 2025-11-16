import { useEffect, useState } from "react";
import Modal from "../../../components/modal";
import type { Member } from "../../../types/member";
import type { Team } from "../../../types/team";
import {
  addMember,
  deleteMember,
  updateMember,
} from "../../../services/firestore/members";
import { listenToProjectMembers } from "../../../services/firestore/members";
import {
  addTeam,
  deleteTeam,
  onTeamsSnapshot,
  updateTeam,
} from "../../../services/firestore/teams";
import { useAuth } from "../../../services/firebase/auth-context";
import type { Employee } from "../../../types/employee";
import { listenToEmployees } from "../../../services/firestore/employees";

interface MembersManagementProps {
  projectId: string;
}

export default function MembersManagement({
  projectId,
}: MembersManagementProps) {
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubscribeTeams = onTeamsSnapshot(projectId, setTeams);
    const unsubscribeGlobalEmployees = listenToEmployees(
      user?.uid || "",
      setGlobalEmployees
    );
    const unsubscribeMember = listenToProjectMembers(projectId, setMembers);
    return () => {
      unsubscribeMember();
      unsubscribeTeams();
      unsubscribeGlobalEmployees();
    };
  }, [projectId, user]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editMember, setEditMember] = useState<Partial<Member>>({});
  const [employeeSearchType, setEmployeeSearchType] = useState<"id" | "name">(
    "id"
  );
  const [employeeSearchValue, setEmployeeSearchValue] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setnewRole] = useState<string[]>([]);
  const [newPhoneNumber, setnewPhoneNumber] = useState("");
  const [newMemberTeamName, setNewMemberTeamName] = useState<string>("None");
  const [newLevel, setNewLevel] = useState<"Leader" | "Member">("Member");
  const [members, setMembers] = useState<Member[]>([]);

  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [filteredGlobalEmployees, setFilteredGlobalEmployees] = useState<
    Employee[]
  >([]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");

  // Team edit state
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState<string>("");

  useEffect(() => {
    handleFilterGlobalEmployees();
  }, [employeeSearchValue, employeeSearchType, globalEmployees]);

  function handleFilterGlobalEmployees() {
    if (!employeeSearchValue.trim()) {
      setFilteredGlobalEmployees([]);
      return;
    }
    const filtered = globalEmployees.filter((employee) => {
      if (employeeSearchType === "id") {
        return employee.id
          .toLowerCase()
          .includes(employeeSearchValue.toLowerCase());
      } else if (employeeSearchType === "name") {
        return (
          employee.firstName +
          " " +
          employee.middleName +
          " " +
          employee.lastName
        )
          .toLowerCase()
          .includes(employeeSearchValue.toLowerCase());
      }
      return false;
    });
    setFilteredGlobalEmployees(filtered);
  }

  const handleAddMember = () => {
    console.log(inputFields);
    return;
    if (
      !newFullName.trim() ||
      !newEmail.trim() ||
      !newRole.length ||
      !newPhoneNumber.trim() ||
      !newLevel.trim() ||
      newMemberTeamName.trim() === "None"
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPhoneNumber)
      if (!emailRegex.test(newEmail)) {
        alert("Please enter a valid email address.");
        return;
      }

    if (user && user.email === newEmail) {
      alert("You can't add your own email here.");
      return;
    }

    if (members.some((m) => m.emailAddress === newEmail)) {
      alert("This email is already a member.");
      return;
    }

    addMember(projectId, {
      name: newFullName,
      emailAddress: newEmail,
      role: newRole.join(", "),
      phoneNumber: newPhoneNumber,
      teamName: newTeamName === "None" ? undefined : newMemberTeamName,
      level: newLevel,
    } as Omit<Member, "id">).then((id) => {
      setMembers([
        ...members,
        {
          id: id,
          name: newFullName,
          emailAddress: newEmail,
          role: newRole.join(", "),
          phoneNumber: newPhoneNumber,
          level: newLevel,
          teamName:
            newMemberTeamName === "None" ? undefined : newMemberTeamName,
        },
      ]);
      setNewFullName("");
      setNewEmail("");
      setnewRole([]);
      setnewPhoneNumber("");
    });
    setIsModalOpen(false);
  };

  const [searchType, setSearchType] = useState<
    "name" | "email" | "role" | "team" | "level"
  >("name");
  const [searchValue, setSearchValue] = useState("");

  const filteredMembers = members.filter((m) => {
    if (!searchValue) return true;
    if (searchType === "name")
      return m.name.toLowerCase().includes(searchValue.toLowerCase());
    if (searchType === "email")
      return m.emailAddress.toLowerCase().includes(searchValue.toLowerCase());
    if (searchType === "role")
      return m.role.toLowerCase().includes(searchValue.toLowerCase());
    if (searchType === "team") {
      return (
        teams
          .find((t) => t.name === m.teamName)
          ?.name.toLowerCase()
          .includes(searchValue.toLowerCase()) || false
      );
    }
    if (searchType === "level") {
      return m.level.toLowerCase().includes(searchValue.toLowerCase());
    }
    return true;
  });

  function handleEdit(idx: number, m: Member) {
    setEditIdx(idx);
    setEditMember({ ...m });
  }

  function handleEditChange(field: keyof Member, value: string) {
    setEditMember((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditSave(idx: number) {
    const oldEmailAddress = members[idx].emailAddress;
    // console.log("Old email address:", oldEmailAddress);
    // console.log("New email address:", editMember.emailAddress);
    updateMember(
      projectId,
      editMember.id!,
      editMember as Member,
      oldEmailAddress
    ).catch((e) => {
      console.log("Error updating member:", e);
    });

    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...editMember } : m))
    );

    setEditIdx(null);
    setEditMember({});
  }

  function handleEditCancel() {
    setEditIdx(null);
    setEditMember({});
  }

  function handleEditTeam(team: Team) {
    setEditTeamId(team.id);
    setEditTeamName(team.name);
  }

  function handleSaveTeam(teamId: string) {
    if (!editTeamName.trim()) return;

    const currentTeamName = teams.find((t) => t.id === teamId)?.name;

    // for (const member of members) {
    //   if (member.teamName === currentTeamName) {
    //     console.log("Updating member:", member.id);
    //     updateMember(projectId, member.id, { teamName: editTeamName });
    //   }
    // }

    updateTeam(projectId, teamId, { name: editTeamName }).then(() => {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, name: editTeamName } : t))
      );
    });

    setEditTeamId(null);
    setEditTeamName("");
  }

  function handleCancelEditTeam() {
    setEditTeamId(null);
    setEditTeamName("");
  }

  function handleDeleteTeam(teamId: Team) {
    if (members.some((m) => m.teamName === teamId.name)) {
      alert("Cannot delete team with existing members.");
      return;
    }

    if (confirm("Are you sure you want to delete this team?")) {
      deleteTeam(projectId, teamId.id);
    }
  }

  // New state for search results
  const [searchResults, setSearchResults] = useState<Member[]>([]);

  // New function to handle member search
  function handleSearch(value: string) {
    if (!value) {
      setSearchResults([]);
      return;
    }

    const results = members.filter(
      (m) =>
        m.emailAddress.toLowerCase().includes(value.toLowerCase()) ||
        m.id.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
  }

  // New function to handle member selection from search results
  function handleSelectMember(member: Member) {
    setEditMember(member);
    setIsModalOpen(true);
  }

  const [inputFields, setInputFields] = useState([""]); // Initial state with one empty input

  const handleAddField = () => {
    setInputFields([...inputFields, ""]); // Add a new empty string to the array
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = inputFields.filter((_, i) => i !== index);
    setInputFields(updatedFields);
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedFields = inputFields.map((field, i) =>
      i === index ? event.target.value : field
    );
    setInputFields(updatedFields);
  };

  return (
    <div className="w-full p-8 flex flex-row gap-8 justify-between items-start">
      {/* Members Section (left) */}
      <div className="flex-1 flex flex-col items-center order-1">
        <h2 className="text-3xl font-bold mr-auto text-[#0f6cbd] mb-7 tracking-tight">
          Project Teams
        </h2>
        {/* Filters & Actions Bar */}
        <div className="w-full flex flex-col md:flex-row md:items-center gap-4 mb-5 bg-[#f7fafd] rounded-2xl border border-gray-200 shadow p-6">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="border border-gray-300 text-sm rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="team">Team</option>
              <option value="level">Level</option>
            </select>
            <input
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm"
              type="text"
              placeholder={`Search by ${searchType}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <button
            className="bg-[#0f6cbd] text-white font-semibold rounded-lg px-6 py-2 hover:bg-[#155a8a] text-sm transition shadow w-full md:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Add New Member
          </button>
        </div>

        {/* Modal for Add New Member */}
        <Modal
          open={isModalOpen}
          setIsOpen={setIsModalOpen}
          title="Add New Member"
          isViewOnly={false}
          onClose={() => {
            setIsModalOpen(false);
            setNewFullName("");
            setNewEmail("");
            setnewRole([]); // Updated to handle multiple roles
            setnewPhoneNumber("");
            setNewMemberTeamName("None");
            setNewLevel("Member");
          }}
          onConfirm={handleAddMember}
        >
          <div className="flex flex-col gap-4 w-xl">
            {/* Search Input */}
            <div className="flex gap-2 items-center">
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={employeeSearchType}
                onChange={(e) =>
                  setEmployeeSearchType(e.target.value as "id" | "name")
                }
              >
                <option value="id">Search by ID</option>
                <option value="name">Search by Name</option>
              </select>
              <input
                type="text"
                placeholder={`Search by ${employeeSearchType}`}
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={employeeSearchValue}
                onChange={(e) => setEmployeeSearchValue(e.target.value)}
              />
            </div>

            <select
              size={5}
              className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm bg-white shadow-sm"
            >
              {employeeSearchValue === "" ? (
                globalEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.lastName}, {employee.firstName} - (
                    {`${employee.id}`})
                  </option>
                ))
              ) : filteredGlobalEmployees.length === 0 ? (
                <option disabled>No employees found.</option>
              ) : (
                filteredGlobalEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.lastName}, {employee.firstName} - (
                    {`${employee.id}`})
                  </option>
                ))
              )}
            </select>

            {/* Team and Level Select Side by Side */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label className="flex-1 text-sm font-medium text-gray-700">
                  Team
                  <select
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm bg-white shadow-sm"
                    value={newMemberTeamName}
                    onChange={(e) => setNewMemberTeamName(e.target.value)}
                  >
                    <option value="None">None</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex-1 text-sm font-medium text-gray-700">
                  Level
                  <select
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0f6cbd] text-sm bg-white shadow-sm"
                    value={newLevel}
                    onChange={(e) =>
                      setNewLevel(e.target.value as "Leader" | "Member")
                    }
                  >
                    <option value="Leader">Leader</option>
                    <option value="Member">Member</option>
                  </select>
                </label>
              </div>

              {/* HERE */}
              {/* Roles Select */}
              <label className="text-sm font-medium text-gray-700">
                Roles
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex flex-col gap-2 h-[130px] overflow-y-auto">
                    {inputFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
                      >
                        <input
                          type="text"
                          value={field}
                          onChange={(e) => handleChange(index, e)}
                          className="flex-1 border-none bg-transparent focus:outline-none"
                          placeholder="Enter role"
                        />
                        {index === 0 ? null : (
                          <button
                            onClick={() => handleRemoveField(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddField}
                    className="bg-[#0f6cbd] text-white font-semibold rounded-lg px-4 py-2 hover:bg-[#155a8a] text-sm transition shadow"
                  >
                    Add Role
                  </button>
                </div>
              </label>
            </div>
          </div>
        </Modal>

        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow p-8">
          <div className="overflow-x-auto rounded-xl max-h-[420px] overflow-y-auto">
            <table className="w-full border-collapse rounded-xl overflow-hidden">
              <thead className="sticky top-0 z-20">
                <tr className="bg-[#f4f8fb] text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Phone</th>
                  <th className="py-3 px-4 text-center font-semibold">Role</th>
                  <th className="py-3 px-4 text-center font-semibold">Team</th>
                  <th className="py-3 px-4 text-center font-semibold">Level</th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No members found.
                    </td>
                  </tr>
                )}
                {filteredMembers.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#f7fafd]"
                    } hover:bg-[#e6f0fa]`}
                  >
                    {editIdx === idx ? (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e6f0fa] text-[#0f6cbd] font-bold text-base shadow-sm">
                            {getInitials(editMember.name || "")}
                          </span>
                          <input
                            className="border rounded px-2 py-1 text-sm w-32"
                            value={editMember.name || ""}
                            onChange={(e) =>
                              handleEditChange("name", e.target.value)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                          <input
                            className="border rounded px-2 py-1 text-sm w-40"
                            value={editMember.emailAddress || ""}
                            onChange={(e) =>
                              handleEditChange("emailAddress", e.target.value)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                          <input
                            className="border rounded px-2 py-1 text-sm w-28"
                            value={editMember.phoneNumber || ""}
                            onChange={(e) =>
                              handleEditChange(
                                "phoneNumber",
                                e.target.value.replace(/[^0-9()+\-\s]/g, "")
                              )
                            }
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            className="border rounded px-2 py-1 text-sm w-24"
                            value={editMember.role || ""}
                            onChange={(e) =>
                              handleEditChange("role", e.target.value)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {/* Team select placeholder */}
                          <select
                            className="border rounded px-2 py-1 text-sm w-24"
                            value={editMember.teamName || "None"}
                            onChange={(e) =>
                              handleEditChange("teamName", e.target.value)
                            }
                          >
                            <option value={"None"}>None</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.name}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            className="border rounded px-2 py-1 text-sm w-20"
                            value={editMember.level || "member"}
                            onChange={(e) =>
                              handleEditChange("level", e.target.value)
                            }
                          >
                            <option value={"Leader"}>Leader</option>
                            <option value={"Member"}>Member</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 flex gap-2 justify-center items-center">
                          <button
                            className="bg-[#0f6cbd] text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#155a8a] shadow-sm"
                            title="Save"
                            onClick={() => handleEditSave(idx)}
                          >
                            ✔
                          </button>
                          <button
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#e6f0fa] shadow-sm"
                            title="Cancel"
                            onClick={handleEditCancel}
                          >
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e6f0fa] text-[#0f6cbd] font-bold text-base shadow-sm">
                            {getInitials(m.name)}
                          </span>
                          {m.name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                          {m.emailAddress}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-700">
                          {m.phoneNumber || "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ${
                              m.role === "Admin"
                                ? "bg-[#e6f0fa] text-[#0f6cbd]"
                                : m.role === "Editor"
                                ? "bg-[#eaf7e6] text-[#0f6cbd]"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block bg-[#e6f0fa] text-[#0f6cbd] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {m.teamName ?? "None"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {m.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2 justify-center items-center">
                          <button
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#e6f0fa] shadow-sm"
                            title="Edit"
                            onClick={() => handleEdit(idx, m)}
                          >
                            ✎
                          </button>
                          <button
                            className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200 shadow-sm"
                            title="Remove"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove this member?"
                                )
                              ) {
                                deleteMember(projectId, m.id, m.emailAddress);
                                setMembers((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                );
                              }
                            }}
                          >
                            🗑
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team CRUD - Right Section (right) */}
      <aside className="w-[340px] min-w-[280px] bg-gradient-to-br from-[#e6f0fa] via-[#f7fafd] to-white rounded-2xl border border-[#0f6cbd] shadow p-7 flex flex-col gap-7 relative overflow-hidden order-2">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#0f6cbd]/10 rounded-bl-full pointer-events-none" />
        <h3 className="text-2xl font-extrabold text-[#0f6cbd] mb-2 tracking-tight flex items-center gap-2">
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            className="text-[#0f6cbd]"
          >
            <circle cx="12" cy="12" r="10" fill="#e6f0fa" />
            <path
              d="M12 13.5c2.485 0 4.5.672 4.5 1.5V17h-9v-2c0-.828 2.015-1.5 4.5-1.5zm0-1.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              fill="#0f6cbd"
            />
          </svg>
          Teams
        </h3>
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <input
              className="border border-[#b3d1f7] rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#0f6cbd]/30 bg-white/80 shadow placeholder:text-[#0f6cbd]/40"
              type="text"
              placeholder="New team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-[#0f6cbd] to-[#155a8a] text-white rounded-xl px-4 py-2 text-sm font-semibold shadow hover:from-[#155a8a] hover:to-[#0f6cbd] transition"
              onClick={() => {
                // Validations
                if (!newTeamName.trim()) return;
                if (
                  teams.some(
                    (t) => t.name.toLowerCase() === newTeamName.toLowerCase()
                  )
                ) {
                  alert("This team already exists.");
                  return;
                }

                // Add team
                addTeam(projectId, newTeamName).then((id) => {
                  setTeams([...teams, { id: id, name: newTeamName }]);
                });
                setNewTeamName("");
              }}
            >
              Add
            </button>
          </div>
          <ul className="flex flex-col gap-3 h-140 overflow-y-auto ">
            {/* Example team items */}
            {teams.map((team) =>
              editTeamId === team.id ? (
                <li
                  key={team.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#b3d1f7]"
                >
                  <input
                    className="border border-[#b3d1f7] rounded-lg px-2 py-1 text-sm font-semibold text-[#0f6cbd] flex-1 mr-2 bg-white"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-[#0f6cbd] text-white px-2 py-1 rounded-lg text-xs font-semibold hover:bg-[#155a8a] shadow"
                      title="Save"
                      onClick={() => handleSaveTeam(team.id)}
                    >
                      ✔
                    </button>
                    <button
                      className="bg-[#e6f0fa] text-[#0f6cbd] px-2 py-1 rounded-lg text-xs font-semibold hover:bg-[#b3d1f7] shadow"
                      title="Cancel"
                      onClick={handleCancelEditTeam}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={team.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#b3d1f7] hover:bg-[#e6f0fa] transition"
                >
                  <span className="font-semibold text-[#0f6cbd] flex items-center gap-2">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" fill="#e6f0fa" />
                      <path
                        d="M12 13c1.657 0 3 .448 3 1v1H9v-1c0-.552 1.343-1 3-1zm0-1a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                        fill="#0f6cbd"
                      />
                    </svg>
                    {team.name}
                  </span>
                  <div className="flex gap-2">
                    {/* <button
                      className="bg-[#e6f0fa] text-[#0f6cbd] px-2 py-1 rounded-lg text-xs font-semibold hover:bg-[#b3d1f7] shadow"
                      title="Edit"
                      onClick={() => handleEditTeam(team)}
                    >
                      ✎
                    </button> */}
                    <button
                      className="bg-[#ffeaea] text-[#d43f3a] px-2 py-1 rounded-lg text-xs font-semibold hover:bg-[#ffd6d6] shadow"
                      title="Delete"
                      onClick={() => handleDeleteTeam(team)}
                    >
                      🗑
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
