import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/admin-dashboard" },
  { label: "Team", path: "/team" },
  { label: "Members", path: "/members" },
  { label: "Analytics", path: "/analytics" },
  { label: "Settings", path: "/settings" },
];

interface SidebarProps {
  teamName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ teamName }) => {
  const location = useLocation();
  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-6 font-bold text-2xl tracking-wide border-b border-gray-800 bg-gradient-to-r from-blue-800 to-blue-600 shadow text-white">
        {teamName || "NeuralBI Admin"}
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded-lg transition-colors duration-150 ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 hover:text-blue-400"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} NeuralBI
      </div>
    </aside>
  );
};

export default Sidebar;
