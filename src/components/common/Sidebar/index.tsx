"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiLogOut, FiChevronLeft, FiChevronDown, FiMenu } from "react-icons/fi";
import { GoHome } from "react-icons/go";
import { MdOutlineDashboard } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { LuCircleUserRound } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.checked ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={`relative bg-base-100 text-base-content h-screen border-r border-base-300 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex items-center h-16 p-4 border-b border-base-300 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <Image
              src="/assets/images/Bee Choice PNG -02.png"
              alt="Company Logo"
              width={80}
              height={80}
              className="transition-all duration-300"
            />
          )}
          <button onClick={toggleSidebar} className="btn btn-ghost btn-circle">
            {isCollapsed ? <FiMenu size={22} /> : <FiChevronLeft size={22} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-base-200"
          >
            <MdOutlineDashboard size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Dashboard</span>}
          </a>
          <a
            href="#"
            className="flex items-center p-2 rounded-lg hover:bg-base-200"
          >
            <TbReportSearch size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Reports</span>}
          </a>
          <div>
            <button
              onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-base-200"
            >
              <div className="flex items-center">
                <GoHome size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">Warehouse</span>}
              </div>
              {!isCollapsed && (
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    isWarehouseOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            {isWarehouseOpen && !isCollapsed && (
              <div className="pl-8 pt-2 space-y-2">
                <a href="#" className="block p-2 rounded-lg hover:bg-base-300">
                  Warehouse 1
                </a>
                <a href="#" className="block p-2 rounded-lg hover:bg-base-300">
                  Warehouse 2
                </a>
                <a href="#" className="block p-2 rounded-lg hover:bg-base-300">
                  Warehouse 3
                </a>
              </div>
            )}
          </div>
          <Link
            href="/user_management"
            className="flex items-center p-2 rounded-lg hover:bg-base-200"
          >
            <LuCircleUserRound size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">User management</span>}
          </Link>
        </nav>

        <div className="px-4 py-6 border-t border-base-300 space-y-2">
          <div className="flex items-center p-2 rounded-lg">
            {/* แสดงผลเมื่อ Sidebar ขยาย  */}
            {!isCollapsed && (
              <label className="flex cursor-pointer gap-2 items-center w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
                <input
                  type="checkbox"
                  onChange={handleThemeChange}
                  checked={theme === "dark"}
                  className="toggle theme-controller"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span className="ml-2 capitalize">{theme} Mode</span>
              </label>
            )}
            {/* แสดงผลเมื่อ Sidebar หุบ  */}
            {isCollapsed && (
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-base-200"
              >
                {theme === "light" ? (
                  // แสดงไอคอนพระอาทิตย์
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                  </svg>
                ) : (
                  // แสดงไอคอนพระจันทร์
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-lg 
                 hover:bg-red-100 hover:text-red-600 
                 dark:hover:bg-red-900/30 dark:hover:text-red-400
                 active:opacity-80 transition-colors duration-150"
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
