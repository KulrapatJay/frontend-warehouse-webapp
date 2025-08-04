import React from "react";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";

const users = [
  {
    id: 1111,
    prefix: "Mr./Ms.",
    firstName: "John",
    lastName: "Doe",
    role: "Admin",
    username: "Johni",
    avatar: "/avatar1.jpg",
  },
  {
    id: 1112,
    prefix: "Mr./Ms.",
    firstName: "Sarah",
    lastName: "Miller",
    role: "Admin",
    username: "Sarah12",
    avatar: "/avatar2.jpg",
  },
  {
    id: 1113,
    prefix: "Mr./Ms.",
    firstName: "Kevin",
    lastName: "Smith",
    role: "Manager",
    username: "Kevin11",
    avatar: "/avatar3.jpg",
  },
  {
    id: 1114,
    prefix: "Mr./Ms.",
    firstName: "Michael",
    lastName: "Johnson",
    role: "Staff",
    username: "MichaelJR",
    avatar: "/avatar4.jpg",
  },
  {
    id: 1115,
    prefix: "Mr./Ms.",
    firstName: "Patricia",
    lastName: "Lopez",
    role: "Manager",
    username: "Patricia_eiei",
    avatar: "/avatar5.jpg",
  },
  {
    id: 1116,
    prefix: "Mr./Ms.",
    firstName: "George",
    lastName: "White",
    role: "Staff",
    username: "GeorgeW",
    avatar: "/avatar6.jpg",
  },
];

export default function UserManagement() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">User management</h1>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm">All users <span className="text-black font-semibold">25</span></span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="border rounded px-3 py-1 w-64 shadow-inner"
                />
                <button className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded">+ Add user</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-[#f7d9a8] text-left">
                  <tr>
                    <th className="p-3"><input type="checkbox" /></th>
                    <th className="p-3">prefix</th>
                    <th className="p-3">first name</th>
                    <th className="p-3">last name</th>
                    <th className="p-3">ID</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">username</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#fef6ee]">
                  {users.map((user, index) => (
                    <tr key={index} className="border-t hover:bg-[#fff7ee]">
                      <td className="p-3"><input type="checkbox" /></td>
                      <td className="p-3 flex items-center gap-2">
                        <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                        {user.prefix}
                      </td>
                      <td className="p-3">{user.firstName}</td>
                      <td className="p-3">{user.lastName}</td>
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">{user.role}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3 flex gap-2">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <MdOutlineModeEditOutline className="text-white" /> Edit
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                          <MdOutlineDelete className="text-white" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6 gap-2 text-sm">
              <button>{"<"}</button>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={`px-2 py-1 rounded ${n === 1 ? "bg-gray-300" : "hover:bg-gray-200"}`}
                >
                  {n}
                </button>
              ))}
              <button>{">"}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
