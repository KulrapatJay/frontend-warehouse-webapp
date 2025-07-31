import Sidebar from "@/components/common/Sidebar";
import Navbar from '@/components/common/Navbar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
          Dashboard
        </main>
      </div>
    </div>
  );
}