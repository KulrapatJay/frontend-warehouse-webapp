"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";

import { FiLogOut, FiChevronLeft, FiChevronDown, FiMenu } from "react-icons/fi";
import { LuBox } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { MdOutlineDashboard } from "react-icons/md";
import { TbReportSearch, TbShoppingCart } from "react-icons/tb";
import { LuCircleUserRound } from "react-icons/lu";
import { PiUsers } from "react-icons/pi";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{
    size?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
};


const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "เเดชบอร์ด", Icon: MdOutlineDashboard },
  { href: "/reports", label: "รายงาน", Icon: TbReportSearch },
  { href: "/order", label: "ออเดอร์", Icon: TbShoppingCart }, 
];


const WAREHOUSE_LINKS = [
  { href: "/warehouse/1", label: "คลังสินค้า 1" },
  { href: "/warehouse/2", label: "คลังสินค้า 2" },
  { href: "/warehouse/3", label: "คลังสินค้า 3" },
];

// Staff
const STAFF_LINKS = [
  { href: "/staff", label: "สินค้าทั้งหมด" },
  { href: "/staff/product-outbound", label: "สินค้าออก" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Warehouse state
  const isWarehouseActive = pathname.startsWith("/warehouse");
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(isWarehouseActive);

  // Staff state
  const isStaffActive = pathname.startsWith("/staff");
  const [isStaffOpen, setIsStaffOpen] = useState(isStaffActive);

  const onToggleSidebar = useCallback(() => setIsCollapsed((v) => !v), []);
  const onToggleWarehouse = useCallback(
    () => setIsWarehouseOpen((v) => !v),
    []
  );
  const onToggleStaff = useCallback(() => setIsStaffOpen((v) => !v), []);
  const onLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const wantDark = e.target.checked;
      const isDark = theme === "dark";
      if (wantDark !== isDark) toggleTheme();
    },
    [theme, toggleTheme]
  );

  return (
    <aside
      className={`relative bg-base-100 text-base-content h-screen border-r border-base-300 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
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
              priority
            />
          )}
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-circle"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <FiMenu size={22} aria-hidden />
            ) : (
              <FiChevronLeft size={22} aria-hidden />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`flex items-center p-2 rounded-lg hover:bg-base-200 transition
              ${
                pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : ""
              }`}
            >
              <Icon size={20} className="flex-shrink-0" aria-hidden />
              {!isCollapsed && <span className="ml-3">{label}</span>}
            </Link>
          ))}

          {/* Warehouse collapsible group */}
          <div>
            <button
              onClick={onToggleWarehouse}
              className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-base-200 transition
                ${
                  isWarehouseActive
                    ? "bg-primary/10 text-primary font-medium"
                    : ""
                }
              `}
              aria-expanded={isWarehouseOpen}
              aria-controls="warehouse-submenu"
            >
              <div className="flex items-center">
                <GoHome size={20} className="flex-shrink-0" aria-hidden />
                {!isCollapsed && <span className="ml-3">คลังสินค้า</span>}
              </div>
              {!isCollapsed && (
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    isWarehouseOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              )}
            </button>

            {isWarehouseOpen && !isCollapsed && (
              <div id="warehouse-submenu" className="pl-8 pt-2 space-y-2">
                {WAREHOUSE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block w-full text-left p-2 rounded-lg hover:bg-base-200 transition-colors
                      ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary font-medium"
                          : ""
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Staff collapsible group */}
          <div>
            <button
              onClick={onToggleStaff}
              className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-base-200 transition
                ${
                  isStaffActive
                    ? "bg-primary/10 text-primary font-medium"
                    : ""
                }
              `}
              aria-expanded={isStaffOpen}
              aria-controls="staff-submenu"
            >
              <div className="flex items-center">
                <PiUsers size={20} className="flex-shrink-0" aria-hidden />
                {!isCollapsed && <span className="ml-3">เจ้าหน้าที่</span>}
              </div>
              {!isCollapsed && (
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    isStaffOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              )}
            </button>

            {isStaffOpen && !isCollapsed && (
              <div id="staff-submenu" className="pl-8 pt-2 space-y-2">
                {STAFF_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block w-full text-left p-2 rounded-lg hover:bg-base-200 transition-colors
                      ${
                        pathname === link.href
                          ? "bg-primary/10 text-primary font-medium"
                          : ""
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/user_management"
            aria-current={pathname === "/user_management" ? "page" : undefined}
            className={`flex items-center p-2 rounded-lg hover:bg-base-200 transition
            ${
              pathname === "/user_management"
                ? "bg-primary/10 text-primary font-medium"
                : ""
            }`}
          >
            <LuCircleUserRound
              size={20}
              className="flex-shrink-0"
              aria-hidden
            />
            {!isCollapsed && <span className="ml-3">จัดการผู้ใช้</span>}
          </Link>
          <Link
            href="/product_management"
            aria-current={
              pathname === "/product_management" ? "page" : undefined
            }
            className={`flex items-center p-2 rounded-lg hover:bg-base-200 transition
            ${
              pathname === "/product_management"
                ? "bg-primary/10 text-primary font-medium"
                : ""
            }`}
          >
            <LuBox size={20} className="flex-shrink-0" aria-hidden />
            {!isCollapsed && <span className="ml-3">จัดการสินค้า</span>}
          </Link>
        </nav>

        {/* Footer controls */}
        <div className="px-4 py-6 border-t border-base-300 space-y-2">
          {/* Theme switch — expanded */}
          {!isCollapsed && (
            <label className="flex cursor-pointer gap-2 items-center w-full">
              {/* sun */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
              <input
                type="checkbox"
                onChange={handleThemeChange}
                checked={theme === "dark"}
                className="toggle"
                aria-label="Toggle dark mode"
              />
              {/* moon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span className="ml-2 capitalize">{theme} mode</span>
            </label>
          )}

          {/* Theme switch — collapsed (icon button) */}
          {isCollapsed && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-base-200"
              aria-label="Toggle dark mode"
            >
              {theme === "light" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center w-full p-2 rounded-lg hover:bg-base-200 text-error active:opacity-80 transition-colors duration-150"
          >
            <FiLogOut size={20} className="flex-shrink-0" aria-hidden />
            {!isCollapsed && <span className="ml-3 font-medium">ออกจากระบบ</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}