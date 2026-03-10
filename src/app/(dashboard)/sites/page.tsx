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



const STATIC_ENGINEERS = [
    "John Doe",
    "Alex Smith",
    "Sarah Connor",
    "Mike Ross",
    "Emily Chen",
    "David Wilson"
];

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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // View mode and filtering state
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
    const [selectedEngineers, setSelectedEngineers] = useState<string[]>([]);
    
    const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Site>>({});

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

        // Load dynamic Project Managers from localStorage (still used for PMs list)
        const savedPMs = localStorage.getItem("destylus_dashboard_pms_v2");
        if (savedPMs) {
            try {
                const parsed: ProjectManager[] = JSON.parse(savedPMs);
                const pmNames = parsed.map(pm => pm.name);
                setAvailablePMs(pmNames);
            } catch (e) {
                console.error("Failed to parse PMs", e);
            }
        } else {
            setAvailablePMs(["John Doe", "Sarah Smith", "Mike Johnson"]);
        }
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
        const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              site.locationName.toLowerCase().includes(searchQuery.toLowerCase());
                              
        const matchesPM = selectedPMs.length === 0 || 
                          site.managers.some(pm => selectedPMs.includes(pm));
                          
        const matchesEng = selectedEngineers.length === 0 || 
                           site.engineers.some(eng => selectedEngineers.includes(eng));
                           
        return matchesSearch && matchesPM && matchesEng;
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-700 pb-4">
                <div className="flex flex-1 items-center gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search sites or locations..."
                            className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-48">
                        <MultiSelect 
                            options={availablePMs} 
                            selected={selectedPMs} 
                            onChange={setSelectedPMs}
                            placeholder="Filter by PM..." 
                        />
                    </div>
                    <div className="w-48">
                        <MultiSelect 
                            options={STATIC_ENGINEERS} 
                            selected={selectedEngineers} 
                            onChange={setSelectedEngineers}
                            placeholder="Filter by Engineer..." 
                        />
                    </div>
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

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        Add New Site
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Total Sites</span>
                        <div className="rounded-lg bg-primary/10 p-2">
                            <MapPin size={18} className="text-primary" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{sites.length}</div>
                    <span className="text-xs text-muted">All registered sites</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Active Sites</span>
                        <div className="rounded-lg bg-green-500/10 p-2">
                            <Check size={18} className="text-green-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{sites.filter(s => s.status === "Active").length}</div>
                    <span className="text-xs text-green-400">Currently active</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Total Engineers</span>
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <Plus size={18} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{sites.reduce((acc, s) => acc + (s.engineers?.length || 0), 0)}</div>
                    <span className="text-xs text-muted">Allocated across sites</span>
                </div>
                <div className="rounded-xl border border-gray-700 bg-panel p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">Open Issues</span>
                        <div className="rounded-lg bg-red-500/10 p-2">
                            <Trash2 size={18} className="text-red-400" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{sites.reduce((acc, s) => acc + (s.issueCount || 0), 0)}</div>
                    <span className="text-xs text-red-400">Requires attention</span>
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
                            <button
                                onClick={(e) => handleDelete(site._id, e)}
                                className="absolute top-4 right-4 rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100"
                                title="Delete Site"
                            >
                                <Trash2 size={18} />
                            </button>
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
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-muted">
                            <tr>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Site ID & Name</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Location</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Project Managers</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider">Site Engineers</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Issues</th>
                                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredSites.map((site) => (
                                <tr 
                                    key={site._id} 
                                    onClick={() => router.push(`/sites/${site._id}`)}
                                    className="hover:bg-surface/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-primary">SITE {site._id.slice(-3).toUpperCase()}</span>
                                            <span className="font-bold text-foreground">{site.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted flex items-center gap-1.5"><MapPin size={14} /> {site.locationName}</span>
                                            {site.locationLink && (
                                                <a href={site.locationLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-400 hover:text-blue-300 ml-5 flex items-center gap-1">
                                                    <LinkIcon size={10} /> Maps
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {site.managers.length > 0 ? site.managers.map(pm => (
                                                <span key={pm} className="px-2 py-0.5 rounded bg-gray-700 text-xs text-foreground">{pm}</span>
                                            )) : <span className="text-gray-500 italic text-xs">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {site.engineers.length > 0 ? site.engineers.map(eng => (
                                                <span key={eng} className="px-2 py-0.5 rounded bg-gray-700 text-xs text-foreground">{eng}</span>
                                            )) : <span className="text-gray-500 italic text-xs">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm ${
                                            (site.issueCount || 0) > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-success/10 text-success border-success/20"
                                        }`}>
                                            {site.issueCount || 0} Active
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => handleEditClick(site, e)}
                                                className="rounded px-3 py-1 text-blue-400 hover:bg-blue-400/10 transition-colors inline-flex text-sm font-medium"
                                                title="Edit Site"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(site._id, e)}
                                                className="rounded p-1.5 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors inline-flex"
                                                title="Delete Site"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredSites.length === 0 && (
                        <div className="py-12 text-center text-muted">
                            <MapPin className="mx-auto mb-3 text-gray-500 opacity-50" size={32} />
                            <p className="text-sm">No sites match your filters.</p>
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
                                            options={STATIC_ENGINEERS}
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
                                            options={STATIC_ENGINEERS}
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

