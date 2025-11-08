import { auth } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";
import notifIcon from "../../assets/images/notification.png";
import helpIcon from "../../assets/images/help.png";
import homeIcon from "../../assets/images/home.png";
import Projects from "./Projects/page";
import { useAuth } from "../../services/firebase/auth-context";
import NavDropdown from "../../components/nav-dropdown";

import { useState } from "react";
import NotificationItem from "../../components/notification-item";
import NotifDropdown from "../../components/notif-dropdown";

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  if (!auth.currentUser) {
    navigate("/");
  }
  if (!user) {
    console.log("No user logged in");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <nav className="sticky top-0 z-30 w-full bg-[#eaf3fb] border-b border-[#b3d1ea]">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4 py-2">
          {/* Home Icon */}
          <div className="flex items-center">
            <img
              src={homeIcon}
              className="w-9 h-9 p-2 rounded-xl bg-[#e6f0fa]"
            />
            <div className="text-xl font-bold text-[#155a8a] tracking-tight select-none">
              Slope
            </div>
          </div>
          {/* App Name */}

          {/* Right-side Icons */}
          <div className="flex items-center gap-3">
            {/* Notification Dropdown */}

            {/* User Dropdown */}
            <NavDropdown actions={{ Logout: () => logout() }}>
              <img
                src={user?.photoURL || ""}
                className="rounded-full w-7 h-7 object-cover border border-[#b3d1ea]"
              />
            </NavDropdown>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Projects />
        </div>
      </main>
    </div>
  );
}
