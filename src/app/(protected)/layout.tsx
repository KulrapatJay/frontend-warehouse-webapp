"use client";

import React from "react";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import CustomToaster from "@/components/ui/Alert";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
          <CustomToaster />
        </div>
      </div>
    </ThemeProvider>
  );
}