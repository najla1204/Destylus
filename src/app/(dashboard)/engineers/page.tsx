"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Phone, Mail, MapPin, User, ChevronRight, Briefcase, Clock, CheckCircle, XCircle, Trash2, Plus, LayoutGrid, List, Camera, X, ArrowLeft, Maximize2, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    const [filterSite, setFilterSite] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEngineer, setNewEngineer] = useState({ name: "", email: "", site: "" });
    const [siteSearchQuery, setSiteSearchQuery] = useState("");
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
    const [sites, setSites] = useState<SiteData[]>([]);
    
    // Photo Viewer States
    const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
    const [currentViewerPhotos, setCurrentViewerPhotos] = useState<{url: string, title: string, time: string, location: string, id: string, type: string}[]>([]);
    const [currentViewerIndex, setCurrentViewerIndex] = useState(0);
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

    const openPhotoViewerFromRecord = (record: AttendanceLog, type: 'in' | 'out') => {
        const photos: {url: string, title: string, time: string, location: string, id: string, type: string}[] = [];
        
        if (record.inTimePhoto) {
            photos.push({ 
                url: record.inTimePhoto, 
                title: `${record.employeeName} - Check In`, 
                time: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: 'Geolocation Recorded',
                id: record._id, 
                type: 'in' 
            });
        }
        if (record.outTimePhoto && record.checkOutTime) {
            photos.push({ 
                url: record.outTimePhoto, 
                title: `${record.employeeName} - Check Out`, 
                time: new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: 'Geolocation Recorded',
                id: record._id, 
                type: 'out' 
            });
        }
        
        setCurrentViewerPhotos(photos);
        const index = photos.findIndex(p => p.type === type);
        setCurrentViewerIndex(index !== -1 ? index : 0);
        setPhotoViewerOpen(true);
    };

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

    const engineers = getVisibleEngineers().filter(eng => {
        const matchesSearch = eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              eng.role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSite = !filterSite || eng.site === filterSite;
        return matchesSearch && matchesSite;
    });

    const isEngineerRole = userRole === "Engineer" || userRole === "Site Engineer" || userRole === "engineer" || userRole === "site_engineer";

    if (isLoading && !userRole) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (isEngineerRole) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 font-bold text-3xl">
                    !
                </div>
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                <p className="text-muted mt-2 max-w-md">
                    You do not have permission to view the Engineers directory. Please contact your administrator if you believe this is an error.
                </p>
                <div className="mt-8">
                    <Link href="/dashboard" className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-2">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Engineers</span>
                    <div className="text-4xl font-bold text-foreground leading-none">{engineersList.length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Registered engineers</span>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Active Engineers</span>
                    <div className="text-4xl font-bold text-foreground leading-none">{engineersList.filter(e => e.status === "Active").length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Currently active</span>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Sites Covered</span>
                    <div className="text-4xl font-bold text-foreground leading-none">{new Set(engineersList.map(e => e.site).filter(s => s && s !== "Unassigned")).size}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Unique sites</span>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-300 dark:hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Unassigned</span>
                    <div className="text-4xl font-bold text-foreground leading-none">{engineersList.filter(e => !e.site || e.site === "Unassigned").length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-500">Awaiting assignment</span>
                </div>
            </div>

            {/* Attendance Approval Section (PM Only) */}
            {userRole === "Project Manager" && (
                <div className="mb-4 mt-6 rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
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
                                <thead className="bg-surface border-b border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Site</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-In</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Check-Out</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Hours</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {teamAttendance.map((log) => (
                                        <tr key={log._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{log.employeeName}</td>
                                            <td className="px-4 py-3 text-muted">{log.site}</td>
                                            <td className="px-4 py-3 text-muted">{new Date(log.checkInTime).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {log.inTimePhoto && (
                                                        <button 
                                                            onClick={() => openPhotoViewerFromRecord(log, 'in')}
                                                            className="relative group shrink-0"
                                                        >
                                                            <img src={log.inTimePhoto} alt="Check-In" className="w-8 h-8 rounded-full border border-primary/50 object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Camera size={12} className="text-white" />
                                                            </div>
                                                        </button>
                                                    )}
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <Clock size={13} />
                                                        {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted">
                                                {log.checkOutTime ? (
                                                    <div className="flex items-center gap-2">
                                                        {log.outTimePhoto && (
                                                            <button 
                                                                onClick={() => openPhotoViewerFromRecord(log, 'out')}
                                                                className="relative group shrink-0"
                                                            >
                                                                <img src={log.outTimePhoto} alt="Check-Out" className="w-8 h-8 rounded-full border border-gray-500 object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Camera size={12} className="text-white" />
                                                                </div>
                                                            </button>
                                                        )}
                                                       <span className="flex items-center gap-1">
                                                            <Clock size={13} />
                                                            {new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-blue-400 font-bold tracking-widest uppercase text-[10px]">ACTIVE</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                                                {log.totalHours ? `${log.totalHours.toFixed(1)}h` : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950">
                                                    {log.approvalStatus.charAt(0).toUpperCase() + log.approvalStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {log.approvalStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApproveAttendance(log._id)}
                                                                className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors" title="Approve"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectAttendance(log._id)}
                                                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors" title="Reject"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b border-gray-700 pb-4 mt-6 mb-4">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider hidden xl:block">ENGINEERS ({engineersList.length})</h2>
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 min-w-[150px] max-w-sm mr-auto xl:mr-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search engineers..."
                            className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                
                    <div className="flex items-center rounded-lg border border-gray-700 bg-surface p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`rounded-md p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-black font-semibold" : "text-muted hover:text-foreground"}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`rounded-md p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-black font-semibold" : "text-muted hover:text-foreground"}`}
                            title="List/Table View"
                        >
                            <List size={16} />
                        </button>
                    </div>

                    {userRole === "HR Manager" && (
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted pr-1">
                                <Filter size={14} />
                            </div>
                            <select
                                value={filterSite}
                                onChange={(e) => setFilterSite(e.target.value)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none max-w-[150px] truncate"
                            >
                                <option value="">All Sites</option>
                                {sites.map((site) => (
                                    <option key={site._id} value={site.name}>{site.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary-hover shadow-sm whitespace-nowrap ml-auto sm:ml-0"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Engineer</span>
                    </button>
                </div>
            </div>

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
                                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
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
                                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Engineer Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Role & Site</th>
                                {userRole === "HR Manager" && (
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Reports To</th>
                                )}
                                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Attendance</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
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
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
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
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
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
            {/* Photo Viewer Carousel */}
            {photoViewerOpen && (
                <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
                    <div className="absolute top-8 right-8 flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                            <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{currentViewerIndex + 1} / {currentViewerPhotos.length} Proofs</p>
                        </div>
                        <button 
                            onClick={() => setPhotoViewerOpen(false)}
                            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="relative w-full max-w-6xl h-full max-h-[75vh] flex items-center justify-center">
                        <button 
                            onClick={() => setCurrentViewerIndex(prev => (prev - 1 + currentViewerPhotos.length) % currentViewerPhotos.length)}
                            className="absolute -left-4 md:-left-20 p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-10 border border-white/10 backdrop-blur-md"
                        >
                            <ArrowLeft className="w-8 h-8 opacity-50 hover:opacity-100" />
                        </button>

                        <div className="w-full h-full relative group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <img 
                                src={currentViewerPhotos[currentViewerIndex].url}
                                className="w-full h-full object-contain rounded-[2rem]"
                                alt="Registry Evidence"
                            />
                            
                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h4 className="text-white text-xl font-serif font-bold uppercase tracking-tight flex items-center gap-3">
                                            {currentViewerPhotos[currentViewerIndex].type === 'in' ? <ArrowUpRight className="text-green-500 w-6 h-6" /> : <ArrowDownRight className="text-red-500 w-6 h-6" />}
                                            {currentViewerPhotos[currentViewerIndex].title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-6 mt-4">
                                            <span className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                                <Clock className="w-4 h-4 text-primary" /> {currentViewerPhotos[currentViewerIndex].time}
                                            </span>
                                            <span className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                                <MapPin className="w-4 h-4 text-primary" /> {currentViewerPhotos[currentViewerIndex].location}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={currentViewerPhotos[currentViewerIndex].url} 
                                            target="_blank" 
                                            className="p-4 bg-primary text-black rounded-2xl transition-all hover:scale-105 shadow-accent"
                                        >
                                            <Maximize2 className="w-5 h-5 font-black" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
