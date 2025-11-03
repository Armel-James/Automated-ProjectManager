import ProjectView from "./Project/page";
import Home from "./Home/page";
import Landing from "./Landing/page";
import { Test } from "./test";
import Tasks from "./Project/Tasks/page";
import MyTasks from "./MemberViews/My-Tasks/page";
import TeamTasks from "./MemberViews/Teams-Tasks/page";
import Reports from "./Project/Reports/page";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/project" element={<ProjectView />} />
        <Route path="/test" element={<Test />} />
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/reports/:id" element={<Reports projectId={""} />} />
        <Route path="/mytasks/:projectId" element={<MyTasks />} />
        <Route path="/teamtasks/:projectId" element={<TeamTasks />} />
      </Routes>
    </Router>
  );
}

export default App;
