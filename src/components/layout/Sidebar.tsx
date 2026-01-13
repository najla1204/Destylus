"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, Package, Users, Settings, HardHat, ClipboardCheck, LogOut, MapPin, FileText } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, // Updated href to match new path
  { name: "Sites", href: "/sites", icon: MapPin },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { name: "Leave", href: "/leave", icon: FileText },
  { name: "Settings", href: "/settings/profile", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-700 bg-panel transition-transform duration-300">
      <div className="flex h-16 shrink-0 items-center justify-start gap-3 border-b border-gray-700 px-6">
        <HardHat className="text-primary" size={32} />
        <span className="text-xl font-bold tracking-tight text-foreground">CivilERP</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                ? "bg-primary/15 text-primary"
                : "text-muted hover:bg-surface hover:text-foreground"
                }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-surface p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">
            A
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted">Site Manager</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-gray-800 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
