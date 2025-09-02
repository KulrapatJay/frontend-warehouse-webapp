"use client";

import React from "react";
import Link from "next/link";
import { FiUser, FiHome } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

type Crumb = { label: string; href?: string };
type NavbarProps = {
  userName?: string;
  userRole?: string;
  breadcrumbs?: Crumb[];
  showHome?: boolean;
};

export default function Navbar({
  userName,
  userRole,
  breadcrumbs = [],
  showHome = false, 
}: NavbarProps) {
  const { user } = useAuth();
  const autoCrumbs = useBreadcrumbs();

  const trail = (breadcrumbs && breadcrumbs.length ? breadcrumbs : autoCrumbs)
    .filter((c) => c && typeof c.label === "string" && c.label.trim() !== "")
    .map((c) => ({ ...c, label: c.label.trim() }));
  const dedup = trail.filter((c, i) => i === 0 || c.label !== trail[i - 1].label);

  const displayName = user?.name ?? user?.username ?? userName ?? "Guest";
  const displayRole = user?.role ?? userRole ?? "-";


  return (
    <header className="bg-base-100 flex h-16 w-full items-center justify-between gap-2 border-b border-base-300 px-4">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs text-sm">
        <ul className="flex items-center gap-2">
          {showHome && (
            <li>
              <Link href="/" className="inline-flex items-center gap-1 hover:underline">
                <FiHome className="opacity-70" /> Home
              </Link>
            </li>
          )}
          {dedup.map((c, idx) => {
            const isLast = idx === dedup.length - 1;
            return (
              <li key={`${c.label}-${idx}`}>
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:underline">{c.label}</Link>
                ) : (
                  <span className="font-medium">{c.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User chip */}
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-9 flex items-center justify-center">
            <FiUser size={30} className="text-base-content/80" />
          </div>
        </div>
        <div className="hidden md:flex md:flex-col md:items-start">
          <span className="font-bold text-sm">{displayName}</span>
          <span className="text-xs text-base-content/60">{displayRole}</span>
        </div>
      </div>
    </header>
  );
}
