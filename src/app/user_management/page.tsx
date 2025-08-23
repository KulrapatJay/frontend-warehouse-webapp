"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/common/Sidebar";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import Navbar from "@/components/common/Navbar";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { User as userMock } from "@/mock/user";
import { Prefix } from "@/mock/prefixs";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

type User = (typeof userMock)[number];
type PrefixItem = { id: number; name: string };

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(userMock);
  const { theme } = useTheme();

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const prefixMap = useMemo(() => {
    const map: Record<number, string> = {};
    (Prefix as PrefixItem[]).forEach((p) => (map[p.id] = p.name));
    return map;
  }, []);
  const getPrefix = (id: number) => prefixMap[id] ?? "-";

  // filter by search
  const filteredUsers = useMemo(
    () =>
      users.filter((u: User) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [searchTerm, users]
  );

  // reset to page 1 when search or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  // pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedUsers = filteredUsers.slice(startIdx, endIdx);

  const handleAskDelete = (u: User) => {
    setToDelete(u);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
    toast.success(
      `ลบผู้ใช้ ${toDelete.first_name} ${toDelete.last_name} สำเร็จแล้ว`
    );
    setToDelete(null);
  };

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const crumbs = useBreadcrumbs();

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          userName="Admin User"
          userRole="Administrator"
          breadcrumbs={crumbs}
          showHome={false}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-base-100 rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm opacity-70">
                All users{" "}
                <span className="font-semibold opacity-100">
                  {filteredUsers.length}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="input input-bordered w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link href="/user_management/add_user">
                  <button
                    className={`px-4 py-2 rounded-md text-white transition ${
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-black hover:bg-gray-800"
                    }`}
                  >
                    + Add user
                  </button>
                </Link>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
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
                  {pagedUsers.map((user, index) => (
                    <tr
                      key={user.id ?? index}
                      className="hover:bg-base-200 border-t border-base-300"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                        />
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
                        <button
                          className="btn btn-error btn-sm gap-1 text-white"
                          onClick={() => handleAskDelete(user)}
                        >
                          <MdOutlineDelete /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {pagedUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center opacity-70">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between gap-4 text-sm">
              {/* Left: range */}
              <div className="opacity-70">
                Showing{" "}
                <span className="font-semibold">
                  {filteredUsers.length ? startIdx + 1 : 0}
                </span>
                –
                <span className="font-semibold">
                  {Math.min(endIdx, filteredUsers.length)}
                </span>
                &nbsp;of&nbsp;
                <span className="font-semibold">{filteredUsers.length}</span>
              </div>

              {/* Middle: pagination */}
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goto(page - 1)}
                  disabled={page === 1}
                >
                  {"<"}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      className={`btn btn-sm ${
                        n === page ? "btn-neutral" : "btn-ghost"
                      }`}
                      onClick={() => goto(n)}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => goto(page + 1)}
                  disabled={page === totalPages}
                >
                  {">"}
                </button>
              </div>

              {/* Right: rows per page */}
              <div className="flex items-center gap-2">
                <label className="opacity-70">Rows per page</label>
                <select
                  className="select select-bordered select-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </main>

        {/* Modal */}
        <ConfirmDeleteModal
          open={confirmOpen}
          userLabel={
            toDelete ? `${toDelete.first_name} ${toDelete.last_name}` : ""
          }
          onClose={() => {
            setConfirmOpen(false);
            setToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}
