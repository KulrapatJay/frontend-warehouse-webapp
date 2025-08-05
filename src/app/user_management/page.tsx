"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";
import { User as userMock } from "@/mock/user";
import { Prefix } from "@/mock/prefixs";

type User = typeof userMock[number];
type PrefixItem = { id: number; name: string };

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ใช้ธีมของ daisyUI ผ่าน data-theme (ไม่แตะ tailwind.config)
  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      // อ่านจาก DOM ก่อน ถ้าไม่มีค่อยดูจาก localStorage
      const domTheme = root.getAttribute("data-theme") as "light" | "dark" | null;
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const next = (domTheme || stored || "light") as "light" | "dark";

      if (root.getAttribute("data-theme") !== next) {
        root.setAttribute("data-theme", next);
      }
      setTheme(next);
    };

    // เรียกครั้งแรก
    syncTheme();

    // อัปเดตเมื่อมีการแก้ data-theme บน <html> (เช่น ปุ่มใน Sidebar ไปแก้ให้)
    const obs = new MutationObserver(syncTheme);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    // อัปเดตเมื่อ tab อื่นเปลี่ยน localStorage (หรือโค้ดที่แก้ localStorage โดยตรง)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") syncTheme();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const prefixMap = useMemo(() => {
    const map: Record<number, string> = {};
    (Prefix as PrefixItem[]).forEach((p) => (map[p.id] = p.name));
    return map;
  }, []);
  const getPrefix = (id: number) => prefixMap[id] ?? "-";

  const filteredUsers = useMemo(
    () =>
      userMock.filter((u: User) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  return (
    // ใช้สีพื้นฐานจากธีม (light/dark) ของ daisyUI
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* การ์ด */}
          <div className="bg-base-100 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">User management</h1>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-sm opacity-70">
                All users <span className="font-semibold opacity-100">{userMock.length}</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="input input-bordered w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* ปุ่ม: ดำใน Light / น้ำเงินใน Dark */}
                <button
                  className={`btn text-white ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  + Add user
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {/* ตารางขาวใน light / เข้มใน dark ตามธีม */}
              <table className="table w-full text-sm rounded-lg overflow-hidden bg-base-100">
                <thead className="bg-base-200">
                  <tr className="font-semibold">
                    <th className="p-3">
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </th>
                    <th className="p-3">prefix</th>
                    <th className="p-3">first name</th>
                    <th className="p-3">last name</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">username</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id ?? index}
                      className="hover:bg-base-200 border-t border-base-300"
                    >
                      <td className="p-3">
                        <input type="checkbox" className="checkbox checkbox-sm" />
                      </td>
                      <td className="p-3">{getPrefix(user.prefix_id)}</td>
                      <td className="p-3">{user.first_name}</td>
                      <td className="p-3">{user.last_name}</td>
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">
                        {user.role_id === 1
                          ? "User"
                          : user.role_id === 2
                          ? "Manager"
                          : user.role_id === 3
                          ? "Admin"
                          : user.role_id === 4
                          ? "Staff"
                          : "-"}
                      </td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3 flex gap-2">
                        <button className="btn btn-success btn-sm gap-1 text-white">
                          <MdOutlineModeEditOutline /> Edit
                        </button>
                        <button className="btn btn-error btn-sm gap-1 text-white">
                          <MdOutlineDelete /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2 text-sm">
              <button className="btn btn-ghost btn-sm">{"<"}</button>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={`btn btn-sm ${n === 1 ? "btn-neutral" : "btn-ghost"}`}
                >
                  {n}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm">{">"}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
