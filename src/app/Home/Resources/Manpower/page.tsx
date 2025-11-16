import React, { useEffect, useState } from "react";
import Modal from "../../../../components/modal";
import EmployeeRow from "./EmployeeRow";
import type { Employee } from "../../../../types/employee";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../../../../services/firestore/employees";
import { getAuth, type User } from "firebase/auth";
import { listenToEmployees } from "../../../../services/firestore/employees";
import { capitalizeWords } from "../../../../util/string-processing";

const Manpower = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser: User | null = getAuth().currentUser;
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  useEffect(() => {
    if (currentUser) {
      const unsubscribeToEmployees = listenToEmployees(
        currentUser ? currentUser.uid : "",
        setEmployees
      );
      return () => unsubscribeToEmployees();
    }
  }, [currentUser]);

  const validateEmployee = (employee: Employee) => {
    const errors: any = {};
    if (!employee.id.trim()) errors.id = "Employee ID is required.";
    if (!employee.firstName.trim()) {
      errors.firstName = "First Name is required.";
    } else if (!/^[a-zA-Z.\-\s]+$/.test(employee.firstName)) {
      errors.firstName = "Can only contain letters, spaces, '-' or '.'";
    }
    if (!employee.middleName.trim()) {
      errors.middleName = "Middle Name is required.";
    } else if (!/^[a-zA-Z.\-\s]*$/.test(employee.middleName)) {
      errors.middleName =
        "Middle Name can only contain letters, spaces, '-' or '.'";
    }
    if (!employee.lastName.trim()) {
      errors.lastName = "Last Name is required.";
    } else if (!/^[a-zA-Z.\-\s]+$/.test(employee.lastName)) {
      errors.lastName =
        "Last Name can only contain letters, spaces, '-' or '.'";
    }
    if (!/^((\+63)|0)\d{10}$/.test(employee.phoneNumber)) {
      errors.phoneNumber =
        "(Must be in the format: +639XXXXXXXXX or 09XXXXXXXXX).";
    }

    if (
      employee.email.trim() &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(employee.email)
    ) {
      errors.email = "Invalid email format.";
    }
    return errors;
  };

  function trimEmployeeFields(employee: Employee): Employee {
    return {
      id: employee.id.trim(),
      firstName: employee.firstName.trim(),
      middleName: employee.middleName.trim(),
      lastName: employee.lastName.trim(),
      phoneNumber: employee.phoneNumber.trim(),
      email: employee.email.trim(),
    };
  }

  function capitalizedName(employee: Employee): Employee {
    return {
      id: employee.id,
      firstName: capitalizeWords(employee.firstName),
      middleName: capitalizeWords(employee.middleName),
      lastName: capitalizeWords(employee.lastName),
      phoneNumber: employee.phoneNumber,
      email: employee.email,
    };
  }

  function isNameExisting(
    capitalizedNameEmployee: Employee,
    allEmployees: Employee[]
  ): boolean {
    return allEmployees.some((emp) => {
      return (
        emp.firstName === capitalizedNameEmployee.firstName &&
        emp.lastName === capitalizedNameEmployee.lastName &&
        emp.middleName === capitalizedNameEmployee.middleName
      );
    });
  }

  const handleAddEmployee = () => {
    const validationErrors = validateEmployee(newEmployee);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({
      id: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    });

    const trimmedEmployee = trimEmployeeFields(newEmployee);
    const existingEmployee = employees.find(
      (emp) => emp.id === trimmedEmployee.id
    );

    const existingEmailEmployee = employees.find(
      (emp) => emp.email === trimmedEmployee.email
    );

    const existingPhoneEmployee = employees.find(
      (emp) => emp.phoneNumber === trimmedEmployee.phoneNumber
    );

    if (existingEmployee) {
      alert("An employee with this ID already exists. Please use a unique ID.");
      return;
    }

    if (existingEmailEmployee) {
      alert(
        "An employee with this email already exists. Please use a unique email."
      );
      return;
    }

    if (existingPhoneEmployee) {
      alert(
        "An employee with this phone number already exists. Please use a unique phone number."
      );
      return;
    }

    // Cleaning
    if (trimmedEmployee.email === currentUser?.email) {
      alert("Employee email cannot be the same as the current user's email.");
      return;
    }

    const capitalizedNamedEmployee = capitalizedName(trimmedEmployee);

    if (isNameExisting(capitalizedNamedEmployee, employees)) {
      console.log("Duplicate name found");
      alert(
        "An employee with this name already exists. Please use a unique name."
      );
      return;
    }

    // if (currentUser) {
    //   createEmployee(currentUser.uid, capitalizedNamedEmployee);
    // }

    // setIsModalOpen(false);
  };

  const openModal = () => {
    setNewEmployee({
      id: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    });
    setErrors({
      id: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedEmployee = () => {
    setErrors({
      id: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    });

    if (employeeToEdit && currentUser) {
      const validationErrors = validateEmployee(employeeToEdit);
      const trimmedEmployee = trimEmployeeFields(employeeToEdit);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const filteredEmployeesWithoutCurrent = employees.filter(
        (emp) => emp.id !== trimmedEmployee.id
      );

      const existingEmailEmployee = filteredEmployeesWithoutCurrent.find(
        (emp) => emp.email === trimmedEmployee.email
      );

      const existingPhoneEmployee = filteredEmployeesWithoutCurrent.find(
        (emp) => emp.phoneNumber === trimmedEmployee.phoneNumber
      );

      if (existingEmailEmployee) {
        alert(
          "An employee with this email already exists. Please use a unique email."
        );
        return;
      }

      if (existingPhoneEmployee) {
        alert(
          "An employee with this phone number already exists. Please use a unique phone number."
        );
        return;
      }

      // Cleaning
      if (trimmedEmployee.email === currentUser?.email) {
        alert("Employee email cannot be the same as the current user's email.");
        return;
      }

      const capitalizedNamedEmployee = capitalizedName(trimmedEmployee);

      if (
        isNameExisting(
          capitalizedNamedEmployee,
          filteredEmployeesWithoutCurrent
        )
      ) {
        console.log("Duplicate name found");
        alert(
          "An employee with this name already exists. Please use a unique name."
        );
        return;
      }

      updateEmployee(currentUser.uid, capitalizedNamedEmployee);

      setIsEditModalOpen(false);
      setEmployeeToEdit(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#0f6cbd] mb-4">
        Manpower Management
      </h1>

      {/* Add Employee Button */}
      <button
        onClick={openModal}
        className="bg-[#0f6cbd] text-white px-4 py-2 rounded-lg mb-6"
      >
        + Add New Employee
      </button>

      {/* Employee List */}
      <div className="overflow-y-auto h-[440px]">
        <h2 className="text-xl font-semibold text-[#0f6cbd] mb-2">
          Employee List
        </h2>
        {employees.length === 0 ? (
          <p className="text-gray-700">No employees added yet.</p>
        ) : (
          <table className="w-full border border-gray-300 text-left text-sm text-gray-700">
            <thead>
              <tr className="bg-[#0f6cbd] text-white">
                <th className="border border-gray-300 p-3">Employee ID</th>
                <th className="border border-gray-300 p-3">First Name</th>
                <th className="border border-gray-300 p-3">Middle Name</th>
                <th className="border border-gray-300 p-3">Last Name</th>
                <th className="border border-gray-300 p-3">Phone Number</th>
                <th className="border border-gray-300 p-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <EmployeeRow
                  key={index}
                  employee={employee}
                  index={index}
                  onEdit={handleEditEmployee}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Adding Employee */}
      <Modal
        open={isModalOpen}
        setIsOpen={setIsModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddEmployee}
        title="Add New Employee"
      >
        <div className="flex flex-col gap-6 w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Employee ID"
                value={newEmployee.id}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, id: e.target.value })
                }
                onKeyDown={(e) => {
                  const charCode = e.key.charCodeAt(0);
                  if (!/[a-zA-Z0-9]/.test(e.key)) {
                    e.preventDefault(); // Prevent non-alphanumeric characters
                  }
                }}
                className="border border-gray-300 rounded-lg p-2 h-10"
              />
              {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={newEmployee.firstName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstName: e.target.value })
                }
                onKeyDown={(e) => {
                  if (!/[a-zA-Z ]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault(); // Prevent non-alphabetic and non-space characters
                  }
                }}
                className="border border-gray-300 rounded-lg p-2 h-10"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>
            <input
              type="text"
              placeholder="Middle Name"
              value={newEmployee.middleName}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, middleName: e.target.value })
              }
              onKeyDown={(e) => {
                if (!/[a-zA-Z ]/.test(e.key) && e.key !== "Backspace") {
                  e.preventDefault(); // Prevent non-alphabetic and non-space characters
                }
              }}
              className="border border-gray-300 rounded-lg p-2 h-10"
            />
            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={newEmployee.lastName}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, lastName: e.target.value })
                }
                onKeyDown={(e) => {
                  if (!/[a-zA-Z ]/.test(e.key) && e.key !== "Backspace") {
                    e.preventDefault(); // Prevent non-alphabetic and non-space characters
                  }
                }}
                className="border border-gray-300 rounded-lg p-2 h-10"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Phone Number"
              value={newEmployee.phoneNumber}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9+]/g, "");
                setNewEmployee({ ...newEmployee, phoneNumber: numericValue });
              }}
              className="border border-gray-300 rounded-lg p-2 h-10"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Email</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={(e) => {
                    setNewEmployee({
                      ...newEmployee,
                      email: e.target.value,
                    });
                  }}
                  className="border border-gray-300 rounded-lg p-2 h-10 w-full"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      {employeeToEdit && (
        <Modal
          open={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setErrors({
              id: "",
              firstName: "",
              middleName: "",
              lastName: "",
              phoneNumber: "",
              email: "",
            });
          }}
          onConfirm={handleSaveEditedEmployee}
          title="Edit Employee"
        >
          <div className="flex flex-col gap-6 w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeToEdit.id}
                  disabled
                  className="border text-gray-500 border-gray-300 rounded-lg p-2 h-10 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={employeeToEdit.firstName}
                  onChange={(e) =>
                    setEmployeeToEdit({
                      ...employeeToEdit,
                      firstName: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 h-10"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName}</p>
                )}
              </div>
              <input
                type="text"
                placeholder="Middle Name"
                value={employeeToEdit.middleName}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    middleName: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg p-2 h-10"
              />
              {errors.middleName && (
                <p className="text-red-500 text-sm">{errors.middleName}</p>
              )}
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={employeeToEdit.lastName}
                  onChange={(e) =>
                    setEmployeeToEdit({
                      ...employeeToEdit,
                      lastName: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg p-2 h-10"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="Phone Number"
                value={employeeToEdit.phoneNumber}
                onChange={(e) =>
                  setEmployeeToEdit({
                    ...employeeToEdit,
                    phoneNumber: e.target.value,
                  })
                }
                className="border border-gray-300 rounded-lg p-2 h-10"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Email</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Email"
                    value={employeeToEdit.email}
                    onChange={(e) => {
                      setEmployeeToEdit({
                        ...employeeToEdit,
                        email: e.target.value,
                      });
                    }}
                    className="border border-gray-300 rounded-lg p-2 h-10 w-full"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (employeeToEdit && currentUser) {
                  deleteEmployee(currentUser.uid, employeeToEdit.id);
                  setIsEditModalOpen(false);
                  setEmployeeToEdit(null);
                }
              }}
              className="bg-red-500 text-white px-2 py-1 w-20 rounded"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Manpower;
