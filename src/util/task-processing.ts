import type { Member } from "../types/member";
import type { Task } from "../types/task";

export function changedTaskFields(oldTask: Task, newTask: Task) {
  if (newTask.docId != newTask.docId) return null;

  const changes = {} as Task;

  if (newTask.name != oldTask.name) {
    changes.name = newTask.name;
  }
  if (newTask.duration != oldTask.duration) {
    changes.duration = newTask.duration;
  }
  if (newTask.notes != oldTask.notes) {
    changes.notes = newTask.notes;
  }
  if (newTask.progress != oldTask.progress) {
    changes.progress = newTask.progress;
  }
  if (newTask.startDate.toString() != oldTask.startDate.toString()) {
    changes.startDate = newTask.startDate;
  }

  if (newTask.dependency != oldTask.dependency) {
    changes.dependency = newTask.dependency;
  }

  if (newTask.totalCost != oldTask.totalCost) {
    changes.totalCost = newTask.totalCost;
  }

  if (
    newTask.assignedResource?.length === oldTask.assignedResource?.length &&
    newTask.assignedResource?.every(
      (val, index) => val === oldTask.assignedResource?.[index]
    )
  ) {
    console.log("No changes in assigned members");
  }

  // TODO: save the assigned member ids on firestore as well
  //
  //
  //
  //
  //
  //
  //

  return changes;
}

// TODO: row ordering here
export function reorderRows() {}
