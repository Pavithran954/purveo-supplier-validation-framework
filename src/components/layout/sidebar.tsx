"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registrations", label: "Registration Forms", icon: FileText },
  { href: "/suppliers", label: "Submissions", icon: Users },
  {
    href: "/onboarded-suppliers",
    label: "Onboarded Suppliers",
    icon: UserCheck,
  },
  { href: "/validation", label: "Validation", icon: ShieldCheck },
  { href: "/rules", label: "Rules", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="w-full border-b border-gray-200 bg-white lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r shrink-0 flex flex-col justify-between"
    >
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-gray-900 rounded-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0 group-hover:border-gray-400 transition-colors">
              <Image
                src="/favicon.svg"
                alt="PurveO Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight text-gray-950 group-hover:text-gray-700 transition-colors block">
                PurveO
              </span>
              <span className="text-[11px] text-gray-500 font-medium block">
                Validation Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav aria-label="Main Navigation" className="p-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-950 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-gray-950" : "text-gray-400"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      {/* <div className="p-4 border-t border-gray-100 hidden lg:block">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" aria-hidden="true"></span>
          <span>Engine Active</span>
        </div>
      </div> */}
    </aside>
  );
}
