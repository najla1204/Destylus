"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, Package, Users, Settings, HardHat, ClipboardCheck, LogOut, MapPin, FileText } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, // Updated href to match new path
  { name: "Sites", href: "/sites", icon: MapPin },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Project Managers", href: "/project-managers", icon: Briefcase },
  { name: "Engineers", href: "/engineers", icon: Users },
  { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { name: "Leave", href: "/leave", icon: FileText },
  { name: "Settings", href: "/settings/profile", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({ name: "User", role: "Guest" });

  useEffect(() => {
    // Ensure this runs only on the client
    const name = localStorage.getItem("userName") || "Admin User";
    const role = localStorage.getItem("userRole") || "Site Manager";
    setUserInfo({ name, role });
  }, []);

  // Define role-based access for menu items
  const getFilteredMenuItems = () => {
    if (userInfo.role === "Project Manager") {
      // Project Manager only needs Dashboard (where they manage sites) and Settings + Engineers
      return menuItems.filter(item => ["Dashboard", "Engineers", "Settings"].includes(item.name));
    }
    if (userInfo.role === "HR Manager") {
      return menuItems.filter(item => ["Dashboard", "Sites", "Project Managers", "Engineers", "Attendance", "Leave", "Settings"].includes(item.name));
    }
    // Default (Engineer / Admin) sees everything for now
    return menuItems;
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-700 bg-panel transition-transform duration-300">
      <div className="flex h-16 shrink-0 items-center justify-start gap-3 border-b border-gray-700 px-6">
        <HardHat className="text-primary" size={32} />
        <span className="text-xl font-bold tracking-tight text-foreground">CivilERP</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {getFilteredMenuItems().map((item) => {
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
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-black border
            ${userInfo.role === 'HR Manager' ? 'bg-primary border-primary/20' :
              userInfo.role === 'Project Manager' ? 'bg-orange-300 border-orange-400/20' :
                'bg-orange-100 border-orange-200'}`}>
            {userInfo.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{userInfo.name}</p>
            <p className="text-xs text-muted">{userInfo.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("userName");
            localStorage.removeItem("userRole");
            router.push("/");
          }}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-gray-800 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
