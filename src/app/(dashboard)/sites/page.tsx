"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Trash2, Search, X } from "lucide-react";

// Mock data type for Sites
interface Site {
    id: string;
    name: string;
    location: string;
    status: "Active" | "Completed" | "Pending";
    manager: string;
}

const initialSites: Site[] = [
    {
        id: "1",
        name: "Skyline Tower A",
        location: "Downtown District",
        status: "Active",
        manager: "John Doe",
    },
    {
        id: "2",
        name: "City Bridge Renovation",
        location: "West River",
        status: "Pending",
        manager: "Sarah Smith",
    },
    {
        id: "3",
        name: "Green Valley Mall",
        location: "Suburban Area",
        status: "Active",
        manager: "Mike Johnson",
    },
];

export default function SitesPage() {
    const [sites, setSites] = useState<Site[]>(initialSites);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const savedSites = localStorage.getItem("destylus_dashboard_sites_v3");
        if (savedSites) {
            setSites(JSON.parse(savedSites));
        } else {
            localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(initialSites));
        }
    }, []);

    const [newSite, setNewSite] = useState<Partial<Site>>({
        name: "",
        location: "",
        status: "Active",
        manager: "",
    });

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if clicking delete inside a link
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this site?")) {
            const updatedSites = sites.filter((site) => site.id !== id);
            setSites(updatedSites);
            localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(updatedSites));
        }
    };

    const handleAddSite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSite.name || !newSite.location || !newSite.manager) return;

        const nextId = (sites.length > 0
            ? Math.max(...sites.map(s => parseInt(s.id) || 0)) + 1
            : 1
        ).toString();

        const site: Site = {
            id: nextId,
            ...newSite,
        } as Site;

        const updatedSites = [...sites, site];
        setSites(updatedSites);
        localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(updatedSites));
        setNewSite({ name: "", location: "", status: "Active", manager: "" });
        setIsAddModalOpen(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Site Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-primary-hover"
                >
                    <Plus size={18} />
                    Add New Site
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sites.map((site) => (
                    <Link
                        key={site.id}
                        href={`/sites/${site.id}`}
                        className="group relative flex flex-col gap-4 rounded-xl border border-gray-700 bg-panel p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary mb-1">{site.id.toUpperCase()}</span>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                    {site.name}
                                </h3>
                            </div>
                            <button
                                onClick={(e) => handleDelete(site.id, e)}
                                className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors z-10"
                                title="Delete Site"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted">
                            <MapPin size={16} />
                            <span>{site.location}</span>
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-gray-700 pt-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted">Manager</span>
                                <span className="text-sm font-medium text-foreground">{site.manager}</span>
                            </div>
                            <span
                                className={`rounded-lg px-3 py-1 text-xs font-semibold ${site.status === "Active"
                                    ? "bg-success/20 text-success"
                                    : site.status === "Pending"
                                        ? "bg-warning/20 text-warning"
                                        : "bg-gray-500/20 text-gray-400"
                                    }`}
                            >
                                {site.status}
                            </span>
                        </div>
                    </Link>
                ))}

                {sites.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted border border-dashed border-gray-700 rounded-xl">
                        <p>No sites found. Add a new site to get started.</p>
                    </div>
                )}
            </div>

            {/* Add Site Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Add New Site</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full p-2 text-muted hover:bg-gray-700 hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSite} className="flex flex-col gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newSite.name}
                                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., Riverside Complex"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newSite.location}
                                    onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., New York, NY"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Project Manager
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newSite.manager}
                                    onChange={(e) => setNewSite({ ...newSite, manager: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., John Smith"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    Status
                                </label>
                                <select
                                    value={newSite.status}
                                    onChange={(e) => setNewSite({ ...newSite, status: e.target.value as any })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
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
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover"
                                >
                                    Create Site
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
