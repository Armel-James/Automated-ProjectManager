import React from "react";

interface Employee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface EmployeeRowProps {
  employee: Employee;
  index: number;
  onEdit: (employee: Employee) => void;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  index,
  onEdit,
}) => {
  return (
    <tr
      className={`${
        index % 2 === 0 ? "bg-[#eaf3fb]" : "bg-white"
      } hover:bg-[#d1e7f7] transition-colors duration-200 cursor-pointer`}
      onClick={() => onEdit(employee)}
    >
      <td className="border border-gray-300 p-3">{employee.id}</td>
      <td className="border border-gray-300 p-3">{employee.firstName}</td>
      <td className="border border-gray-300 p-3">{employee.middleName}</td>
      <td className="border border-gray-300 p-3">{employee.lastName}</td>
      <td className="border border-gray-300 p-3">{employee.phoneNumber}</td>
      <td className="border border-gray-300 p-3">{employee.email}</td>
    </tr>
  );
};

export default EmployeeRow;
