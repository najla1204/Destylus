"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, Fingerprint, Camera, CheckCircle2, User, Building, Calendar, BadgeCheck, XCircle, AlertCircle } from "lucide-react";

type AttendanceState = "idle" | "checked-in" | "checked-out";

// Mock Data
const MOCK_ATTENDANCE_LOGS = [
    { id: 1, name: "Project Manager", role: "Project Manager", site: "Metro Station Beta", date: "2026-01-14", inTime: "08:55 AM", outTime: "06:10 PM", status: "Approved" },
    { id: 2, name: "John Engineer", role: "Site Engineer", site: "Metro Station Beta", date: "2026-01-14", inTime: "09:00 AM", outTime: "05:55 PM", status: "Approved" },
    { id: 3, name: "Alex Smith", role: "Senior Engineer", site: "Skyline Complex", date: "2026-01-14", inTime: "08:45 AM", outTime: "06:00 PM", status: "Approved" },
    { id: 4, name: "Steve Rogers", role: "Site Engineer", site: "Metro Station Beta", date: "2026-01-13", inTime: "09:10 AM", outTime: "06:15 PM", status: "Approved" },
];

const MOCK_PENDING_LOGS = [
    { id: 101, name: "John Doe", role: "Site Engineer", site: "Metro Station Beta", type: "Check-In", time: "09:15 AM", location: "Site Entrance", photo: "captured_img.jpg" },
    { id: 102, name: "Sarah Connor", role: "Safety Officer", site: "Metro Station Beta", type: "Check-Out", time: "06:30 PM", location: "Site Office", photo: "captured_img2.jpg" },
];

