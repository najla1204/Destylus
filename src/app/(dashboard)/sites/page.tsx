"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Trash2, Search, X, Check, Link as LinkIcon, LayoutGrid, List } from "lucide-react";

// Mock data type for Sites
interface Site {
    _id: string;
    name: string;
    locationName: string;
    locationLink: string;
    status: "Active" | "Completed" | "Planning" | "Pending";
    budget: number;
    managers: string[];
    engineers: string[];
    issueCount?: number;
}

// Mock Data Type for PM
interface ProjectManager {
    id: string;
    name: string;
    role: string;
    department: string;
    activeSites: number;
    teamSize: number;
    experience: string;
    rating: number;
    status: string;
    avatar: string;
}





// MultiSelect Dropdown Component
function MultiSelect({
    options,
    selected,
    onChange,
    placeholder
}: {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const handleRemove = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(selected.filter((item) => item !== option));
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="min-h-[42px] w-full cursor-pointer rounded-lg border border-gray-600 bg-surface px-3 py-1.5 flex flex-wrap gap-2 items-center focus-within:border-primary transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected.length === 0 && (
                    <span className="text-gray-400 text-sm px-1 py-0.5">{placeholder}</span>
                )}
                {selected.map(sel => (
                    <span key={sel} className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded text-sm">
                        {sel}
                        <div
                            onClick={(e) => handleRemove(e, sel)}
                            className="hover:bg-primary/30 rounded-full p-0.5 cursor-pointer"
                        >
                            <X size={12} />
                        </div>
                    </span>
                ))}
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-600 bg-panel shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input
                                type="text"
                                className="w-full bg-surface border border-gray-600 rounded px-8 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="p-2 text-sm text-muted text-center">No results found</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface cursor-pointer rounded text-sm text-foreground transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(opt);
                                    }}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-primary border-primary text-black' : 'border-gray-500'}`}>
                                        {selected.includes(opt) && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    {opt}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export default function SitesPage() {
    const router = useRouter();
    const [sites, setSites] = useState<Site[]>([]);
    const [availablePMs, setAvailablePMs] = useState<string[]>([]);
    const [availableEngineers, setAvailableEngineers] = useState<string[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // View mode and filtering state
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
    const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
    
    const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Site>>({});
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        setUserRole(localStorage.getItem("userRole") || "");
        setUserName(localStorage.getItem("userName") || "");
    }, []);

    const isEngineer = userRole === "Engineer" || userRole === "Site Engineer" || userRole === "engineer" || userRole === "site_engineer";
    const isPM = userRole === "Project Manager" || userRole === "project_manager" || userRole === "project manager";
    const canEditSites = !isEngineer && !isPM;

    useEffect(() => {
        // Fetch sites from MongoDB API with localStorage fallback
        const fetchSites = async () => {
            try {
                const res = await fetch('/api/sites');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setSites(data);
                        // Sync to localStorage as backup
                        localStorage.setItem("destylus_dashboard_sites_v4", JSON.stringify(data));
                    } else {
                        // MongoDB returned empty — try to migrate localStorage data
                        const savedSites = localStorage.getItem("destylus_dashboard_sites_v4");
                        if (savedSites) {
                            const parsed = JSON.parse(savedSites);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                // Migrate each localStorage site to MongoDB
                                for (const s of parsed) {
                                    try {
                                        await fetch('/api/sites', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: s.name,
                                                locationName: s.locationName || s.location || '',
                                                locationLink: s.locationLink || '',
                                                status: s.status || 'Active',
                                                budget: s.budget || 0,
                                                managers: s.managers || [],
                                                engineers: s.engineers || [],
                                            })
                                        });
                                    } catch (migErr) {
                                        console.error('Migration error for site:', s.name, migErr);
                                    }
                                }
                                // Re-fetch after migration
                                const res2 = await fetch('/api/sites');
                                if (res2.ok) {
                                    const migrated = await res2.json();
                                    if (Array.isArray(migrated)) {
                                        setSites(migrated);
                                        localStorage.setItem("destylus_dashboard_sites_v4", JSON.stringify(migrated));
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // API error — fallback to localStorage
                    const savedSites = localStorage.getItem("destylus_dashboard_sites_v4");
                    if (savedSites) {
                        setSites(JSON.parse(savedSites));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch sites', e);
                // Fallback to localStorage
                const savedSites = localStorage.getItem("destylus_dashboard_sites_v4");
                if (savedSites) {
                    try {
                        setSites(JSON.parse(savedSites));
                    } catch (parseErr) {
                        console.error('Failed to parse localStorage sites', parseErr);
                    }
                }
            }
        };
        fetchSites();

        const fetchUsers = async () => {
            try {
                const [pmRes, engRes] = await Promise.all([
                    fetch('/api/users?role=project_manager'),
                    fetch('/api/users?role=engineer')
                ]);
                
                if (pmRes.ok) {
                    const pmData = await pmRes.json();
                    if (pmData.users) {
                        setAvailablePMs(pmData.users.map((u: any) => u.name));
                    }
                }
                if (engRes.ok) {
                    const engData = await engRes.json();
                    if (engData.users) {
                        setAvailableEngineers(engData.users.map((u: any) => u.name));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchUsers();
    }, []);

    const [newSite, setNewSite] = useState<Partial<Site>>({
        name: "",
        locationName: "",
        locationLink: "",
        status: "Active",
        managers: [],
        engineers: [],
    });

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this site?")) {
            try {
                await fetch(`/api/sites/${id}`, { method: 'DELETE' });
                setSites(prev => prev.filter((site) => site._id !== id));
            } catch (err) {
                console.error('Failed to delete site:', err);
            }
        }
    };

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSite.name || !newSite.locationName) return;

        try {
            const res = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newSite.name,
                    locationName: newSite.locationName,
                    locationLink: newSite.locationLink || "",
                    status: newSite.status || "Active",
                    budget: 0,
                    managers: newSite.managers || [],
                    engineers: newSite.engineers || [],
                })
            });
            if (res.ok) {
                const created = await res.json();
                setSites(prev => [created, ...prev]);
                setNewSite({ name: "", locationName: "", locationLink: "", status: "Active", managers: [], engineers: [] });
                setIsAddModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to create site:', err);
        }
    };

    const handleEditClick = (site: Site, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSiteId(site._id);
        setEditForm({ ...site });
    };

    const handleSaveEdit = async () => {
        if (!editForm.name || !editForm.locationName) return;
        
        try {
            const res = await fetch(`/api/sites/${editingSiteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updated = await res.json();
                setSites(prev => prev.map(site => site._id === editingSiteId ? { ...site, ...updated } : site));
            }
        } catch (err) {
            console.error('Failed to update site:', err);
        }
        setEditingSiteId(null);
        setEditForm({});
    };

    const handleCancelEdit = () => {
        setEditingSiteId(null);
        setEditForm({});
    };

    // Filter Logic
    const filteredSites = sites.filter(site => {
        // Restrict visibility for Site Engineers
        if (isEngineer && userName && !site.engineers.includes(userName)) {
            return false;
        }

        // Restrict visibility for Project Managers
        if (isPM && userName && !site.managers.includes(userName)) {
            return false;
        }

        const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              site.locationName.toLowerCase().includes(searchQuery.toLowerCase());
                              
        const matchesPM = selectedPMs.length === 0 || 
                          site.managers.some(pm => selectedPMs.includes(pm));
                          
        const matchesEng = isEngineer ? true : (selectedEngineers.length === 0 || 
                           site.engineers.some(eng => selectedEngineers.includes(eng)));
                           
        return matchesSearch && matchesPM && matchesEng;
    });

    // Derive available PMs dynamically for Site Engineers
    const displayAvailablePMs = isEngineer ? 
        Array.from(new Set(sites.filter(s => userName && s.engineers.includes(userName)).flatMap(s => s.managers))) : 
        availablePMs;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50 cursor-pointer">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Sites</span>
                        <div className="text-4xl font-bold text-white leading-none">{sites.length}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">All Records</span>
                    </div>
                    
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50 cursor-pointer">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Active Sites</span>
                        <div className="text-4xl font-bold text-white leading-none">{sites.filter(s => s.status === "Active").length}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-500">Currently Active</span>
                    </div>
                    
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50 cursor-pointer">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Engineers</span>
                        <div className="text-4xl font-bold text-white leading-none">{sites.reduce((acc, s) => acc + (s.engineers?.length || 0), 0)}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Allocated</span>
                    </div>
                    
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50 cursor-pointer">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Open Issues</span>
                        <div className="text-4xl font-bold text-white leading-none">{sites.reduce((acc, s) => acc + (s.issueCount || 0), 0)}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">Require Attn</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-panel rounded-2xl border border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-1 min-w-[200px] lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                placeholder="SEARCH SITES..."
                                className="w-full bg-surface border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-all tracking-widest uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {!isPM && (
                            <div className="w-48 text-[10px] uppercase tracking-widest text-foreground font-bold font-mono">
                                <MultiSelect 
                                    options={displayAvailablePMs} 
                                    selected={selectedPMs} 
                                    onChange={setSelectedPMs}
                                    placeholder="FILTER BY PM..." 
                                />
                            </div>
                        )}
                        {!isEngineer && (
                            <div className="w-48 text-[10px] uppercase tracking-widest text-foreground font-bold font-mono">
                                <MultiSelect 
                                    options={availableEngineers} 
                                    selected={selectedEngineers} 
                                    onChange={setSelectedEngineers}
                                    placeholder="FILTER BY ENGINEER..." 
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <div className="flex items-center rounded-xl border border-gray-700 bg-surface p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`rounded-lg p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-black" : "text-muted hover:text-foreground"}`}
                                title="Grid View"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`rounded-lg p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-black" : "text-muted hover:text-foreground"}`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                        </div>
                        
                        {canEditSites && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="whitespace-nowrap bg-foreground text-background font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                            >
                                <Plus size={14} /> Add Site
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSites.map((site) => (
                        <div
                            key={site._id}
                            onClick={() => router.push(`/sites/${site._id}`)}
                            className="group relative flex flex-col gap-4 rounded-xl border border-gray-700 bg-panel p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer"
                        >
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-primary mb-1 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    SITE {site._id.slice(-3).toUpperCase()}
                                </span>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors pr-8">
                                    {site.name}
                                </h3>
                            </div>
                            {canEditSites && (
                                <button
                                    onClick={(e) => handleDelete(site._id, e)}
                                    className="absolute top-4 right-4 rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100"
                                    title="Delete Site"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-2 text-sm text-muted">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                                <span>{site.locationName}</span>
                            </div>
                            {site.locationLink && (
                                <a
                                    href={site.locationLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors ml-6"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <LinkIcon size={14} />
                                    View on Map
                                </a>
                            )}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted uppercase tracking-wider font-semibold">Managers</span>
                                <span className="text-sm font-medium text-foreground line-clamp-1" title={site.managers.join(", ")}>
                                    {site.managers.length > 0 ? (
                                        site.managers.length > 1 ? `${site.managers.length} Assigned` : site.managers[0]
                                    ) : (
                                        <span className="text-gray-500 italic">None</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted uppercase tracking-wider font-semibold">Engineers</span>
                                <span className="text-sm font-medium text-foreground line-clamp-1" title={site.engineers.join(", ")}>
                                    {site.engineers.length > 0 ? (
                                        site.engineers.length > 1 ? `${site.engineers.length} Assigned` : site.engineers[0]
                                    ) : (
                                        <span className="text-gray-500 italic">None</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4">
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm ${site.status === "Active"
                                    ? "bg-success/10 text-success border-success/20"
                                    : (site.status === "Pending" || site.status === "Planning")
                                        ? "bg-warning/10 text-warning border-warning/20"
                                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                    }`}
                            >
                                {site.status}
                            </span>
                        </div>
                    </div>
                ))}

                {filteredSites.length === 0 && (
                    <div className="col-span-full py-16 text-center text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl">
                        <MapPin className="mx-auto mb-4 text-gray-500 opacity-50" size={48} />
                        <h3 className="text-lg font-medium text-foreground mb-1">No Sites Found</h3>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
            ) : (
                <div className="bg-panel rounded-2xl border border-gray-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Site ID & Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Project Managers</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Site Engineers</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Issues</th>
                                    {canEditSites && (
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredSites.map((site) => (
                                    <tr 
                                        key={site._id} 
                                        onClick={() => router.push(`/sites/${site._id}`)}
                                        className="hover:bg-surface/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">SITE {site._id.slice(-3).toUpperCase()}</span>
                                                <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">{site.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} /> {site.locationName}</span>
                                                {site.locationLink && (
                                                    <a href={site.locationLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 ml-4 flex items-center gap-1">
                                                        <LinkIcon size={10} /> MAPS
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {site.managers.length > 0 ? site.managers.map(pm => (
                                                    <span key={pm} className="px-2 py-0.5 rounded border border-gray-600 bg-surface text-[10px] font-bold text-foreground uppercase tracking-widest">{pm}</span>
                                                )) : <span className="text-gray-500 italic text-[10px] uppercase tracking-widest">NONE</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {site.engineers.length > 0 ? site.engineers.map(eng => (
                                                    <span key={eng} className="px-2 py-0.5 rounded border border-gray-600 bg-surface text-[10px] font-bold text-foreground uppercase tracking-widest">{eng}</span>
                                                )) : <span className="text-gray-500 italic text-[10px] uppercase tracking-widest">NONE</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-widest border shadow-sm ${
                                                (site.issueCount || 0) > 0 ? "bg-primary text-black border-transparent" : "bg-success text-black border-success/20"
                                            }`}>
                                                {site.issueCount || 0} ACTIVE
                                            </span>
                                        </td>
                                        {canEditSites && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => handleEditClick(site, e)}
                                                        className="h-8 w-8 bg-surface hover:bg-blue-400/10 rounded-lg text-muted hover:text-blue-400 transition-all border border-gray-700 hover:border-blue-400/30 flex items-center justify-center"
                                                        title="Edit Site"
                                                    >
                                                        <span className="text-[10px] font-bold uppercase">EDIT</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(site._id, e)}
                                                        className="h-8 w-8 bg-surface hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-all border border-gray-700 hover:border-red-500/30 flex items-center justify-center"
                                                        title="Delete Site"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredSites.length === 0 && (
                        <div className="py-20 text-center bg-surface/50">
                            <div className="w-16 h-16 rounded-full bg-surface border border-gray-700 flex items-center justify-center mx-auto mb-4">
                                <MapPin className="text-muted w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No sites match your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Site Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-panel shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Plus className="text-primary" /> Add New Site
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                            <form id="add-site-form" onSubmit={handleAddSite} className="flex flex-col gap-5">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Basic Info</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Site Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newSite.name}
                                            onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="e.g., Riverside Complex Phase 1"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Status
                                        </label>
                                        <select
                                            value={newSite.status}
                                            onChange={(e) => setNewSite({ ...newSite, status: e.target.value as any })}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Active">🟢 Active</option>
                                            <option value="Planning">🟡 Planning</option>
                                            <option value="Pending">🟠 Pending</option>
                                            <option value="Completed">⚪ Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Location specific details</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                                            Location Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newSite.locationName}
                                            onChange={(e) => setNewSite({ ...newSite, locationName: e.target.value })}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="e.g., 123 West River Rd, New York"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                                            <span>Google Maps Link</span>
                                            <span className="text-xs text-muted font-normal">Optional</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={newSite.locationLink}
                                            onChange={(e) => setNewSite({ ...newSite, locationLink: e.target.value })}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="https://maps.google.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Staffing</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Project Managers
                                        </label>
                                        <MultiSelect
                                            options={availablePMs}
                                            selected={newSite.managers || []}
                                            onChange={(selected) => setNewSite({ ...newSite, managers: selected })}
                                            placeholder="Select managers..."
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Site Engineers
                                        </label>
                                        <MultiSelect
                                            options={availableEngineers}
                                            selected={newSite.engineers || []}
                                            onChange={(selected) => setNewSite({ ...newSite, engineers: selected })}
                                            placeholder="Select engineers..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 shrink-0 bg-panel rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-site-form"
                                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-black shadow-md hover:bg-primary-hover hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                Create Site
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Site Modal */}
            {editingSiteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-panel shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700 shrink-0">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <MapPin className="text-primary" /> Edit Site
                            </h2>
                            <button
                                onClick={handleCancelEdit}
                                className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                            <div className="flex flex-col gap-5">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Basic Info</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Site Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="e.g., Riverside Complex Phase 1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Location Details</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                                            Location Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.locationName || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, locationName: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="e.g., 123 West River Rd, New York"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
                                            <span>Google Maps Link</span>
                                            <span className="text-xs text-muted font-normal">Optional</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={editForm.locationLink || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, locationLink: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                            placeholder="https://maps.google.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Staffing</h3>
                                    
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Project Managers
                                        </label>
                                        <MultiSelect
                                            options={availablePMs}
                                            selected={editForm.managers || []}
                                            onChange={(selected) => setEditForm(prev => ({ ...prev, managers: selected }))}
                                            placeholder="Select managers..."
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                                            Site Engineers
                                        </label>
                                        <MultiSelect
                                            options={availableEngineers}
                                            selected={editForm.engineers || []}
                                            onChange={(selected) => setEditForm(prev => ({ ...prev, engineers: selected }))}
                                            placeholder="Select engineers..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 shrink-0 bg-panel rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="flex-1 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-black shadow-md hover:bg-primary-hover hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

