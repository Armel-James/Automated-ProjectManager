import React, { useState } from "react";

// Props type for the dialog
export interface DialogProps {
  TaskID: number;
  TaskName: string;
  StartDate: Date;
  Duration: number;
  Progress?: number;
  onClose: () => void;
}

const MyDialogTemplate: React.FC<DialogProps> = (props) => {
  const [taskName, setTaskName] = useState<string>(props.TaskName || "");
  const [startDate, setStartDate] = useState<string>(
    props.StartDate ? props.StartDate.toISOString().substring(0, 10) : ""
  );
  const [duration, setDuration] = useState<number>(props.Duration || 1);

  const handleSave = () => {
    props.TaskName = taskName;
    props.StartDate = new Date(startDate);
    props.Duration = duration;
    props.onClose(); // Close the dialog
  };

  return (
    <div style={{ padding: "10px", width: "400px" }}>
      <h3>Edit Task</h3>
      <div>
        <label>Task Name:</label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </div>
      <div>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div>
        <label>Duration:</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        />
      </div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default MyDialogTemplate;
