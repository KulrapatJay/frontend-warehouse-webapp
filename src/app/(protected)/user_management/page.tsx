"use client";

import React, { useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import EditUserModal from "@/components/forms/EditUserForm";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { User as userMock } from "@/mock/user";
import { Prefix } from "@/mock/prefixs";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

type User = (typeof userMock)[number];
type PrefixItem = { id: number; name: string };

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(userMock);
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  // 4. สร้างฟังก์ชันสำหรับบันทึกข้อมูลที่แก้ไข
  const handleSaveChanges = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    toast.success(`อัปเดตข้อมูล ${updatedUser.first_name} สำเร็จ!`);
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

 return (
    <>
      <div className="bg-base-100 rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm opacity-70">
            ผู้ใช้ทั้งหมด <span className="font-semibold opacity-100">{filteredUsers.length}</span>
          </span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาจากชื่อ..."
              className="input input-bordered w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link href="/user_management/add_user">
              <button
                className={`px-4 py-2 rounded-md text-white transition ${
                  theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-black hover:bg-gray-800"
                }`}
              >
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
                <th className="p-3"><input type="checkbox" className="checkbox checkbox-sm" /></th>
                <th className="p-3">คำนำหน้า</th>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">นามสกุล</th>
                <th className="p-3">รหัสพนักงาน</th>
                <th className="p-3">ตำเเหน่ง</th>
                <th className="p-3">ชื่อผู้ใช้</th>
                <th className="p-3">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user, index) => (
                <tr key={user.id ?? index} className="hover:bg-base-200 border-t border-base-300">
                  <td className="p-3"><input type="checkbox" className="checkbox checkbox-sm" /></td>
                  <td className="p-3">{getPrefix(user.prefix_id)}</td>
                  <td className="p-3">{user.first_name}</td>
                  <td className="p-3">{user.last_name}</td>
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">
                    {user.role_id === 1 ? "User" :
                     user.role_id === 2 ? "Manager" :
                     user.role_id === 3 ? "Admin" :
                     user.role_id === 4 ? "Staff" : "-"}
                  </td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3 flex gap-2">
                    <button className="btn btn-success btn-sm gap-1 text-white" onClick={() => handleOpenEditModal(user)}>
                      <MdOutlineModeEditOutline /> เเก้ไข
                    </button>
                    <button className="btn btn-error btn-sm gap-1 text-white" onClick={() => handleAskDelete(user)}>
                      <MdOutlineDelete /> ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {pagedUsers.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center opacity-70">ไม่พบผู้ใช้</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <div className="opacity-70">
            กำลังเเสดง <span className="font-semibold">{filteredUsers.length ? startIdx + 1 : 0}</span>
            –<span className="font-semibold">{Math.min(endIdx, filteredUsers.length)}</span>
            &nbsp;จาก&nbsp;<span className="font-semibold">{filteredUsers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => goto(page - 1)} disabled={page === 1}>{"<"}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`btn btn-sm ${n === page ? "btn-neutral" : "btn-ghost"}`} onClick={() => goto(n)}>{n}</button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => goto(page + 1)} disabled={page === totalPages}>{">"}</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="opacity-70 whitespace-nowrap">จำนวนแถวต่อหน้า</label>
            <select className="select select-bordered select-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5,10,15,20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDeleteModal
        open={confirmOpen}
        userLabel={toDelete ? `${toDelete.first_name} ${toDelete.last_name}` : ""}
        onClose={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={handleConfirmDelete}
      />
      <EditUserModal
        isOpen={isEditModalOpen}
        user={editingUser}
        onClose={() => { setIsEditModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveChanges}
      />
    </>
  );
}
