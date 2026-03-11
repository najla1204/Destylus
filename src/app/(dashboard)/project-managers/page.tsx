"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Briefcase, Users, Plus, Trash2, X, LayoutGrid, List, Edit2, ChevronDown } from "lucide-react";
import Link from "next/link";

// Types
interface ProjectManager {
    id: string;
    name: string;
    email?: string;
    role: string;
    activeSites: number;
    teamSize: number;
    rating: number;
    status: string;
    avatar: string;
    site?: string;
}

interface SiteData {
    _id: string;
    name: string;
    engineers?: { name: string }[];
}

interface EngineerData {
    _id: string;
    name: string;
    site?: string;
}

const INITIAL_PM_STATE: ProjectManager[] = [];

export default function ProjectManagersPage() {
    const [pms, setPms] = useState<ProjectManager[]>(INITIAL_PM_STATE);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterSite, setFilterSite] = useState("");
    const [filterEngineer, setFilterEngineer] = useState("");
    const [sites, setSites] = useState<SiteData[]>([]);
    const [engineers, setEngineers] = useState<string[]>([]);
    const [allEngineers, setAllEngineers] = useState<EngineerData[]>([]);
    const [newPm, setNewPm] = useState({
        name: "",
        email: "",
        status: "Active",
        site: ""
    });
    const [editingPm, setEditingPm] = useState<ProjectManager | null>(null);

    // New states for the custom dropdown
    const [siteSearchQuery, setSiteSearchQuery] = useState("");
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
    const [isEditSiteDropdownOpen, setIsEditSiteDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);

    // Check if user is an engineer
    const isEngineer = userRole === "Engineer" || userRole === "Site Engineer" || userRole === "engineer" || userRole === "site_engineer";

    useEffect(() => {
        if (isEngineer) {
            // Optionally redirect, but for now we'll just return the blocked UI below
        }
        const fetchPMs = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/users?role=project_manager");
                if (res.ok) {
                    const data = await res.json();
                    const formattedPMs = data.users.map((u: any) => ({
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        role: u.role === 'project_manager' ? 'Project Manager' : u.role,
                        activeSites: u.allocatedSites?.length || 0,
                        teamSize: 0,
                        rating: 5.0,
                        status: u.isActive ? 'Active' : 'Inactive',
                        avatar: u.name.charAt(0).toUpperCase(),
                        site: u.site
                    }));
                    setPms(formattedPMs);
                }
            } catch (error) {
                console.error("Failed to fetch project managers", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPMs();
    }, []);

    // Fetch sites and engineers for filters
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await fetch("/api/sites");
                if (res.ok) {
                    const data = await res.json();
                    setSites(data.sites || data || []);
                    // Extract unique engineer names
                    const allEngineers: string[] = [];
                    (data.sites || data || []).forEach((site: SiteData) => {
                        if (site.engineers) {
                            site.engineers.forEach((eng: { name: string }) => {
                                if (eng.name && !allEngineers.includes(eng.name)) {
                                    allEngineers.push(eng.name);
                                }
                            });
                        }
                    });
                    setEngineers(allEngineers);
                }
            } catch {
                // silently fail
            }
        };
        const fetchEngineers = async () => {
            try {
                const res = await fetch("/api/users?role=engineer");
                if (res.ok) {
                    const data = await res.json();
                    setAllEngineers(data.users || []);
                }
            } catch {
                // silently fail
            }
        };
        fetchSites();
        fetchEngineers();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this manager?")) {
            try {
                const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setPms(pms.filter(pm => pm.id !== id));
                } else {
                    alert("Failed to delete project manager");
                }
            } catch (err) {
                console.error("Error deleting PM:", err);
            }
        }
    };

    const handleAddPm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPm.name,
                    email: newPm.email,
                    role: 'project_manager',
                    site: newPm.site
                })
            });

            if (res.ok) {
                const data = await res.json();
                const u = data.user;
                const manager: ProjectManager = {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    role: "Project Manager",
                    activeSites: u.allocatedSites?.length || 0,
                    teamSize: 0,
                    rating: 5.0,
                    status: u.isActive ? 'Active' : 'Inactive',
                    avatar: u.name.charAt(0).toUpperCase(),
                    site: u.site
                };
                setPms([...pms, manager]);
                setNewPm({ name: "", email: "", status: "Active", site: "" });
                setIsAddModalOpen(false);
            } else {
                const errorData = await res.json();
                alert(`Failed to create PM: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error("Error creating PM:", err);
            alert("An error occurred while creating the project manager.");
        }
    };

    const handleUpdatePm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPm) return;
        
        try {
            const res = await fetch(`/api/users/${editingPm.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingPm.name,
                    email: editingPm.email,
                    site: editingPm.site
                })
            });

            if (res.ok) {
                const updatedPMs = pms.map(pm => pm.id === editingPm.id ? editingPm : pm);
                setPms(updatedPMs);
                setEditingPm(null);
            } else {
                alert("Failed to update PM details.");
            }
        } catch (err) {
            console.error("Error updating PM:", err);
        }
    };

    const clearFilters = () => {
        setFilterSite("");
        setFilterEngineer("");
    };

    const filteredPMs = pms.filter(pm =>
        pm.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasActiveFilters = filterSite || filterEngineer;

    if (isLoading && userRole === null) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (isEngineer) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 font-bold text-3xl">
                    !
                </div>
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                <p className="text-muted mt-2 max-w-md">
                    You do not have permission to view the Project Managers directory. Please contact your administrator if you believe this is an error.
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
                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Managers</span>
                    <div className="text-4xl font-bold text-white leading-none">{pms.length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Registered project managers</span>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Active Managers</span>
                    <div className="text-4xl font-bold text-white leading-none">{pms.filter(pm => pm.status === "Active").length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Currently active</span>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Sites Assigned</span>
                    <div className="text-4xl font-bold text-white leading-none">{new Set(pms.map(pm => pm.site).filter(Boolean)).size}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Unique sites with PMs</span>
                </div>
                <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Engineers Managed</span>
                    <div className="text-4xl font-bold text-white leading-none">{allEngineers.filter(eng => pms.some(pm => pm.site && pm.site === eng.site)).length}</div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-purple-500">Under PM supervision</span>
                </div>
            </div>

            {/* Search Bar + Filters + Actions Row */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b border-gray-700 pb-4 mt-6">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider hidden xl:block">MANAGERS ({filteredPMs.length})</h2>
                <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap w-full xl:w-auto">
                    <div className="relative flex-1 min-w-[150px] max-w-sm w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search managers..."
                            className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Inline Filters */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted pr-1">
                            <Filter size={14} />
                        </div>
                        <select
                            value={filterSite}
                            onChange={(e) => setFilterSite(e.target.value)}
                            className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none max-w-[130px] truncate"
                        >
                            <option value="">All Sites</option>
                            {sites.map((site) => (
                                <option key={site._id} value={site.name}>{site.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterEngineer}
                            onChange={(e) => setFilterEngineer(e.target.value)}
                            className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none max-w-[150px] truncate"
                        >
                            <option value="">All Engineers</option>
                            {engineers.map((eng) => (
                                <option key={eng} value={eng}>{eng}</option>
                            ))}
                        </select>
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

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-primary-hover whitespace-nowrap ml-auto sm:ml-0"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Manager</span>
                    </button>
                </div>
            </div>

            {/* Views */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPMs.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl">
                            <Users className="mx-auto mb-4 text-gray-500 opacity-50" size={48} />
                            <h3 className="text-lg font-medium text-foreground mb-1">No Managers Found</h3>
                            <p className="text-sm">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        filteredPMs.map((pm) => (
                            <Link key={pm.id} href={`/project-managers/${pm.id}`} className="group relative flex flex-col rounded-xl border border-gray-700 bg-panel p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-14 w-14 rounded-full bg-orange-300 border border-orange-400/20 flex items-center justify-center text-xl font-bold text-black shrink-0">
                                            {pm.avatar}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{pm.name}</h3>
                                            <p className="text-sm text-muted">{pm.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setEditingPm(pm);
                                            }}
                                            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer relative z-20"
                                            title="Edit Manager"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(pm.id, e)}
                                            className="p-2 rounded-lg text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            title="Delete Manager"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <span className="absolute inset-0 z-0 sr-only">View {pm.name}</span>
                            </Link>
                        ))
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-muted border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Manager</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Sites Allocated</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Site Engineers</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredPMs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-muted">
                                        <Users className="mx-auto mb-3 text-gray-500 opacity-50" size={32} />
                                        <p className="text-sm">No managers match your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPMs.map((pm) => (
                                    <tr key={pm.id} className="hover:bg-surface/50 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-orange-300 border border-orange-400/50 flex items-center justify-center text-black font-bold shrink-0">
                                                    {pm.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link href={`/project-managers/${pm.id}`} className="font-bold text-foreground hover:text-primary transition-colors">
                                                        {pm.name}
                                                    </Link>
                                                    <span className="text-xs text-muted">{pm.role}</span>
                                                    {pm.email && (
                                                        <span className="text-xs text-muted">{pm.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {pm.site ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-semibold">
                                                        1
                                                    </span>
                                                    <span className="text-xs text-muted truncate max-w-[120px]" title={pm.site}>{pm.site}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {(() => {
                                                const count = pm.site ? allEngineers.filter(eng => eng.site === pm.site).length : 0;
                                                return count > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold">
                                                        {count}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted">0</span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditingPm(pm);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer relative z-20"
                                                    title="Edit Manager"
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(pm.id, e)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                                                    title="Delete Manager"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Manager Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add New Manager</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPm} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Manager Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newPm.name}
                                    onChange={(e) => setNewPm({ ...newPm, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., Jane Cooper"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Email ID</label>
                                <input
                                    type="email"
                                    required
                                    value={newPm.email}
                                    onChange={(e) => setNewPm({ ...newPm, email: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., jane@destylus.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Site</label>
                                <div className="relative">
                                    <div 
                                        className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-sm text-foreground focus-within:border-primary flex items-center justify-between cursor-pointer"
                                        onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                                    >
                                        <span className={newPm.site ? "text-foreground" : "text-muted"}>
                                            {newPm.site || "Select a Site"}
                                        </span>
                                        <ChevronDown size={16} className={`text-muted transition-transform ${isSiteDropdownOpen ? "rotate-180" : ""}`} />
                                    </div>
                                    {isSiteDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-panel border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                                            <div className="flex items-center px-3 border-b border-gray-600 bg-surface">
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
                                            <div className="max-h-48 overflow-y-auto w-full">
                                                {sites.filter(site => site.name.toLowerCase().includes(siteSearchQuery.toLowerCase())).length > 0 ? (
                                                    sites.filter(site => site.name.toLowerCase().includes(siteSearchQuery.toLowerCase())).map(site => (
                                                        <div 
                                                            key={site._id} 
                                                            className="px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer w-full text-left"
                                                            onClick={() => {
                                                                setNewPm({ ...newPm, site: site.name });
                                                                setIsSiteDropdownOpen(false);
                                                                setSiteSearchQuery("");
                                                            }}
                                                        >
                                                            {site.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-muted text-center w-full">No sites found</div>
                                                )}
                                                <div 
                                                    className="px-4 py-2 text-sm text-primary hover:bg-surface cursor-pointer border-t border-gray-600 w-full text-left font-medium"
                                                    onClick={() => {
                                                        setNewPm({ ...newPm, site: "" });
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
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-foreground hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover/90"
                                >
                                    Create Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Manager Modal */}
            {editingPm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Edit Manager</h2>
                            <button
                                onClick={() => setEditingPm(null)}
                                className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePm} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Manager Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingPm.name}
                                    onChange={(e) => setEditingPm({ ...editingPm, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., Jane Cooper"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Email ID</label>
                                <input
                                    type="email"
                                    value={editingPm.email || ""}
                                    onChange={(e) => setEditingPm({ ...editingPm, email: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., jane@destylus.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Site</label>
                                <div className="relative">
                                    <div 
                                        className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-sm text-foreground focus-within:border-primary flex items-center justify-between cursor-pointer"
                                        onClick={() => setIsEditSiteDropdownOpen(!isEditSiteDropdownOpen)}
                                    >
                                        <span className={editingPm.site ? "text-foreground" : "text-muted"}>
                                            {editingPm.site || "Select a Site"}
                                        </span>
                                        <ChevronDown size={16} className={`text-muted transition-transform ${isEditSiteDropdownOpen ? "rotate-180" : ""}`} />
                                    </div>
                                    {isEditSiteDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-panel border border-gray-600 rounded-lg shadow-xl overflow-hidden">
                                            <div className="flex items-center px-3 border-b border-gray-600 bg-surface">
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
                                            <div className="max-h-48 overflow-y-auto w-full">
                                                {sites.filter(site => site.name.toLowerCase().includes(siteSearchQuery.toLowerCase())).length > 0 ? (
                                                    sites.filter(site => site.name.toLowerCase().includes(siteSearchQuery.toLowerCase())).map(site => (
                                                        <div 
                                                            key={site._id} 
                                                            className="px-4 py-2 text-sm text-foreground hover:bg-surface cursor-pointer w-full text-left"
                                                            onClick={() => {
                                                                setEditingPm({ ...editingPm, site: site.name });
                                                                setIsEditSiteDropdownOpen(false);
                                                                setSiteSearchQuery("");
                                                            }}
                                                        >
                                                            {site.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-muted text-center w-full">No sites found</div>
                                                )}
                                                <div 
                                                    className="px-4 py-2 text-sm text-primary hover:bg-surface cursor-pointer border-t border-gray-600 w-full text-left font-medium"
                                                    onClick={() => {
                                                        setEditingPm({ ...editingPm, site: "" });
                                                        setIsEditSiteDropdownOpen(false);
                                                        setSiteSearchQuery("");
                                                    }}
                                                >
                                                    Clear Selection
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingPm(null)}
                                    className="flex-1 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-foreground hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover/90"
                                >
                                    Update Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
