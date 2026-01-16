"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Phone, Mail, MapPin, User, ChevronRight, Briefcase } from "lucide-react";

// Mock Data Source
const ALL_ENGINEERS = [
    { id: "1", name: "John Doe", role: "Site Engineer", site: "Metro Station Beta", status: "Active", attendance: "Present", reportingManager: "Robert Fox" },
    { id: "2", name: "Alex Smith", role: "Senior Engineer", site: "Skyline Complex", status: "Active", attendance: "Present", reportingManager: "Cameron Williamson" },
    { id: "3", name: "Sarah Connor", role: "Safety Officer", site: "Metro Station Beta", status: "On Leave", attendance: "Absent", reportingManager: "Robert Fox" },
    { id: "4", name: "Mike Ross", role: "Junior Engineer", site: "River Bridge", status: "Active", attendance: "Present", reportingManager: "Harvey Specter" },
];

export default function EngineersPage() {
    const [userRole, setUserRole] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // In a real app, this would come from a secure context or API
        const role = localStorage.getItem("userRole") || "Engineer";
        setUserRole(role);
    }, []);

    // Filter Logic based on Role
    const getVisibleEngineers = () => {
        if (userRole === "HR Manager") {
            // HR sees EVERYONE
            return ALL_ENGINEERS;
        } else if (userRole === "Project Manager") {
            // PM sees only their team (Simulated by filtering for 'Metro Station Beta' or 'Robert Fox' for this demo)
            // For demo simplicity, let's say PM sees ID 1 and 3
            return ALL_ENGINEERS.filter(e => e.reportingManager === "Robert Fox");
        }
        return [];
    };

    const engineers = getVisibleEngineers().filter(eng =>
        eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.role.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="mt-1 text-2xl font-bold text-foreground">
                        {userRole === "HR Manager" ? "All Engineers" : "My Team"}
                    </h1>
                    <p className="text-muted">
                        {userRole === "HR Manager" ? "Directory of all engineering staff." : "Engineers under your supervision."}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search engineers..."
                        className="w-full rounded-lg border border-gray-700 bg-surface pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {userRole === "HR Manager" && (
                    <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-700">
                        <Filter size={16} />
                        Filter
                    </button>
                )}
            </div>

            {/* List */}
            <div className="grid gap-4">
                {engineers.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        No engineers found.
                    </div>
                ) : (
                    engineers.map((eng) => (
                        <Link
                            key={eng.id}
                            href={`/engineers/${eng.id}`}
                            className="group flex flex-col items-start gap-4 rounded-xl border border-gray-700 bg-panel p-4 transition-all hover:border-primary/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-24 w-24 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-black text-3xl font-bold">
                                    {eng.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{eng.name}</h3>
                                    <p className="text-sm text-muted flex items-center gap-2">
                                        {eng.role}
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {eng.site}</span>
                                    </p>
                                    {/* HR View: Show Reporting Manager */}
                                    {userRole === "HR Manager" && (
                                        <p className="text-xs text-muted mt-1 flex items-center gap-1">
                                            <Briefcase size={10} /> Reports to: <span className="text-foreground">{eng.reportingManager}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex w-full items-center justify-between sm:w-auto sm:gap-6">
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${eng.attendance === 'Present' ? 'bg-success/10 text-success border-success/20' :
                                        eng.attendance === 'Absent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            'bg-gray-700 text-muted border-gray-600'
                                        }`}>
                                        {eng.attendance}
                                    </span>
                                    {eng.status === "Active" ? (
                                        <span className="text-xs text-muted flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success"></div> Active</span>
                                    ) : (
                                        <span className="text-xs text-muted flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-warning"></div> {eng.status}</span>
                                    )}
                                </div>
                                <ChevronRight className="text-muted group-hover:text-primary transition-colors" size={20} />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
