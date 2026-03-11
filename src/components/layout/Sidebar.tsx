"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Briefcase, Package, Users, Settings, HardHat, ClipboardCheck, LogOut, MapPin, FileText, Building2, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "https://img.icons8.com/fluency-systems-filled/48/1A1A1A/dashboard-layout.png" }, // Updated href to match new path
  { name: "Sites", href: "/sites", icon: "https://img.icons8.com/ios-filled/50/building.png" },
  { name: "Project Managers", href: "/project-managers", icon: "https://img.icons8.com/pulsar-line/48/1A1A1A/project-manager.png" },
  { name: "Engineers", href: "/engineers", icon: "https://img.icons8.com/ios-filled/50/1A1A1A/engineer.png" },
  { name: "Attendance", href: "/attendance", icon: "https://img.icons8.com/fluency-systems-filled/48/1A1A1A/attendance-mark.png" },
  { name: "Leave", href: "/leave", icon: "https://img.icons8.com/hatch/64/1A1A1A/calendar.png" },
  { name: "Issues", href: "/issues", icon: FileText },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({ name: "User", role: "Guest" });

  useEffect(() => {
    // Ensure this runs only on the client
    const name = localStorage.getItem("userName") || "Admin User";
    const role = localStorage.getItem("userRole") || "Site Manager";
    if (name !== userInfo.name || role !== userInfo.role) {
      setUserInfo({ name, role });
    }
  }, [userInfo]);

  // Define role-based access for menu items
  const getFilteredMenuItems = () => {
    const userRole = userInfo.role?.toLowerCase() || "";

    if (userRole === "hr manager" || userRole === "hr_manager") {
      return menuItems.filter(item => ["Dashboard", "Sites", "Project Managers", "Engineers", "Leave", "Issues"].includes(item.name));
    }
    if (userRole === "engineer" || userRole === "site engineer" || userRole === "site_engineer" || userRole === "project manager" || userRole === "project_manager") {
      return menuItems.filter(item => !["Project Managers", "Engineers"].includes(item.name));
    }
    // Default (Admin) sees everything for now
    return menuItems;
  };

  return (
    <aside className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/5 bg-panel shadow-2xl transition-all duration-300 transform 
      ${isCollapsed ? 'w-[80px]' : 'w-[260px]'} 
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      <div className="flex h-24 shrink-0 items-center border-b border-white/5 px-6 relative">
        <div className="flex items-center gap-4 transition-all duration-300 w-full">
          <div className="h-12 w-12 shrink-0 bg-black/5 dark:bg-white/10 rounded-2xl flex items-center justify-center p-2">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            <span className="text-xl font-bold tracking-[0.2em] text-foreground leading-tight font-display uppercase">Destylus</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold opacity-80 whitespace-nowrap">Civil Enterprise</span>
          </div>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-panel text-muted hover:text-primary hover:border-primary/50 transition-all shadow-xl"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile Close Button */}
        <button 
          onClick={onMobileClose}
          className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 p-4 overflow-y-auto">
        <div className={`mb-4 px-4 text-[10px] uppercase tracking-widest text-muted font-bold opacity-50 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-50'}`}>Main Navigation</div>
        {getFilteredMenuItems().map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative group ${isActive
                ? "text-muted"
                : "text-muted hover:bg-white/[0.02] hover:text-foreground"
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.name : ""}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                {typeof item.icon === "string" ? (
                  <img src={item.icon} alt={item.name} className={`h-5 w-5 object-contain transition-all ${isActive ? 'brightness-0 dark:brightness-200 contrast-200' : 'opacity-50 theme-icon-filter'}`} />
                ) : (
                  <item.icon size={20} className={isActive ? "text-primary" : "text-muted"} />
                )}
              </div>
              {!isCollapsed && <span>{item.name}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full shadow-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className={`flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3 border border-white/5 ${isCollapsed ? 'justify-center px-0 bg-transparent border-transparent' : ''}`}>
          <Link href="/settings/profile" className={`flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity ${isCollapsed ? 'justify-center w-full' : 'flex-1'}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-black border shadow-inner
              ${userInfo.role === 'HR Manager' ? 'bg-primary border-white/20' :
                userInfo.role === 'Project Manager' ? 'bg-amber-400 border-white/20' :
                  'bg-amber-200 border-white/20'}`}>
              {userInfo.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-none mb-1">{userInfo.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-primary truncate font-bold opacity-70">{userInfo.role}</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                localStorage.removeItem("userName");
                localStorage.removeItem("userRole");
                router.push("/");
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-error/10 hover:text-error border border-transparent hover:border-error/20"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