export default function AttendancePage() {
    const [userRole, setUserRole] = useState("");
    const [pmTab, setPmTab] = useState<"my-attendance" | "verify">("my-attendance");
    const [pendingLogs, setPendingLogs] = useState(MOCK_PENDING_LOGS);

    // Engineer/Self State
    const [status, setStatus] = useState<AttendanceState>("idle");
    const [inTime, setInTime] = useState<string | null>(null);
    const [outTime, setOutTime] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showGeoTagMessage, setShowGeoTagMessage] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        setUserRole(role);
        // Default PM to Verify tab if they have pending logs? No, default to marking their own is safer.
    }, []);

    // Hardcoded for demo purposes
    const employeeDetails = {
        name: "Current User",
        id: "EMP-2024-00X",
        role: userRole,
    };

    const handleMarkAttendance = (type: "in" | "out") => {
        setIsCapturing(true);
        setShowGeoTagMessage(false);

        setTimeout(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            if (type === "in") {
                setInTime(timeString);
                setStatus("checked-in");
            } else {
                setOutTime(timeString);
                setStatus("checked-out");
            }

            setIsCapturing(false);
            setShowGeoTagMessage(true);
            setTimeout(() => setShowGeoTagMessage(false), 3000);
        }, 2000);
    };

    const handleVerifyFilter = (id: number) => {
        setPendingLogs(prev => prev.filter(log => log.id !== id));
    };

    // --- RENDER COMPONENT: MY ATTENDANCE UI (Reused) ---
    const MyAttendanceUI = () => (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                            {employeeDetails.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{employeeDetails.name}</h2>
                            <p className="text-sm font-medium text-gray-500">{employeeDetails.role}</p>
                            <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                <Fingerprint size={14} /> ID: {employeeDetails.id}
                            </div>
                        </div>
                    </div>
                    <div className={`rounded-lg px-3 py-1 text-sm font-medium ${status === "checked-in" ? "bg-green-100 text-green-700" : status === "checked-out" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {status === "checked-in" ? "On Duty" : status === "checked-out" ? "Shift Ended" : "Not Checked In"}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-medium text-gray-500">Today's Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-50 p-2 text-blue-600"><Clock size={18} /></div>
                            <span className="text-sm font-medium text-gray-700">In Time</span>
                        </div>
                        <span className="font-mono text-lg font-bold text-gray-900">{inTime || "--:--"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-orange-50 p-2 text-orange-600"><Clock size={18} /></div>
                            <span className="text-sm font-medium text-gray-700">Out Time</span>
                        </div>
                        <span className="font-mono text-lg font-bold text-gray-900">{outTime || "--:--"}</span>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                {isCapturing ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-pulse">
                        <div className="mb-4 rounded-full bg-blue-50 p-4"><Camera className="h-10 w-10 text-blue-600 animate-bounce" /></div>
                        <h3 className="text-lg font-semibold text-gray-900">Capturing Geo-tag Photo...</h3>
                        <p className="text-gray-500">Verifying location.</p>
                    </div>
                ) : showGeoTagMessage ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-4 rounded-full bg-green-50 p-4"><CheckCircle2 className="h-12 w-12 text-green-600" /></div>
                        <h3 className="text-xl font-bold text-gray-900">Geo-tag Photo Captured!</h3>
                        <p className="text-green-600 font-medium">Marked successfully.</p>
                    </div>
                ) : (
                    <div className="py-4">
                        {status === "idle" && (
                            <div className="flex flex-col items-center">
                                <MapPin className="mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Ready to Start?</h3>
                                <button onClick={() => handleMarkAttendance("in")} className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-500">
                                    <Camera className="mr-2 h-4 w-4" /> Mark In-Time
                                </button>
                            </div>
                        )}
                        {status === "checked-in" && (
                            <div className="flex flex-col items-center">
                                <MapPin className="mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Shift in Progress</h3>
                                <button onClick={() => handleMarkAttendance("out")} className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white hover:bg-red-500">
                                    <Camera className="mr-2 h-4 w-4" /> Mark Out-Time
                                </button>
                            </div>
                        )}
                        {status === "checked-out" && (
                            <div className="flex flex-col items-center py-4">
                                <div className="mb-4 rounded-full bg-gray-100 p-4"><CheckCircle2 className="h-8 w-8 text-gray-500" /></div>
                                <h3 className="text-lg font-semibold text-gray-900">Shift Completed</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    // 1. HR VIEW (Read Only Report)
    if (userRole === "HR Manager") {
        const approvedLogs = MOCK_ATTENDANCE_LOGS.filter(log => log.status === "Approved");
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Attendance Report</h1>
                    <p className="text-muted">Verified logs for the Organization.</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-muted uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Employee</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Site</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Timings</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {approvedLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-black text-xs font-bold border
                                            ${log.role === 'Project Manager' ? 'bg-orange-300 border-orange-400/20' : 'bg-orange-100 border-orange-200'}`}>
                                            {log.name.charAt(0)}
                                        </div>
                                        {log.name}
                                    </td>
                                    <td className="px-6 py-4 text-muted">{log.role}</td>
                                    <td className="px-6 py-4 text-foreground">{log.site}</td>
                                    <td className="px-6 py-4 text-muted">{log.date}</td>
                                    <td className="px-6 py-4 text-foreground font-mono text-xs">
                                        <span className="text-green-400">IN: {log.inTime}</span><br /><span className="text-orange-400">OUT: {log.outTime}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500 border border-green-500/20"><BadgeCheck size={12} /> Approved</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 2. PROJECT MANAGER VIEW (Verification + Self)
    if (userRole === "Project Manager") {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Attendance & Verification</h1>
                    <p className="text-muted">Manage your daily attendance and verify team logs.</p>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setPmTab("my-attendance")}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${pmTab === "my-attendance" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        My Attendance
                    </button>
                    <button
                        onClick={() => setPmTab("verify")}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${pmTab === "verify" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        Verify Team <span className="ml-2 rounded-lg bg-red-100 text-red-600 px-2 py-0.5 text-xs">{pendingLogs.length}</span>
                    </button>
                </div>

                {/* TAB CONTENT */}
                {pmTab === "my-attendance" ? (
                    <MyAttendanceUI />
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {pendingLogs.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                                <p>No pending attendance logs to verify.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {pendingLogs.map(log => (
                                    <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                {log.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{log.name}</h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    {log.role} <span className="w-1 h-1 rounded-full bg-gray-300"></span> {log.site}
                                                </p>
                                                <div className="mt-1 flex items-center gap-4 text-xs font-medium">
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{log.type}</span>
                                                    <span className="text-gray-700 flex items-center gap-1"><Clock size={12} /> {log.time}</span>
                                                    <span className="text-gray-500 flex items-center gap-1"><MapPin size={12} /> {log.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleVerifyFilter(log.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleVerifyFilter(log.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                                            >
                                                <CheckCircle2 size={16} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-center text-gray-500">
                            Verifying implies you have checked the geolocation and photo evidence.
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. ENGINEER / DEFAULT VIEW
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">Engineer Attendance</h1>
                <p className="text-muted">Daily check-in and check-out management.</p>
            </div>
            <MyAttendanceUI />
            {/* Quick Actions Grid for Engineers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/attendance/timesheet"
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Timesheet & Hours</h3>
                        <p className="text-xs text-gray-500">View calendar and log daily working hours</p>
                    </div>
                </Link>

                <Link
                    href="/leave"
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Fingerprint size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Leave Requests</h3>
                        <p className="text-xs text-gray-500">Apply for casual, sick, or emergency leave</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
