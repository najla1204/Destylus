"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    TrendingUp,
    AlertTriangle,
    Users,
    HardHat,
    MapPin,
    Plus,
    Trash2,
    Search,
    Building,
    Calendar,
    DollarSign,
    FileText,
    Briefcase,
    X,
    Activity,
    Package,
    CheckCircle,
    Clock,
    ArrowRight,
    Contact
} from "lucide-react";
import Link from "next/link";

// Mock Data for Sites
interface Site {
    id: string;
    name: string;
    location: string;
    manager: string;
    budget: number;
    startDate: string;
    status: "Active" | "Planning" | "Completed";
}

interface Employee {
    id: string;
    name: string;
    role: string;
    site: string;
    status: "Active" | "Inactive";
}

const INITIAL_SITES: Site[] = [
    {
        id: "1",
        name: "Metro Station Beta",
        location: "Downtown District",
        manager: "Project Manager",
        budget: 12000000,
        startDate: "2024-01-15",
        status: "Active"
    },
    {
        id: "2",
        name: "Skyline Complex",
        location: "Westside",
        manager: "Admin User",
        budget: 45000000,
        startDate: "2024-03-01",
        status: "Planning"
    },
    {
        id: "3",
        name: "River Bridge Expansion",
        location: "North River",
        manager: "Project Manager",
        budget: 8500000,
        startDate: "2023-11-20",
        status: "Active"
    }
];

const INITIAL_EMPLOYEES: Employee[] = [
    { id: "1", name: "John Doe", role: "Site Engineer", site: "Metro Station Beta", status: "Active" },
    { id: "2", name: "Alex Smith", role: "Senior Engineer", site: "Skyline Complex", status: "Active" },
    { id: "3", name: "Sarah Connor", role: "Safety Officer", site: "River Bridge Expansion", status: "Active" },
];

