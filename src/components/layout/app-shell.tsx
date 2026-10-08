"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSupplierPortal = pathname?.startsWith("/supplier/");

  if (isSupplierPortal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
