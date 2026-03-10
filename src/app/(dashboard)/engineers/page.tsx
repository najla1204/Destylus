"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Phone, Mail, MapPin, User, ChevronRight, Briefcase, Clock, CheckCircle, XCircle, Trash2, Plus, LayoutGrid, List } from "lucide-react";

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

interface SiteData {
    _id: string;
    name: string;
}

interface Engineer {
    _id: string; // Mongo ID
    name: string;
    email?: string;
    role: string;
    site: string;
    status: string;
    attendance: string;
    reportingManager: string;
}

const INITIAL_ENGINEERS: Engineer[] = [];

export default function EngineersPage() {
    const [userRole, setUserRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Default to list for engineers
    const [isLoading, setIsLoading] = useState(true);

    // Engineeers State
    const [engineersList, setEngineersList] = useState<Engineer[]>(INITIAL_ENGINEERS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEngineer, setNewEngineer] = useState({ name: "", email: "", site: "" });
    const [siteSearchQuery, setSiteSearchQuery] = useState("");
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
    const [sites, setSites] = useState<SiteData[]>([]);

    const handleDeleteEngineer = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this engineer?")) {
            try {
                const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setEngineersList(prev => prev.filter(eng => eng._id !== id));
                } else {
                    alert("Failed to delete engineer.");
                }
            } catch (error) {
                console.error("Error deleting engineer:", error);
                alert("An error occurred while deleting.");
            }
        }
    };

    const handleAddEngineer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEngineer.name || !newEngineer.email) {
            alert("Name and Email are required.");
            return;
        }
        
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newEngineer.name,
                    email: newEngineer.email,
                    role: "engineer",
                    site: newEngineer.site || "Unassigned"
                })
            });

            if (res.ok) {
                const data = await res.json();
                
                // Map the returned mongo user to frontend display requirements
                const engineerToAdd: Engineer = {
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    role: "Site Engineer",
                    site: data.user.site || "Unassigned",
                    status: "Active",
                    attendance: "Present", // defaults for display
                    reportingManager: userRole === "Project Manager" ? "Robert Fox" : "Unassigned"
                };
                
                setEngineersList(prev => [...prev, engineerToAdd]);
                setIsAddModalOpen(false);
                setNewEngineer({ name: "", email: "", site: "" });
                setSiteSearchQuery("");
            } else {
                const errorData = await res.json();
                alert(`Failed to add engineer: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding engineer:", error);
            alert("An error occurred while adding.");
        }
    };

    // Filter sites based on search
    const filteredSites = sites
        .map(site => site.name)
        .filter(siteName => siteName.toLowerCase().includes(siteSearchQuery.toLowerCase()));

    // Attendance State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        if (role !== userRole) {
            setUserRole(role);
        }

        const fetchSites = async () => {
            try {
                const res = await fetch("/api/sites");
                if (res.ok) {
                    const data = await res.json();
                    setSites(data.sites || data || []);
                }
            } catch (e) {
                console.error("Failed to fetch sites", e);
            }
        };
        fetchSites();
        // Fetch Engineers
        const fetchEngineers = async () => {
            try {
                const res = await fetch("/api/users?role=engineer");
                if (res.ok) {
                    const data = await res.json();
                    // Map the mongo users to display format
                    const formattedEngineers = (data.users || []).map((u: any) => ({
                        _id: u._id,
                        name: u.name,
                        email: u.email,
                        role: "Site Engineer",
                        site: u.site || "Unassigned",
                        status: "Active",
                        attendance: "Present",
                        reportingManager: "Unassigned"
                    }));
                    setEngineersList(formattedEngineers);
                }
            } catch (e) {
                console.error("Failed to fetch engineers", e);
            }
        };
        fetchEngineers();

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
            return engineersList;
        } else if (userRole === "Project Manager") {
            // PM sees only their team (Simulated by filtering for 'Metro Station Beta' or 'Robert Fox' for this demo)
            // For demo simplicity, let's say PM sees ID 1 and 3
            return engineersList.filter(e => e.reportingManager === "Robert Fox");
        }
        return [];
    };

    const engineers = getVisibleEngineers().filter(eng =>
        eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-700 pb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search engineers..."
                        className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-700 bg-surface p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`rounded-md p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`rounded-md p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`}
                            title="List/Table View"
                        >
                            <List size={16} />
                        </button>
                    </div>

                    {userRole === "HR Manager" && (
                        <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-700">
                            <Filter size={16} />
                            Filter
                        </button>
                    )}
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus size={16} />
                        Add Engineer
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Total Engineers</span>
                        <div className="rounded-lg bg-primary/10 p-2">
                            <User size={18} className="text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{engineersList.length}</div>
                    <span className="text-xs text-muted">Registered engineers</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Active Engineers</span>
                        <div className="rounded-lg bg-green-500/10 p-2">
                            <CheckCircle size={18} className="text-green-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{engineersList.filter(e => e.status === "Active").length}</div>
                    <span className="text-xs text-green-400">Currently active</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Sites Covered</span>
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <MapPin size={18} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{new Set(engineersList.map(e => e.site).filter(s => s && s !== "Unassigned")).size}</div>
                    <span className="text-xs text-muted">Unique sites with engineers</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Unassigned</span>
                        <div className="rounded-lg bg-yellow-500/10 p-2">
                            <Clock size={18} className="text-yellow-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{engineersList.filter(e => !e.site || e.site === "Unassigned").length}</div>
                    <span className="text-xs text-yellow-400">Awaiting site assignment</span>
                </div>
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

            {/* Views */}
            {viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {engineers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl">
                            <User className="mx-auto mb-4 text-gray-500 opacity-50" size={48} />
                            <h3 className="text-lg font-medium text-foreground mb-1">No Engineers Found</h3>
                            <p className="text-sm">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        engineers.map((eng) => (
                            <div
                                key={eng._id}
                                className="group relative flex flex-col gap-4 rounded-xl border border-gray-700 bg-panel p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-full bg-orange-100 border border-orange-200/50 flex items-center justify-center text-xl font-bold text-black shrink-0">
                                            {eng.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{eng.name}</h3>
                                            {eng.email && <p className="text-xs text-muted mb-0.5">{eng.email}</p>}
                                            <p className="text-sm text-muted">{eng.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteEngineer(e, eng._id)}
                                        className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors z-10"
                                        title="Delete Engineer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="mt-2 grid gap-3 border-t border-gray-700 pt-4">
                                    <div>
                                        <p className="text-xs text-muted mb-1">Current Site</p>
                                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                            <MapPin size={14} className="text-muted" /> {eng.site}
                                        </p>
                                    </div>
                                    
                                    {userRole === "HR Manager" && (
                                        <div>
                                            <p className="text-xs text-muted mb-1">Reports To</p>
                                            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                <Briefcase size={14} className="text-muted" /> {eng.reportingManager}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${eng.attendance === 'Present' ? 'bg-success/10 text-success border-success/20' :
                                        eng.attendance === 'Absent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-gray-700 text-muted border-gray-600'
                                        }`}>
                                        {eng.attendance}
                                    </span>

                                    {eng.status === "Active" ? (
                                        <span className="text-xs font-medium text-muted flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active</span>
                                    ) : (
                                        <span className="text-xs font-medium text-muted flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> {eng.status}</span>
                                    )}
                                </div>
                                
                                <Link href={`/engineers/${eng._id}`} className="absolute inset-0 z-0">
                                    <span className="sr-only">View {eng.name}</span>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-muted border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Engineer Name</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Role & Site</th>
                                {userRole === "HR Manager" && (
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Reports To</th>
                                )}
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Attendance</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Status</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {engineers.length === 0 ? (
                                <tr>
                                    <td colSpan={userRole === "HR Manager" ? 6 : 5} className="py-12 text-center text-muted">
                                        <User className="mx-auto mb-3 text-gray-500 opacity-50" size={32} />
                                        <p className="text-sm">No engineers match your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                engineers.map((eng) => (
                                    <tr key={eng._id} className="hover:bg-surface/50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-black font-bold shrink-0">
                                                    {eng.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link href={`/engineers/${eng._id}`} className="font-bold text-foreground hover:text-primary transition-colors">
                                                        {eng.name}
                                                    </Link>
                                                    {eng.email && <span className="text-xs text-muted font-normal">{eng.email}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-foreground">{eng.role}</span>
                                                <span className="text-xs text-muted flex items-center gap-1"><MapPin size={12} /> {eng.site}</span>
                                            </div>
                                        </td>
                                        {userRole === "HR Manager" && (
                                            <td className="px-4 py-4">
                                                <span className="text-muted flex items-center gap-1"><Briefcase size={12} /> {eng.reportingManager}</span>
                                            </td>
                                        )}
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium border ${eng.attendance === 'Present' ? 'bg-success/10 text-success border-success/20' :
                                                eng.attendance === 'Absent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-gray-700 text-muted border-gray-600'
                                                }`}>
                                                {eng.attendance}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {eng.status === "Active" ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> {eng.status}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => handleDeleteEngineer(e, eng._id)} 
                                                    className="p-1.5 rounded-md text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Delete Engineer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <Link 
                                                    href={`/engineers/${eng._id}`}
                                                    className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                                    title="View Profile"
                                                >
                                                    <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Engineer Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Add New Engineer</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-muted hover:text-foreground">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEngineer} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    value={newEngineer.name}
                                    onChange={e => setNewEngineer(prev => ({...prev, name: e.target.value}))}
                                    placeholder="e.g. Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Email ID <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                    value={newEngineer.email}
                                    onChange={e => setNewEngineer(prev => ({...prev, email: e.target.value}))}
                                    placeholder="e.g. jane@example.com"
                                />
                            </div>
                            <div className="relative">
                                <label className="mb-1 block text-sm font-medium text-foreground">Site (Optional)</label>
                                <div 
                                    className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus-within:border-primary flex items-center justify-between cursor-pointer"
                                    onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                                >
                                    <span className={newEngineer.site ? "text-foreground" : "text-muted"}>
                                        {newEngineer.site || "Select a site..."}
                                    </span>
                                    <ChevronRight size={16} className={`text-muted transition-transform ${isSiteDropdownOpen ? "rotate-90" : ""}`} />
                                </div>
                                {isSiteDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-panel border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                                        <div className="flex items-center px-3 border-b border-gray-700 bg-surface">
                                            <Search size={14} className="text-muted" />
                                            <input
                                                type="text"
                                                className="w-full bg-transparent px-2 py-2 text-sm text-foreground focus:outline-none"
                                                placeholder="Search sites..."
                                                value={siteSearchQuery}
                                                onChange={e => setSiteSearchQuery(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredSites.length > 0 ? (
                                                filteredSites.map(site => (
                                                    <div 
                                                        key={site} 
                                                        className="px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer"
                                                        onClick={() => {
                                                            setNewEngineer(prev => ({...prev, site}));
                                                            setIsSiteDropdownOpen(false);
                                                            setSiteSearchQuery("");
                                                        }}
                                                    >
                                                        {site}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-muted text-center">No sites found</div>
                                            )}
                                            <div 
                                                className="px-4 py-2 text-sm text-primary hover:bg-surface cursor-pointer border-t border-gray-700"
                                                onClick={() => {
                                                    setNewEngineer(prev => ({...prev, site: ""}));
                                                    setIsSiteDropdownOpen(false);
                                                    setSiteSearchQuery("");
                                                }}
                                            >
                                                Clear Selection
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Save Engineer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
