"use client";

import { useState } from "react";
import { Search, Filter, Briefcase, MapPin, Users, Star, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPMs = PROJECT_MANAGERS.filter(pm =>
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
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">
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
                                <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center text-xl font-bold text-blue-500">
                                    {pm.avatar}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{pm.name}</h3>
                                    <p className="text-sm text-muted">{pm.role}</p>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium border ${pm.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                        {pm.status}
                                    </span>
                                </div>
                            </div>
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
                                    <MapPin size={12} className="text-primary" /> {pm.activeSites} Projects
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
        </div>
    );
}
