"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";

import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import EditUserForm, {UpdateUserPayload,} from "@/components/forms/EditUserForm";
import { useTheme } from "@/contexts/ThemeContext";

// --- Type Definitions ---

// Type สำหรับข้อมูล User ที่สมบูรณ์ (ใช้แสดงผลในตาราง)
type User = {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  username: string;
  prefix: { name: string };
  role: { role_name: string };
  last_login: string | null;
  updated_at: string | null;
};

// Types สำหรับข้อมูลที่ดึงมาเพื่อใช้ใน Dropdown
type Prefix = { id: number; name: string };
type Role = { id: number; role_name: string };

// ฟังก์ชันสำหรับจัดรูปแบบวันที่และเวลา
const formatDateTime = (isoString: string | null) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  };
  return new Intl.DateTimeFormat("en-GB", options).format(date);
};

export default function UserManagement() {
  // --- States ---
  const [users, setUsers] = useState<User[]>([]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const { theme } = useTheme();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [usersRes, rolesRes, prefixesRes] = await Promise.all([
          axios.get("/api/user-management"),
          axios.get("/api/user-management/roles"),
          axios.get("/api/user-management/prefixes"),
        ]);

        setUsers(usersRes.data || []);
        setRoles(rolesRes.data || []);
        setPrefixes(prefixesRes.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("ไม่สามารถดึงข้อมูลเริ่มต้นได้");
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Filtering and Pagination Logic ---
  const filteredUsers = useMemo(
    () =>
      users.filter((u) =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [searchTerm, users]
  );
  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedUsers = filteredUsers.slice(startIdx, endIdx);
  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // --- Event Handlers ---
  const handleOpenEditModal = (user: User) => {
    console.log("Editing user:", user);
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleAskDelete = (user: User) => {
    setToDelete(user);
    setConfirmOpen(true);
  };

  const handleSaveChanges = (payload: UpdateUserPayload) => {
    console.log("Payload ส่งไป backend:", payload);
    const promise = axios.put(`/api/user-management/${payload.id}`, payload);
    if (!payload.id && editingUser?.id) payload.id = editingUser.id;
    if (!payload.id) { toast.error("ไม่พบรหัสผู้ใช้ (id)"); return; }
    toast.promise(promise, {
      loading: "กำลังบันทึกการเปลี่ยนแปลง...",
      success: (response) => {
        const updatedUserFromServer = response.data;
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === updatedUserFromServer.id ? updatedUserFromServer : u
          )
        );
        setIsEditModalOpen(false);
        setEditingUser(null);
        return `อัปเดตข้อมูล ${updatedUserFromServer.first_name} สำเร็จ!`;
      },
      error: (err) =>
        err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
    });
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    const promise = axios.delete(`/api/user-management/${toDelete.id}`);

    toast.promise(promise, {
      loading: "กำลังลบผู้ใช้...",
      success: () => {
        setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
        return `ลบผู้ใช้ ${toDelete.first_name} ${toDelete.last_name} สำเร็จแล้ว`;
      },
      error: (err) => err.response?.data?.message || "เกิดข้อผิดพลาดในการลบ",
    });

    setConfirmOpen(false);
    setToDelete(null);
  };


  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  if (error) return <div className="p-6 text-center text-error">{error}</div>;

  return (
    <>
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        {/* Header and Controls */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm opacity-70">
            ผู้ใช้ทั้งหมด{" "}
            <span className="font-semibold opacity-100">
              {filteredUsers.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาจากชื่อ..."
              className="input input-bordered w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link href="user_management/add_user">
              <button className={`btn btn-primary text-white`}>
                + เพิ่มผู้ใช้
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
                <th className="p-3">คำนำหน้า</th>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">นามสกุล</th>
                <th className="p-3">รหัสพนักงาน</th>
                <th className="p-3">ตำเเหน่ง</th>
                <th className="p-3">ชื่อผู้ใช้</th>
                <th className="p-3">เข้าสู่ระบบล่าสุด</th>
                <th className="p-3">อัพเดทล่าสุด</th>
                <th className="p-3">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-base-200 border-t border-base-300"
                >
                  <td className="p-3">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                  </td>
                  <td className="p-3">{user.prefix?.name}</td>
                  <td className="p-3">{user.first_name}</td>
                  <td className="p-3">{user.last_name}</td>
                  <td className="p-3">{user.employee_id}</td>
                  <td className="p-3">{user.role?.role_name}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{formatDateTime(user.last_login)}</td>
                  <td className="p-3">{formatDateTime(user.updated_at)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="btn btn-success btn-sm gap-1 text-white"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      <MdOutlineModeEditOutline /> เเก้ไข
                    </button>
                    <button
                      className="btn btn-error btn-sm gap-1 text-white"
                      onClick={() => handleAskDelete(user)}
                    >
                      <MdOutlineDelete /> ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {pagedUsers.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center opacity-70">
                    ไม่พบผู้ใช้ที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer and Pagination */}
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <div className="opacity-70">
            กำลังเเสดง{" "}
            <span className="font-semibold">
              {filteredUsers.length ? startIdx + 1 : 0}
            </span>
            –
            <span className="font-semibold">
              {Math.min(endIdx, filteredUsers.length)}
            </span>
            &nbsp;จาก&nbsp;
            <span className="font-semibold">{filteredUsers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => goto(page - 1)}
              disabled={page === 1}
            >
              {"<"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`btn btn-sm ${
                  n === page ? "btn-neutral" : "btn-ghost"
                }`}
                onClick={() => goto(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => goto(page + 1)}
              disabled={page === totalPages}
            >
              {">"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="opacity-70 whitespace-nowrap">
              จำนวนแถวต่อหน้า
            </label>
            <select
              className="select select-bordered select-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <EditUserForm
        isOpen={isEditModalOpen}
        user={editingUser}
        prefixes={prefixes}
        roles={roles}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveChanges}
      />
    </>
  );
}