function DashboardContent() {
    const [userRole, setUserRole] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";

    // Site State
    const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
    const [newSite, setNewSite] = useState<Partial<Site>>({
        name: "", location: "", budget: 0, status: "Planning", startDate: new Date().toISOString().split('T')[0]
    });
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showAssignedOnly, setShowAssignedOnly] = useState(false);

    // Employee State (HR Only)
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({ name: "", role: "Site Engineer", site: "", status: "Active" });
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "";
        const name = localStorage.getItem("userName") || "";
        setUserRole(role);
        setUserName(name);

        // Load persisted sites
        const savedSites = localStorage.getItem("destylus_dashboard_sites_v3");
        if (savedSites) {
            setSites(JSON.parse(savedSites));
        } else {
            localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(INITIAL_SITES));
        }

        // Load persisted employees
        const savedEmployees = localStorage.getItem("destylus_dashboard_employees_v2");
        if (savedEmployees) {
            setEmployees(JSON.parse(savedEmployees));
        } else {
            localStorage.setItem("destylus_dashboard_employees_v2", JSON.stringify(INITIAL_EMPLOYEES));
        }
    }, []);

    // --- Site Handlers ---
    const filteredSites = sites.filter(site => {
        const matchesSearch = site.name.toLowerCase().includes(searchQuery) ||
            site.location.toLowerCase().includes(searchQuery);

        if (showAssignedOnly) return site.manager === userName && matchesSearch;
        return matchesSearch;
    });

    // HR Filtered Employees
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery) ||
        emp.role.toLowerCase().includes(searchQuery) ||
        emp.site.toLowerCase().includes(searchQuery)
    );

    const handleDashboardSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleDeleteSite = (id: string) => {
        if (confirm("Are you sure you want to delete this site?")) {
            const updatedSites = sites.filter(s => s.id !== id);
            setSites(updatedSites);
            localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(updatedSites));
        }
    };

    const handleAddSite = (e: React.FormEvent) => {
        e.preventDefault();
        const nextId = (sites.length > 0
            ? Math.max(...sites.map(s => parseInt(s.id) || 0)) + 1
            : 1
        ).toString();

        const site: Site = {
            id: nextId,
            name: newSite.name || "Untitled Project",
            location: newSite.location || "Unknown Location",
            manager: userName,
            budget: newSite.budget || 0,
            startDate: newSite.startDate || new Date().toISOString().split('T')[0],
            status: (newSite.status as any) || "Planning"
        };
        const updatedSites = [...sites, site];
        setSites(updatedSites);
        localStorage.setItem("destylus_dashboard_sites_v3", JSON.stringify(updatedSites));
        setShowAddSiteModal(false);
        setNewSite({ name: "", location: "", budget: 0, status: "Planning", startDate: new Date().toISOString().split('T')[0] });
    };

    // --- Employee Handlers ---
    const handleDeleteEmployee = (id: string) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            const updatedEmployees = employees.filter(e => e.id !== id);
            setEmployees(updatedEmployees);
            localStorage.setItem("destylus_dashboard_employees_v2", JSON.stringify(updatedEmployees));
        }
    };

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        const emp: Employee = {
            id: Math.random().toString(36).substr(2, 9),
            name: newEmployee.name || "New Employee",
            role: newEmployee.role || "Staff",
            site: newEmployee.site || "Unassigned",
            status: "Active"
        };
        const updatedEmployees = [...employees, emp];
        setEmployees(updatedEmployees);
        localStorage.setItem("destylus_dashboard_employees_v2", JSON.stringify(updatedEmployees));
        setShowAddEmployeeModal(false);
        setNewEmployee({ name: "", role: "Site Engineer", site: "", status: "Active" });
    };


    // Render HR View
    if (userRole === "HR Manager") {
        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">HR Overview</h1>
                        <p className="text-muted">Manage your Organization Masters</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted">Total Employees</span>
                            <img width="20" height="20" src="https://img.icons8.com/fluency-systems-filled/48/1A1A1A/commercial-development-management.png" alt="commercial-development-management" />
                        </div>
                        <div className="mt-2 text-3xl font-bold text-foreground">{employees.length}</div>
                        <span className="text-xs text-success">+Active Workforce</span>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted">Active Sites</span>
                            <img width="20" height="20" src="https://img.icons8.com/ios/50/1A1A1A/road-worker.png" alt="road-worker" />
                        </div>
                        <div className="mt-2 text-3xl font-bold text-foreground">{sites.length}</div>
                        <span className="text-xs text-muted">Ongoing Projects</span>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted">Pending Claims</span>
                            <img width="20" height="20" src="https://img.icons8.com/ios-filled/50/1A1A1A/data-pending.png" alt="data-pending" />
                        </div>
                        <div className="mt-2 text-3xl font-bold text-foreground">8</div>
                        <span className="text-xs text-warning">Requires Approval</span>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted">Payroll Status</span>
                            <img width="20" height="20" src="https://img.icons8.com/fluency-systems-filled/48/1A1A1A/money.png" alt="money" />
                        </div>
                        <div className="mt-2 text-3xl font-bold text-foreground">Pending</div>
                        <span className="text-xs text-muted">For Jan 2026</span>
                    </div>
                </div>

                {/* MANAGE MASTERS SECTION */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground text-center border-b border-gray-700 pb-4">Manage Masters</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* 1. SITE MASTER */}
                        <div className="rounded-xl border border-gray-700 bg-panel flex flex-col h-[500px]">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-surface/50 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <img width="20" height="20" src="https://img.icons8.com/ios/50/1A1A1A/building.png" alt="building" />
                                    <h3 className="font-bold text-foreground">Site Master</h3>
                                </div>
                                <button
                                    onClick={() => setShowAddSiteModal(true)}
                                    className="flex items-center gap-2 text-xs font-bold bg-primary text-black px-3 py-1.5 rounded-lg hover:bg-primary/90"
                                >
                                    <Plus size={14} /> Add Site
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-3 flex-1">
                                {filteredSites.map(site => (
                                    <div key={site.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-surface hover:border-gray-500 transition-colors group">
                                        <Link href={`/sites/${site.id}`} className="flex-1 flex flex-col cursor-pointer">
                                            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors">{site.name}</span>
                                            <span className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {site.location}</span>
                                        </Link>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-lg border ${site.status === 'Active' ? 'text-success border-success/30 bg-success/10' : 'text-muted border-gray-600'
                                                }`}>{site.status}</span>
                                            <button
                                                onClick={() => handleDeleteSite(site.id)}
                                                className="text-muted hover:text-red-500 transition-colors p-1"
                                                title="Delete Site"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. EMPLOYEE MASTER */}
                        <div className="rounded-xl border border-gray-700 bg-panel flex flex-col h-[500px]">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-surface/50 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <img width="20" height="20" src="https://img.icons8.com/pulsar-line/48/1A1A1A/conference.png" alt="conference" />
                                    <h3 className="font-bold text-foreground">Employee Master</h3>
                                </div>
                                <button
                                    onClick={() => setShowAddEmployeeModal(true)}
                                    className="flex items-center gap-2 text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
                                >
                                    <Plus size={14} /> Add Employee
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-3 flex-1">
                                {filteredEmployees.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-surface hover:border-gray-500 transition-colors">
                                        <Link href={`/engineers/${emp.id}`} className="flex-1 flex items-center gap-3 cursor-pointer">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 text-black flex items-center justify-center font-bold text-xs border border-orange-200">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground text-sm hover:text-blue-400 transition-colors">{emp.name}</span>
                                                <span className="text-xs text-muted">{emp.role}</span>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteEmployee(emp.id)}
                                            className="text-muted hover:text-red-500 transition-colors p-1"
                                            title="Delete Employee"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* MODALS */}
                {/* 1. Add Site Modal */}
                {showAddSiteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl bg-panel p-6 shadow-xl border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-foreground">Add New Site</h2>
                                <button onClick={() => setShowAddSiteModal(false)}><X size={20} className="text-muted hover:text-foreground" /></button>
                            </div>
                            <form onSubmit={handleAddSite} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Site Name</label>
                                    <input type="text" required className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" value={newSite.name} onChange={e => setNewSite({ ...newSite, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Location</label>
                                    <input type="text" required className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" value={newSite.location} onChange={e => setNewSite({ ...newSite, location: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">Create Site</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 2. Add Employee Modal */}
                {showAddEmployeeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl bg-panel p-6 shadow-xl border border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-foreground">Add New Employee</h2>
                                <button onClick={() => setShowAddEmployeeModal(false)}><X size={20} className="text-muted hover:text-foreground" /></button>
                            </div>
                            <form onSubmit={handleAddEmployee} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Employee Name</label>
                                    <input type="text" required className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Role</label>
                                    <select className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" value={newEmployee.role} onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}>
                                        <option>Site Engineer</option>
                                        <option>Civil Engineer</option>
                                        <option>Safety Officer</option>
                                        <option>Supervisor</option>
                                        <option>Laborer</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">Add Employee</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render PM View
    if (userRole === "Project Manager") {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="text-muted/60">Home</span>
                            <span>/</span>
                            <span className="text-foreground">Dashboard</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold text-foreground flex items-center gap-2">
                            <img width="28" height="28" src="https://img.icons8.com/ios/50/1A1A1A/road-worker.png" alt="road-worker" />
                            Site Management
                        </h1>
                    </div>

                    <button
                        onClick={() => setShowAddSiteModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        Add New Site
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
                    <button
                        onClick={() => setShowAssignedOnly(false)}
                        className={`text-sm font-medium transition-colors ${!showAssignedOnly ? "text-primary" : "text-muted hover:text-foreground"}`}
                    >
                        All Sites
                    </button>
                    <button
                        onClick={() => setShowAssignedOnly(true)}
                        className={`text-sm font-medium transition-colors ${showAssignedOnly ? "text-primary" : "text-muted hover:text-foreground"}`}
                    >
                        My Assigned Sites
                    </button>
                    <div className="ml-auto flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 border border-gray-700 focus-within:border-primary transition-colors">
                        <Search size={16} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search sites..."
                            className="bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted/60"
                            onChange={(e) => handleDashboardSearch(e.target.value)}
                            value={searchQuery}
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSites.map((site) => (
                        // ... remaining grid content ...
                        <div key={site.id} className="group relative flex flex-col rounded-xl border border-gray-700 bg-panel shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
                            <Link href={`/sites/${site.id}`} className="flex-1 p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <img
                                            width="24"
                                            height="24"
                                            src={site.status === 'Planning'
                                                ? "https://img.icons8.com/pulsar-line/48/1A1A1A/blueprint.png"
                                                : "https://img.icons8.com/ios/50/1A1A1A/road-worker.png"
                                            }
                                            alt={site.status === 'Planning' ? "blueprint" : "road-worker"}
                                        />
                                    </div>
                                    <span className={`rounded-lg px-2.5 py-0.5 text-xs font-medium border ${site.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
                                        site.status === 'Completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                        {site.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-foreground">{site.name}</h3>

                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <MapPin size={16} />
                                        <span>{site.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <DollarSign size={16} />
                                        <span>Budget: ₹{((site.budget || 0) / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <Calendar size={16} />
                                        <span>Started: {site.startDate ? new Date(site.startDate).toLocaleDateString() : 'Pending'}</span>
                                    </div>
                                </div>
                            </Link>

                            <div className="flex items-center justify-between border-t border-gray-700 p-4 pt-4">
                                <span className="text-xs text-muted pl-2">Click to view details</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteSite(site.id);
                                        }}
                                        className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        title="Delete Site"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredSites.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-surface/50 text-center">
                        <Building className="mb-4 text-muted/50" size={48} />
                        <p className="text-muted">No sites found.</p>
                        {showAssignedOnly && <p className="text-sm text-muted/60">Try switching to "All Sites" view.</p>}
                    </div>
                )}

                {/* Add Site Modal (Shared) */}
                {showAddSiteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl bg-panel p-6 shadow-xl border border-gray-700">
                            <h2 className="mb-4 text-xl font-bold text-foreground">Add New Site</h2>
                            <form onSubmit={handleAddSite} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Site Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        value={newSite.name}
                                        onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                                        placeholder="e.g., City Center Mall"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-muted">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                        value={newSite.location}
                                        onChange={e => setNewSite({ ...newSite, location: e.target.value })}
                                        placeholder="e.g., Downtown"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-muted">Budget (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                            value={newSite.budget}
                                            onChange={e => setNewSite({ ...newSite, budget: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-muted">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                            value={newSite.startDate}
                                            onChange={e => setNewSite({ ...newSite, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSiteModal(false)}
                                        className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-muted hover:bg-surface transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
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

    // Default / Engineer View
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-foreground">Welcome, Engineer</h1>
                <p className="text-muted">Select a module to begin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. ATTENDANCE MODULE */}
                <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden flex flex-col hover:border-blue-500/50 transition-colors shadow-lg">
                    <div className="p-6 bg-gradient-to-br from-panel to-surface border-b border-gray-700">
                        <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <img width="24" height="24" src="https://img.icons8.com/ios-filled/50/1A1A1A/id-verified.png" alt="id-verified" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Site Engineer Attendance</h3>
                        <p className="text-sm text-muted mt-1">Manage logs and hours</p>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1 bg-surface/30">
                        <Link href="/attendance" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="text-sm font-medium text-foreground">Daily Attendance</span>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-foreground" />
                        </Link>
                        <Link href="/attendance/monthly" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-blue-500" />
                                <span className="text-sm font-medium text-foreground">Monthly Report</span>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-foreground" />
                        </Link>
                        <Link href="/attendance/timesheet" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-orange-500" />
                                <span className="text-sm font-medium text-foreground">Working Hours Data</span>
                            </div>
                            <ArrowRight size={14} className="text-muted group-hover:text-foreground" />
                        </Link>
                    </div>
                </div>

                {/* 2. MATERIALS MODULE */}
                <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden flex flex-col hover:border-orange-500/50 transition-colors shadow-lg">
                    <div className="p-6 bg-gradient-to-br from-panel to-surface border-b border-gray-700">
                        <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                            <img width="24" height="24" src="https://img.icons8.com/quill/100/1A1A1A/portraits.png" alt="portraits" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Extra Material Request</h3>
                        <p className="text-sm text-muted mt-1">Request supplies for Site</p>
                    </div>
                    <div className="p-6 flex flex-col gap-4 flex-1 bg-surface/30">
                        <ul className="space-y-2 text-sm text-muted">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Select Site Name</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Assigned to Project Manager</li>
                        </ul>
                        <Link href="/materials/request" className="mt-auto w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-colors">
                            <img width="18" height="18" src="https://img.icons8.com/quill/100/FFFFFF/portraits.png" alt="portraits" /> Create Request
                        </Link>
                    </div>
                </div>

                {/* 3. LEAVE MODULE */}
                <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden flex flex-col hover:border-purple-500/50 transition-colors shadow-lg">
                    <div className="p-6 bg-gradient-to-br from-panel to-surface border-b border-gray-700">
                        <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <img width="24" height="24" src="https://img.icons8.com/ios-filled/50/1A1A1A/secured-letter.png" alt="secured-letter" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Employee Leave</h3>
                        <p className="text-sm text-muted mt-1">Apply for leaves</p>
                    </div>
                    <div className="p-6 flex flex-col gap-4 flex-1 bg-surface/30">
                        <ul className="space-y-2 text-sm text-muted">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Casual & Sick Leave</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Status Tracking</li>
                        </ul>
                        <Link href="/leave" className="mt-auto w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors">
                            <img width="18" height="18" src="https://img.icons8.com/ios-filled/50/FFFFFF/secured-letter.png" alt="secured-letter" /> Apply Now
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
