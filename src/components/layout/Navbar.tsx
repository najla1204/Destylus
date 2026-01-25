"use client";

import { Bell, Search, Calendar, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

// Reusing AttendanceType here or we can be loose with type as it varies between Leave and Attendance
interface NotificationItem {
    id: string; // or number, aligning with DB _id
    type: 'leave' | 'attendance';
    title: string;
    description: string;
    time: string;
    link: string;
    actorName: string;
}

export default function Navbar() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userRole, setUserRole] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        // Run only on client
        const role = localStorage.getItem("userRole") || "";
        if (role !== userRole) {
            setUserRole(role);
        }
        // ... existing useEffect content ...

        if (role === "Project Manager") {
            const fetchNotifications = async () => {
                try {
                    // 1. Fetch Leaves (Local Mock for now, or imagine API)
                    // In real app: const resLeaves = await fetch('/api/leaves?status=pending');
                    const savedLeaves = localStorage.getItem("destylus_dashboard_leaves_v2");
                    const leaveNotifs: NotificationItem[] = savedLeaves ? JSON.parse(savedLeaves)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((r: any) => r.status === "Pending")
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((r: any) => ({
                            id: `leave-${r.id}`,
                            type: 'leave',
                            title: 'New Leave Request',
                            description: `${r.name} (${r.role}) - ${r.type}`,
                            time: r.from,
                            link: '/leave',
                            actorName: r.name
                        })) : [];

                    // 2. Fetch Attendance (Real API)
                    const resAttendance = await fetch('/api/attendance?approvalStatus=pending');
                    let attendanceNotifs: NotificationItem[] = [];
                    if (resAttendance.ok) {
                        const data = await resAttendance.json();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        attendanceNotifs = (data.attendanceLogs || []).map((log: any) => ({
                            id: `att-${log._id}`,
                            type: 'attendance',
                            title: 'Attendance Approval',
                            description: `${log.employeeName} - Checked In at ${log.site}`,
                            time: new Date(log.checkInTime).toLocaleTimeString(),
                            link: '/engineers', // or sites/[id]
                            actorName: log.employeeName
                        }));
                    }

                    setNotifications([...leaveNotifs, ...attendanceNotifs]);

                } catch (e) {
                    console.error("Failed to fetch notifications", e);
                }
            };

            fetchNotifications();
            // Poll every 10 seconds
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [userRole]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-background px-8 border-b border-gray-700/50">
            <div className="relative w-[300px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search projects, materials..."
                    className="w-full rounded-md border border-gray-700 bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchParams.get("q") || ""}
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute right-2 top-2 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-background bg-error text-[10px] font-bold text-white">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-700 bg-panel shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between border-b border-gray-700 p-4 bg-surface/50">
                                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                                {notifications.length > 0 && (
                                    <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-bold text-error">
                                        {notifications.length} New
                                    </span>
                                )}
                            </div>

                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                                            <Bell size={20} className="text-muted/50" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No new notifications</p>
                                        <p className="text-xs text-muted mt-1">You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {notifications.map((notif) => (
                                            <Link
                                                key={notif.id}
                                                href={notif.link}
                                                onClick={() => setShowDropdown(false)}
                                                className="block p-4 transition-colors hover:bg-surface/50 border-l-2 border-transparent hover:border-primary"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-black border border-orange-200">
                                                        {notif.actorName.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <p className="text-xs font-bold text-foreground">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-[11px] text-muted leading-relaxed">
                                                            {notif.description}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted pt-1">
                                                            <Calendar size={10} className="text-primary" />
                                                            <span>{notif.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/leave"
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center justify-center gap-2 border-t border-gray-700 p-3 text-xs font-bold text-primary hover:bg-surface transition-colors"
                            >
                                <span className="text-xs text-muted">View relevant sections</span>
                                {/* <ChevronRight size={14} /> */}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
