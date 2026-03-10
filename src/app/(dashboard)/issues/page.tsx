"use client";

import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, CheckCircle2, Clock, Plus, X, MapPin, ChevronDown } from "lucide-react";

interface Issue {
    _id: string;
    title: string;
    description?: string;
    status: "Open" | "In Progress" | "Resolved";
    priority: "Low" | "Medium" | "High" | "Critical";
    raisedBy?: string;
    raisedByRole?: string;
    siteId: string;
    siteName: string;
    createdAt: string;
    updatedAt: string;
}

interface Site {
    _id: string;
    name: string;
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [siteFilter, setSiteFilter] = useState<string>("all");

    // Modal
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newIssue, setNewIssue] = useState({
        title: "",
        description: "",
        priority: "Medium" as string,
        siteId: "",
        raisedBy: "",
        raisedByRole: "Site Engineer" as string,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issueRes, siteRes] = await Promise.all([
                    fetch("/api/issues"),
                    fetch("/api/sites"),
                ]);
                if (issueRes.ok) {
                    const data = await issueRes.json();
                    setIssues(data);
                }
                if (siteRes.ok) {
                    const siteData = await siteRes.json();
                    setSites(siteData);
                }
            } catch (err) {
                console.error("Failed to fetch issues:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIssue.title || !newIssue.siteId) return;
        try {
            const res = await fetch(`/api/sites/${newIssue.siteId}/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newIssue.title,
                    description: newIssue.description,
                    priority: newIssue.priority,
                    raisedBy: newIssue.raisedBy || undefined,
                    raisedByRole: newIssue.raisedByRole,
                }),
            });
            if (res.ok) {
                // Refetch all issues to get enriched data
                const r = await fetch("/api/issues");
                if (r.ok) setIssues(await r.json());
                setIsAddOpen(false);
                setNewIssue({ title: "", description: "", priority: "Medium", siteId: "", raisedBy: "", raisedByRole: "Site Engineer" });
            }
        } catch (err) {
            console.error("Failed to add issue:", err);
        }
    };

    const handleStatusChange = async (issueId: string, siteId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/sites/${siteId}/issues`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId, status: newStatus }),
            });
            if (res.ok) {
                setIssues(prev =>
                    prev.map(i => (i._id === issueId ? { ...i, status: newStatus as Issue["status"] } : i))
                );
            }
        } catch (err) {
            console.error("Failed to update issue status:", err);
        }
    };

    // Filtered issues
    const filteredIssues = issues.filter(issue => {
        const matchesSearch =
            issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (issue.raisedBy || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
        const matchesSite = siteFilter === "all" || issue.siteId === siteFilter;
        return matchesSearch && matchesStatus && matchesPriority && matchesSite;
    });

    // Stats
    const openCount = issues.filter(i => i.status === "Open").length;
    const inProgressCount = issues.filter(i => i.status === "In Progress").length;
    const resolvedCount = issues.filter(i => i.status === "Resolved").length;
    const criticalCount = issues.filter(i => i.priority === "Critical" && i.status !== "Resolved").length;

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted mt-4 text-sm">Loading Issues...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => setStatusFilter(statusFilter === "Open" ? "all" : "Open")}
                    className={`rounded-xl border p-5 bg-panel shadow-sm text-left transition-all hover:scale-[1.02] cursor-pointer ${
                        statusFilter === "Open" ? "border-red-500 ring-1 ring-red-500/30" : "border-gray-700"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Open Issues</span>
                        <div className="rounded-lg bg-red-500/10 p-2">
                            <AlertTriangle size={18} className="text-red-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{openCount}</div>
                    <span className="text-xs text-red-400">Needs attention</span>
                </button>
                <button
                    onClick={() => setStatusFilter(statusFilter === "In Progress" ? "all" : "In Progress")}
                    className={`rounded-xl border p-5 bg-panel shadow-sm text-left transition-all hover:scale-[1.02] cursor-pointer ${
                        statusFilter === "In Progress" ? "border-blue-500 ring-1 ring-blue-500/30" : "border-gray-700"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">In Progress</span>
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <Clock size={18} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{inProgressCount}</div>
                    <span className="text-xs text-blue-400">Being worked on</span>
                </button>
                <button
                    onClick={() => setStatusFilter(statusFilter === "Resolved" ? "all" : "Resolved")}
                    className={`rounded-xl border p-5 bg-panel shadow-sm text-left transition-all hover:scale-[1.02] cursor-pointer ${
                        statusFilter === "Resolved" ? "border-primary ring-1 ring-primary/30" : "border-gray-700"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Resolved</span>
                        <div className="rounded-lg bg-primary/10 p-2">
                            <CheckCircle2 size={18} className="text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{resolvedCount}</div>
                    <span className="text-xs text-primary">Completed</span>
                </button>
                <div className="rounded-xl border border-gray-700 p-5 bg-panel shadow-sm relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${criticalCount > 0 ? "bg-red-500 animate-pulse" : "bg-gray-700"}`}></div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Critical Active</span>
                        <div className="rounded-lg bg-orange-500/10 p-2">
                            <AlertTriangle size={18} className="text-orange-400" />
                        </div>
                    </div>
                    <div className={`mt-2 text-3xl font-bold ${criticalCount > 0 ? "text-red-400" : "text-foreground"}`}>{criticalCount}</div>
                    <span className={`text-xs ${criticalCount > 0 ? "text-red-400" : "text-muted"}`}>
                        {criticalCount > 0 ? "Urgent!" : "All clear"}
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-b border-gray-700 pb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search issues, sites, or people..."
                        className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Filter size={14} />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Priority</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <select
                        value={siteFilter}
                        onChange={(e) => setSiteFilter(e.target.value)}
                        className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Sites</option>
                        {sites.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
                >
                    <Plus size={16} /> Raise Issue
                </button>
            </div>

            {/* Issues Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface text-muted border-b border-gray-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Issue</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Site</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Raised By</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Priority</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider">Reported</th>
                            <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredIssues.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <AlertTriangle className="mx-auto mb-3 text-gray-500 opacity-50" size={32} />
                                    <p className="text-muted text-sm">No issues found matching your filters.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredIssues.map(issue => (
                                <tr key={issue._id} className="hover:bg-surface/50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1 max-w-[300px]">
                                            <span className="font-semibold text-foreground">{issue.title}</span>
                                            {issue.description && (
                                                <span className="text-xs text-muted truncate">{issue.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="flex items-center gap-1.5 text-muted text-sm">
                                            <MapPin size={13} className="shrink-0" />
                                            {issue.siteName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {issue.raisedBy ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-foreground text-sm font-medium">{issue.raisedBy}</span>
                                                {issue.raisedByRole && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded w-fit border ${
                                                        issue.raisedByRole === "Project Manager"
                                                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    }`}>
                                                        {issue.raisedByRole}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted italic text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                            issue.priority === "Critical" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            issue.priority === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                            issue.priority === "Medium" ? "bg-primary/10 text-primary border-primary/20" :
                                            "bg-surface text-muted border-gray-700"
                                        }`}>
                                            {issue.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                            issue.status === "Open" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            issue.status === "In Progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                            "bg-primary/10 text-primary border-primary/20"
                                        }`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-muted text-xs">
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="relative inline-block">
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, issue.siteId, e.target.value)}
                                                className="rounded-lg border border-gray-700 bg-surface px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer pr-6"
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-muted text-right">
                Showing {filteredIssues.length} of {issues.length} issues
            </div>

            {/* Add Issue Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-panel shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <AlertTriangle className="text-primary" size={20} /> Raise New Issue
                            </h2>
                            <button onClick={() => setIsAddOpen(false)} className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddIssue} className="p-6 flex flex-col gap-5 overflow-y-auto">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Site <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={newIssue.siteId}
                                    onChange={(e) => setNewIssue({ ...newIssue, siteId: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Select a site</option>
                                    {sites.map(s => (
                                        <option key={s._id} value={s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Issue Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={newIssue.title}
                                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="E.g. Water leakage in basement"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Description <span className="text-muted text-xs">(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={newIssue.description}
                                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none resize-none"
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Priority</label>
                                    <select
                                        value={newIssue.priority}
                                        onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                                        className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Low">🟢 Low</option>
                                        <option value="Medium">🟡 Medium</option>
                                        <option value="High">🟠 High</option>
                                        <option value="Critical">🔴 Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
                                    <select
                                        value={newIssue.raisedByRole}
                                        onChange={(e) => setNewIssue({ ...newIssue, raisedByRole: e.target.value })}
                                        className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="Site Engineer">Site Engineer</option>
                                        <option value="Project Manager">Project Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Raised By <span className="text-muted text-xs">(Name)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newIssue.raisedBy}
                                    onChange={(e) => setNewIssue({ ...newIssue, raisedBy: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="E.g. John Doe"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-black shadow-md hover:bg-primary-hover transition-all active:scale-[0.98]"
                                >
                                    Submit Issue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
