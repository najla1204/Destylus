"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Briefcase, MapPin, Users, Star, Plus, ArrowRight, Trash2, X } from "lucide-react";
import Link from "next/link";

// Mock Data Type
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

// Mock Data
const PROJECT_MANAGERS = [
    {
        id: "1",
        name: "Robert Fox",
        role: "Senior Project Manager",
        department: "Infrastructure",
        activeSites: 3,
        teamSize: 12,
        experience: "15 Years",
        rating: 4.8,
        status: "Active",
        avatar: "R"
    },
    {
        id: "2",
        name: "Cameron Williamson",
        role: "Project Manager",
        department: "Residential",
        activeSites: 1,
        teamSize: 5,
        experience: "8 Years",
        rating: 4.5,
        status: "Active",
        avatar: "C"
    },
    {
        id: "3",
        name: "Esther Howard",
        role: "Project Manager",
        department: "Commercial",
        activeSites: 2,
        teamSize: 8,
        experience: "10 Years",
        rating: 4.9,
        status: "On Leave",
        avatar: "E"
    }
];

export default function ProjectManagersPage() {
    const [pms, setPms] = useState<ProjectManager[]>(PROJECT_MANAGERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPm, setNewPm] = useState({
        name: "",
        role: "Project Manager",
        department: "Infrastructure",
        experience: "5 Years",
        status: "Active"
    });

    useEffect(() => {
        const savedPMs = localStorage.getItem("destylus_dashboard_pms_v2");
        if (savedPMs) {
            const parsed = JSON.parse(savedPMs);
            // Only update if data is different to avoid effect loop/warning
            if (JSON.stringify(parsed) !== JSON.stringify(pms)) {
                setPms(parsed);
            }
        } else {
            localStorage.setItem("destylus_dashboard_pms_v2", JSON.stringify(PROJECT_MANAGERS));
        }
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this manager?")) {
            const updatedPMs = pms.filter(pm => pm.id !== id);
            setPms(updatedPMs);
            localStorage.setItem("destylus_dashboard_pms_v2", JSON.stringify(updatedPMs));
        }
    };

    const handleAddPm = (e: React.FormEvent) => {
        e.preventDefault();
        const nextId = (pms.length > 0
            ? Math.max(...pms.map(p => parseInt(p.id) || 0)) + 1
            : 1
        ).toString();

        const manager: ProjectManager = {
            id: nextId,
            name: newPm.name,
            role: newPm.role,
            department: newPm.department,
            activeSites: 0,
            teamSize: 0,
            experience: newPm.experience,
            rating: 5.0,
            status: newPm.status,
            avatar: newPm.name.charAt(0).toUpperCase()
        };

        const updatedPMs = [...pms, manager];
        setPms(updatedPMs);
        localStorage.setItem("destylus_dashboard_pms_v2", JSON.stringify(updatedPMs));
        setNewPm({ name: "", role: "Project Manager", department: "Infrastructure", experience: "5 Years", status: "Active" });
        setIsAddModalOpen(false);
    };

    const filteredPMs = pms.filter(pm =>
        pm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pm.department.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="mt-1 text-2xl font-bold text-foreground">Project Managers</h1>
                    <p className="text-muted">Directory of Project Leads</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} />
                    Add Manager
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search managers..."
                        className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-700">
                    <Filter size={16} />
                    Filter
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPMs.map((pm) => (
                    <Link key={pm.id} href={`/project-managers/${pm.id}`} className="group relative flex flex-col rounded-xl border border-gray-700 bg-panel p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-14 w-14 rounded-full bg-orange-300 border border-orange-400/20 flex items-center justify-center text-xl font-bold text-black">
                                    {pm.avatar}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{pm.name}</h3>
                                    <p className="text-sm text-muted">{pm.role}</p>
                                    <span className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-xs font-medium border ${pm.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                        {pm.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDelete(pm.id, e)}
                                className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors z-10"
                                title="Delete Manager"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                            <div>
                                <p className="text-xs text-muted">Department</p>
                                <p className="font-medium text-foreground flex items-center gap-1">
                                    <Briefcase size={12} className="text-muted" /> {pm.department}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Experience</p>
                                <p className="font-medium text-foreground">{pm.experience}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted">Active Sites</p>
                                <p className="font-medium text-foreground flex items-center gap-1">
                                    <img width="14" height="14" src="https://img.icons8.com/ios/50/1A1A1A/road-worker.png" alt="road-worker" /> {pm.activeSites} Projects
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Team Size</p>
                                <p className="font-medium text-foreground flex items-center gap-1">
                                    <Users size={12} className="text-blue-500" /> {pm.teamSize} Engineers
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-1 text-xs text-warning">
                            <Star size={12} fill="currentColor" />
                            <span className="font-medium text-foreground">{pm.rating}</span>
                            <span className="text-muted">Manager Rating</span>
                        </div>
                    </Link>
                ))}
            </div>

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
                                <label className="mb-1 block text-sm font-medium text-foreground">Role</label>
                                <select
                                    value={newPm.role}
                                    onChange={(e) => setNewPm({ ...newPm, role: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                >
                                    <option>Senior Project Manager</option>
                                    <option>Project Manager</option>
                                    <option>Assistant PM</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Department</label>
                                <select
                                    value={newPm.department}
                                    onChange={(e) => setNewPm({ ...newPm, department: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                >
                                    <option>Infrastructure</option>
                                    <option>Residential</option>
                                    <option>Commercial</option>
                                    <option>Industrial</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Experience</label>
                                <input
                                    type="text"
                                    required
                                    value={newPm.experience}
                                    onChange={(e) => setNewPm({ ...newPm, experience: e.target.value })}
                                    className="w-full rounded-lg border border-gray-600 bg-surface px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                                    placeholder="e.g., 5 Years"
                                />
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
                                    Create Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
