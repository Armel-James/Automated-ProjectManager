import { db } from "../firebase/config";
import {
  setDoc,
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import type { Employee } from "../../types/employee";

export async function createEmployee(userId: string, employee: Employee) {
  const employeeRef = doc(
    collection(db, "users", userId, "employees"),
    employee.id
  );
  await setDoc(employeeRef, employee);
}

export function listenToEmployees(
  userId: string,
  callback: (employees: Employee[]) => void
) {
  const employeesRef = collection(db, "users", userId, "employees");
  return onSnapshot(employeesRef, (snapshot) => {
    const employees: Employee[] = [];
    snapshot.forEach((doc) => {
      employees.push(doc.data() as Employee);
    });
    callback(employees);
  });
}

export function getEmployeesCollectionRef(userId: string) {
  return collection(db, "users", userId, "employees");
}

export function deleteEmployee(userId: string, employeeId: string) {
  const employeeRef = doc(db, "users", userId, "employees", employeeId);
  return deleteDoc(employeeRef);
}

export function updateEmployee(userId: string, employee: Employee) {
  const employeeRef = doc(db, "users", userId, "employees", employee.id);
  return updateDoc(employeeRef, {
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    phoneNumber: employee.phoneNumber,
    email: employee.email,
  });
}

export async function getUserEmployees(userId: string) {
  const colRef = collection(db, "users", String(userId), "employees");
  const snapshot = await getDocs(colRef);

  const employees = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return employees; // Return the array of employee objects
}
