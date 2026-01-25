"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Phone, Mail, MapPin, User, ChevronRight, Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";

interface AttendanceLog {
    _id: string;
    employeeName: string;
    site: string;
    role: string;
    status: 'checked-in' | 'checked-out';
    checkInTime: string;
    checkOutTime?: string;
    inTimePhoto?: string;
    outTimePhoto?: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
}

// Mock Data Source
const ALL_ENGINEERS = [
    { id: "1", name: "John Doe", role: "Site Engineer", site: "Metro Station Beta", status: "Active", attendance: "Present", reportingManager: "Robert Fox" },
    { id: "2", name: "Alex Smith", role: "Senior Engineer", site: "Skyline Complex", status: "Active", attendance: "Present", reportingManager: "Cameron Williamson" },
    { id: "3", name: "Sarah Connor", role: "Safety Officer", site: "Metro Station Beta", status: "On Leave", attendance: "Absent", reportingManager: "Robert Fox" },
    { id: "4", name: "Mike Ross", role: "Junior Engineer", site: "River Bridge", status: "Active", attendance: "Present", reportingManager: "Harvey Specter" },
];

export default function EngineersPage() {
    const [userRole, setUserRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Attendance State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        // In a real app, this would come from a secure context or API
        const role = localStorage.getItem("userRole") || "Engineer";
        if (role !== userRole) {
            setUserRole(role);
        }

        // Fetch Team Attendance for PM
        const fetchTeamAttendance = async () => {
            if (role !== "Project Manager") return;

            setLoadingAttendance(true);
            try {
                // In a real app, PM would see all their sites. 
                // For demo, we just fetch ALL pending or active attendance to verify workflow
                const res = await fetch(`/api/attendance`);
                if (res.ok) {
                    const data = await res.json();
                    setTeamAttendance(data.attendanceLogs || []);
                }
            } catch (e) {
                console.error("Failed to fetch team attendance", e);
            } finally {
                setLoadingAttendance(false);
            }
        };

        fetchTeamAttendance();
    }, [userRole]);

    const handleApproveAttendance = async (logId: string) => {
        try {
            const res = await fetch(`/api/attendance/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) {
                // Refresh locally for instant feedback
                const updated = teamAttendance.map(log =>
                    log._id === logId ? { ...log, approvalStatus: 'approved' } : log
                );
                setTeamAttendance(updated);
            } else {
                alert("Failed to approve attendance. Please try again.");
            }
        } catch (e) {
            console.error("Error approving", e);
            alert("An error occurred while approving attendance.");
        }
    };

    const handleRejectAttendance = async (logId: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return; // Cancelled

        try {
            const res = await fetch(`/api/attendance/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', rejectionReason: reason || "No reason provided" })
            });
            if (res.ok) {
                // Refresh locally for instant feedback
                const updated = teamAttendance.map(log =>
                    log._id === logId ? { ...log, approvalStatus: 'rejected' } : log
                );
                setTeamAttendance(updated);
            } else {
                alert("Failed to reject attendance. Please try again.");
            }
        } catch (e) {
            console.error("Error rejecting", e);
            alert("An error occurred while rejecting attendance.");
        }
    };

    // Filter Logic based on Role
    const getVisibleEngineers = () => {
        if (userRole === "HR Manager") {
            // HR sees EVERYONE
            return ALL_ENGINEERS;
        } else if (userRole === "Project Manager") {
            // PM sees only their team (Simulated by filtering for 'Metro Station Beta' or 'Robert Fox' for this demo)
            // For demo simplicity, let's say PM sees ID 1 and 3
            return ALL_ENGINEERS.filter(e => e.reportingManager === "Robert Fox");
        }
        return [];
    };

    const engineers = getVisibleEngineers().filter(eng =>
        eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="text-muted/60">Home</span>
                        <span>/</span>
                        <span className="text-foreground">Staff</span>
                    </div>
                    <h1 className="mt-1 text-2xl font-bold text-foreground">
                        {userRole === "HR Manager" ? "All Engineers" : "My Team"}
                    </h1>
                    <p className="text-muted">
                        {userRole === "HR Manager" ? "Directory of all engineering staff." : "Engineers under your supervision."}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search engineers..."
                        className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {userRole === "HR Manager" && (
                    <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-700">
                        <Filter size={16} />
                        Filter
                    </button>
                )}
            </div>

            {/* Attendance Approval Section (PM Only) */}
            {userRole === "Project Manager" && (
                <div className="mb-8 rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
                        <Clock className="text-primary" size={24} />
                        Attendance Approvals
                    </h2>

                    {loadingAttendance ? (
                        <div className="text-center py-4 text-muted">Loading attendance...</div>
                    ) : teamAttendance.length === 0 ? (
                        <div className="text-center py-6 text-muted border border-dashed border-gray-700 rounded-lg">
                            No attendance records found today.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-700">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted">
                                    <tr>
                                        <th className="px-4 py-3">Engineer</th>
                                        <th className="px-4 py-3">Site</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Geotag</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {teamAttendance.map((log) => (
                                        <tr key={log._id}>
                                            <td className="px-4 py-3 font-medium text-foreground">{log.employeeName}</td>
                                            <td className="px-4 py-3 text-muted">{log.site}</td>
                                            <td className="px-4 py-3 text-muted">
                                                {new Date(log.checkInTime).toLocaleTimeString()}
                                                {log.checkOutTime && ` - ${new Date(log.checkOutTime).toLocaleTimeString()}`}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.inTimePhoto ? (
                                                    <a href={log.inTimePhoto} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                        <MapPin size={14} /> View
                                                    </a>
                                                ) : <span className="text-muted">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.approvalStatus === 'approved' ? 'bg-[#d1fae5] text-black' :
                                                        log.approvalStatus === 'rejected' ? 'bg-[#fee2e2] text-black' :
                                                            'bg-[#fef3c7] text-black'
                                                    }`}>
                                                    {log.approvalStatus === 'approved' ? 'Approved' :
                                                        log.approvalStatus === 'rejected' ? 'Rejected' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {log.approvalStatus === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApproveAttendance(log._id)}
                                                            className="p-1 rounded bg-success/20 text-success hover:bg-success/30 transition-colors" title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectAttendance(log._id)}
                                                            className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors" title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm font-bold ${log.approvalStatus === 'approved' ? 'text-success' : 'text-red-500'
                                                        }`}>
                                                        {log.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {engineers.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        No engineers found.
                    </div>
                ) : (
                    engineers.map((eng) => (
                        <Link
                            key={eng.id}
                            href={`/engineers/${eng.id}`}
                            className="group flex flex-col items-start gap-4 rounded-xl border border-gray-700 bg-panel p-4 transition-all hover:border-primary/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-black text-3xl font-bold">
                                    {eng.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{eng.name}</h3>
                                    <p className="text-sm text-muted flex items-center gap-2">
                                        {eng.role}
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {eng.site}</span>
                                    </p>
                                    {/* HR View: Show Reporting Manager */}
                                    {userRole === "HR Manager" && (
                                        <p className="text-xs text-muted mt-1 flex items-center gap-1">
                                            <Briefcase size={10} /> Reports to: <span className="text-foreground">{eng.reportingManager}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex w-full items-center justify-between sm:w-auto sm:gap-6">
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${eng.attendance === 'Present' ? 'bg-success/10 text-success border-success/20' :
                                        eng.attendance === 'Absent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-gray-700 text-muted border-gray-600'
                                        }`}>
                                        {eng.attendance}
                                    </span>
                                    {eng.status === "Active" ? (
                                        <span className="text-xs text-muted flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active</span>
                                    ) : (
                                        <span className="text-xs text-muted flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> {eng.status}</span>
                                    )}
                                </div>
                                <ChevronRight className="text-muted group-hover:text-primary transition-colors" size={20} />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
