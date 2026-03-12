"use client";

import { useState, useEffect } from "react";
import { 
    FileText, CheckCircle, XCircle, 
    AlertCircle, Loader2, Plus, 
    Search, Layers, X, CheckCircle2,
    Calendar, Clock, User, ChevronDown
} from "lucide-react";

interface LeaveRequest {
    _id: string;
    employeeName: string;
    employeeId: string;
    type: string;
    from: string;
    to: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: string;
    createdAt: string;
}

export default function LeavePage() {
    /* ---------------- STATE ---------------- */
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Filter & Modal States
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    // "Apply" Form State
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    /* ---------------- EFFECTS ---------------- */
    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        const name = localStorage.getItem("userName") || "";
        let id = localStorage.getItem("employeeId") || "";
        
        if (!id) {
            try {
                const userObj = JSON.parse(localStorage.getItem("user") || "{}");
                id = userObj?.employeeId || "";
            } catch (e) {
                console.error("Error parsing user from localStorage:", e);
            }
        }
        
        setUserRole(role);
        setUserName(name);
        setEmployeeId(id);

        fetchLeaves(id, role);
    }, []);

    const fetchLeaves = async (id: string, role: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leave?employeeId=${id}&role=${role}`);
            const data = await res.json();
            if (data.leaves) {
                setRequests(data.leaves);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- HANDLERS ---------------- */
    const handleAction = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/leave", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status, reviewedBy: userName })
            });
            if (res.ok) {
                fetchLeaves(employeeId, userRole);
            }
        } catch (error) {
            console.error("Error updating leave:", error);
        }
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            employeeName: userName,
            employeeId: employeeId,
            type: leaveType,
            from: startDate,
            to: endDate,
            reason: reason
        };

        try {
            const res = await fetch("/api/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsSubmitted(true);
                setIsApplyModalOpen(false);
                fetchLeaves(employeeId, userRole);
                // Clear form
                setStartDate("");
                setEndDate("");
                setReason("");
                
                // Hide success message after 3s
                setTimeout(() => setIsSubmitted(false), 3000);
            }
        } catch (error) {
            console.error("Error submitting leave:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "Rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-orange-500/10 text-orange-400 border-orange-500/20";
        }
    };

    /* ---------------- CALCULATIONS ---------------- */
    const isSpecialRole = userRole === "HR Manager" || userRole === "Project Manager" || userRole === "ProjectManager" || userRole === "project_manager" || userRole === "hr";

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            req.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.reason?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "All" || req.status === statusFilter;
        const matchesType = typeFilter === "All" || req.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const pendingCount = requests.filter(r => r.status === "Pending").length;
    const approvedCount = requests.filter(r => r.status === "Approved").length;
    const rejectedCount = requests.filter(r => r.status === "Rejected").length;

    /* ---------------- RENDER ---------------- */
    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel transition-all flex flex-col justify-between min-h-[150px]"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 dark:text-muted-foreground/40">Pending Approval</span>
                        <div className="text-4xl font-bold text-foreground leading-none">{pendingCount}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Awaiting Review</span>
                    </div>

                    <div 
                        className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel transition-all flex flex-col justify-between min-h-[150px]"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 dark:text-muted-foreground/40">Approved Requests</span>
                        <div className="text-4xl font-bold text-foreground leading-none">{approvedCount}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Accepted</span>
                    </div>

                    <div 
                        className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-panel transition-all flex flex-col justify-between min-h-[150px]"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 dark:text-muted-foreground/40">Rejected Requests</span>
                        <div className="text-4xl font-bold text-foreground leading-none">{rejectedCount}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">Declined</span>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {isSubmitted && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="text-green-500" size={18} />
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Registry has been updated with your request successfully.</p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-panel rounded-2xl border border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input 
                                type="text" 
                                placeholder="SEARCH REGISTRY..."
                                className="w-full bg-surface border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-all tracking-widest"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative group lg:w-48">
                            <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <select 
                                className="w-full bg-surface border border-gray-700 rounded-xl pl-9 pr-8 py-2 text-[10px] font-bold text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer tracking-widest uppercase"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Casual Leave">Casual Leave</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Emergency Leave">Emergency Leave</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                        {["All", "Pending", "Approved", "Rejected"].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'bg-surface text-muted border border-gray-700 hover:border-gray-600'}`}
                            >
                                {status}
                            </button>
                        ))}
                        {!isSpecialRole && (
                            <button 
                                onClick={() => setIsApplyModalOpen(true)}
                                className="whitespace-nowrap ml-2 bg-foreground text-background font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                            >
                                <Plus size={14} /> Request Leave
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-panel rounded-2xl border border-gray-700 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20 bg-surface/50">
                        <div className="w-16 h-16 rounded-full bg-surface border border-gray-700 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-muted w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No requests found in this registry</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface border-b border-gray-700">
                                    {isSpecialRole && <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Member</th>}
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Timeline</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Justification</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-surface/50 transition-colors group">
                                        {isSpecialRole && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-surface border border-gray-700 flex items-center justify-center text-muted font-bold text-[10px]">
                                                        {req.employeeName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] font-bold text-foreground uppercase tracking-widest">{req.employeeName}</span>
                                                        <span className="block text-[8px] text-muted font-bold uppercase tracking-widest">{req.employeeId || 'ID UNKNOWN'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{req.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                                                {new Date(req.from).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                                                <span className="text-muted mx-1">/</span>
                                                {new Date(req.to).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] text-muted font-medium max-w-[180px] truncate uppercase tracking-widest" title={req.reason}>
                                                {req.reason}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isSpecialRole && req.status === "Pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(req._id, "Approved")}
                                                        className="h-8 w-8 bg-surface hover:bg-green-500/10 rounded-lg text-muted hover:text-green-500 transition-all border border-gray-700 hover:border-green-500/30 flex items-center justify-center"
                                                        title="Authorize"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req._id, "Rejected")}
                                                        className="h-8 w-8 bg-surface hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-all border border-gray-700 hover:border-red-500/30 flex items-center justify-center"
                                                        title="Decline"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-right">
                                                    <span className="text-[9px] text-muted font-bold uppercase tracking-widest block opacity-50">Verified By</span>
                                                    <span className="text-[10px] text-foreground font-bold uppercase tracking-widest block">{req.reviewedBy || 'System'}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Apply Leave Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-panel w-full max-w-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-surface">
                            <div>
                                <h3 className="text-xl font-bold font-heading text-foreground uppercase tracking-tight">Transmission Entry</h3>
                                <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">File New Application</p>
                            </div>
                            <button 
                                onClick={() => setIsApplyModalOpen(false)} 
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors text-muted"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitApplication} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Absence Category</label>
                                <div className="relative group">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                                    <select
                                        className="w-full pl-10 pr-10 py-3 bg-surface border border-gray-700 rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer tracking-widest uppercase"
                                        value={leaveType}
                                        onChange={(e) => setLeaveType(e.target.value)}
                                    >
                                        <option>Casual Leave</option>
                                        <option>Sick Leave</option>
                                        <option>Emergency Leave</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Commencement</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary uppercase tracking-widest"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Conclusion</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary uppercase tracking-widest"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Justification / Reason</label>
                                <textarea
                                    required
                                    className="w-full bg-surface border border-gray-700 rounded-xl p-4 text-xs font-medium text-foreground focus:outline-none focus:border-primary h-28 resize-none leading-relaxed uppercase tracking-widest"
                                    placeholder="STATE SPECIFIC REASON FOR ABSENCE..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <AlertCircle size={16} className="text-primary shrink-0" />
                                <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest leading-relaxed">Verification protocol: Applications are reviewed by HR within 24 working hours.</p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                                {submitting ? "Processing..." : "Submit Registry Entry"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
