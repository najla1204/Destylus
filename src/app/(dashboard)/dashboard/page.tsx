"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
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
    _id?: string;
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


    // Default / Engineer View State
    const [engineerSites, setEngineerSites] = useState<Site[]>([]);
    const [activeSiteId, setActiveSiteId] = useState<string>("All");
    const [dashData, setDashData] = useState<any>({
        materials: [],
        issues: [],
        pettyCash: [],
        attendance: { engineerRecords: [], labourRecords: [], totalRecords: 0 }
    });
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (userRole === "Engineer" || userRole === "engineer" || userRole === "Site Engineer") {
            setLoadingData(true);
            fetch("/api/sites")
                .then(res => res.json())
                .then(data => {
                    const assigned = data;
                    setEngineerSites(assigned);
                    if (assigned.length > 0) setActiveSiteId(assigned[0]._id || assigned[0].id);
                })
                .finally(() => setLoadingData(false));
        }
    }, [userRole]);

    useEffect(() => {
        if (activeSiteId && (userRole === "Engineer" || userRole === "engineer" || userRole === "Site Engineer")) {
            setLoadingData(true);
            const siteIdsToFetch = activeSiteId === "All" ? engineerSites.map(s => s._id || s.id) : [activeSiteId];
            
            if (siteIdsToFetch.length === 0) {
               setDashData({ materials: [], issues: [], pettyCash: [], attendance: { engineerRecords: [], labourRecords: [], totalRecords: 0 }, leaves: [] });
               setLoadingData(false);
               return;
            }

            const empId = localStorage.getItem("employeeId") || ""; 

            Promise.all([
                 ...siteIdsToFetch.map(id => fetch(`/api/sites/${id}/materials`).then(res => res.json())),
                 ...siteIdsToFetch.map(id => fetch(`/api/sites/${id}/issues`).then(res => res.json())),
                 ...siteIdsToFetch.map(id => fetch(`/api/sites/${id}/petty-cash`).then(res => res.json())),
                 ...siteIdsToFetch.map(id => fetch(`/api/sites/${id}/attendance`).then(res => res.json())),
                 fetch(`/api/leave?employeeId=${empId}&role=${userRole}`).then(res => res.json())
            ]).then((results) => {
                 const numSites = siteIdsToFetch.length;
                 const mats = results.slice(0, numSites).flat();
                 const iss = results.slice(numSites, numSites*2).flat();
                 const pcDataRaw = results.slice(numSites*2, numSites*3);
                 const pcData = pcDataRaw.flatMap(p => p.transactions || p || []);
                 const attRaw = results.slice(numSites*3, numSites*4);
                 
                 const combinedAttendance = {
                     engineerRecords: attRaw.flatMap(a => a.engineerRecords || []),
                     labourRecords: attRaw.flatMap(a => a.labourRecords || []),
                     totalRecords: attRaw.reduce((acc, a) => acc + (a.totalRecords || 0), 0)
                 };
                 const leavesData = results[numSites*4] || [];
                 const leaves = Array.isArray(leavesData) ? leavesData : (leavesData.leaveRequests || []);

                 setDashData({
                     materials: mats,
                     issues: iss,
                     pettyCash: pcData,
                     attendance: combinedAttendance,
                     leaves: leaves
                 });
            }).catch(e => console.error(e))
            .finally(() => setLoadingData(false));
        }
    }, [activeSiteId, userRole, engineerSites]);

    // Render HR View
    if (userRole === "HR Manager") {
        // Prepare Chart Data
        const sitesWithWorkers = sites.map(site => {
            const workersCount = employees.filter(emp => emp.site === site.name).length;
            return {
                name: site.name,
                workers: workersCount
            };
        });

        const budgetData = sites.map(site => ({
            name: site.name,
            value: site.budget || 0
        }));

        const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

        return (
            <div className="space-y-8">

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Employees</span>
                        <div className="text-4xl font-bold text-white leading-none">{employees.length}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Active Workforce</span>
                    </div>
                    
                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Active Sites</span>
                        <div className="text-4xl font-bold text-white leading-none">{sites.length}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-yellow-500">Ongoing Projects</span>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Pending Claims</span>
                        <div className="text-4xl font-bold text-white leading-none">8</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500">Requires Approval</span>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Payroll Status</span>
                        <div className="text-xl font-bold text-white leading-none pt-2 uppercase">Pending</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">For Current Month</span>
                    </div>
                </div>

                {/* Dashboard Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Graph 1: Workers per Site */}
                    <div className="rounded-2xl bg-panel border-gray-700 p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Workers Assignment per Site</h3>
                            <Users size={18} className="text-[#FFC107]" />
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sitesWithWorkers} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#FFC107' }}
                                    />
                                    <Bar dataKey="workers" name="Total Workers" fill="#FFC107" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Graph 2: Budget Distribution */}
                    <div className="rounded-2xl bg-panel border-gray-700 p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Budget Allocation</h3>
                            <DollarSign size={18} className="text-[#FFC107]" />
                        </div>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={budgetData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {budgetData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: any) => [`₹${(Number(value)/100000).toFixed(1)}L`, 'Budget']}
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36} 
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '12px', color: '#888' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
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

    // Derived stats
    const activeSiteName = engineerSites.find(s => (s as any)._id === activeSiteId || s.id === activeSiteId)?.name || 'Selected Site';
    
    // Attendance chart data
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const attendanceWeeklyData = last7Days.map(dateStr => {
        const engCount = dashData.attendance.engineerRecords?.filter((r:any) => {
            const dateVal = r.date || r.checkInTime || r.createdAt || '';
            return dateVal.startsWith(dateStr);
        }).length || 0;
        const labCount = dashData.attendance.labourRecords?.filter((r:any) => {
            const dateVal = r.date || r.checkInTime || r.createdAt || '';
            return dateVal.startsWith(dateStr);
        }).length || 0;
        return {
            date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
            Engineers: engCount,
            Labours: labCount
        };
    });

    // Materials chart data
    const approvedMats = dashData.materials;
    const materialsWeeklyData = last7Days.map(dateStr => {
        const matsOnDate = approvedMats.filter((m: any) => {
            const mDate = m.createdAt || m.updatedAt || '';
            return mDate.startsWith(dateStr);
        });
        const qty = matsOnDate.reduce((acc: number, curr: any) => acc + (Number(curr.quantity) || 0), 0);
        return {
            date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
            Quantity: qty
        };
    });

    const COLORS_PIE = ['#10B981', '#FFB600', '#EF4444', '#3B82F6'];

    return (
        <div className="space-y-10 pb-12">
            {/* Header Section */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] px-4 py-2 border border-white/10 shadow-inner group hover:border-primary/30 transition-all">
                        <MapPin size={14} className="text-primary" />
                        <select 
                            className="bg-transparent border-none text-xs font-bold text-slate-300 focus:outline-none appearance-none pr-6 cursor-pointer uppercase tracking-wider"
                            value={activeSiteId}
                            onChange={(e) => setActiveSiteId(e.target.value)}
                        >
                            <option value="All" className="bg-panel text-foreground">✓ All Assigned Sites</option>
                            {engineerSites.map((site: any) => (
                                <option key={site._id || site.id} value={site._id || site.id} className="bg-panel text-foreground">
                                    {site.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loadingData ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Row 1: 4 Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Assigned Sites</span>
                            <div className="text-4xl font-bold text-white leading-none">{engineerSites.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-success">Active</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Total Materials</span>
                            <div className="text-4xl font-bold text-white leading-none">{approvedMats.length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Recorded Quantity</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Open Issues</span>
                            <div className="text-4xl font-bold text-white leading-none">{dashData.issues.filter((i:any) => i.status !== 'Resolved').length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-400">Requires Attention</span>
                        </div>
                        <div className="rounded-2xl border border-gray-800 bg-[#0B0D11] p-6 shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:border-gray-700/50">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">Leave Requests</span>
                            <div className="text-4xl font-bold text-white leading-none">{(dashData.leaves || []).length}</div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-purple-400">{(dashData.leaves || []).filter((l:any) => l.status === 'Pending').length} Pending</span>
                        </div>
                    </div>

                    {/* Row 2: 50/50 - Engineer Attendance & Approved Materials */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Site Engineer Attendance This Week */}
                        <div className="premium-card p-8 flex flex-col h-[450px]">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white font-serif tracking-tight uppercase">Engineer Attendance</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Current Week Analysis</p>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                        <XAxis dataKey="date" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#ffffff05' }}
                                            contentStyle={{ backgroundColor: '#0B0D11', border: '1px solid #ffffff10', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#ffffff60', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} iconType="circle" />
                                        <Bar dataKey="Engineers" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Approved Materials */}
                        <div className="premium-card p-8 flex flex-col h-[450px]">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white font-serif tracking-tight uppercase">Materials Forecast</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{activeSiteId === 'All' ? 'All Sites' : 'Selected Site'} • Weekly Approved Quantities</p>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={materialsWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                        <XAxis dataKey="date" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#ffffff05' }}
                                            contentStyle={{ backgroundColor: '#0B0D11', border: '1px solid #ffffff10', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981' }}
                                            labelStyle={{ color: '#ffffff60', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
                                        />
                                        <Bar dataKey="Quantity" name="Total Materials" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: 50/50 Logs and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Recent Logs (50%) */}
                        <div className="premium-card p-8 flex flex-col h-[400px]">
                            <div className="mb-6 flex items-center gap-3 shrink-0">
                                <Activity size={18} className="text-blue-500" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Recent Activity Logs</h4>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                {[
                                    ...dashData.materials.map((m: any) => ({ _id: m._id, type: 'Material', icon: <Package size={14} className="text-blue-400"/>, title: m.item, detail: `Qty: ${m.quantity} ${m.unit} • Status: ${m.status}`, date: m.createdAt || m.updatedAt || new Date().toISOString(), status: m.status })),
                                    ...dashData.issues.map((i: any) => ({ _id: i._id, type: 'Issue', icon: <AlertTriangle size={14} className={i.priority === 'Critical' ? 'text-red-500' : 'text-[#FFB600]'}/>, title: i.title, detail: `Priority: ${i.priority} • Status: ${i.status}`, date: i.createdAt || i.updatedAt || new Date().toISOString(), status: i.status })),
                                    ...dashData.pettyCash.map((p: any) => ({ _id: p._id, type: 'Petty Cash', icon: <DollarSign size={14} className={p.type === 'Expense' ? 'text-red-400' : 'text-green-400'}/>, title: p.title, detail: `Amount: ₹${p.amount} • Type: ${p.type}`, date: p.date || p.createdAt || new Date().toISOString(), status: p.type })),
                                    ...(dashData.leaves || []).map((l: any) => ({ _id: l._id, type: 'Leave', icon: <Calendar size={14} className="text-purple-400"/>, title: `${l.type || 'Leave'} Request`, detail: `${l.employeeName || 'You'} • ${new Date(l.from).toLocaleDateString()} to ${new Date(l.to).toLocaleDateString()}`, date: l.createdAt || new Date().toISOString(), status: l.status })),
                                    ...(dashData.attendance?.engineerRecords || []).slice(0, 5).map((a: any) => ({ _id: a._id, type: 'Attendance', icon: <CheckCircle size={14} className="text-green-400"/>, title: `Attendance Logged`, detail: `${a.employeeName || 'Engineer'} • ${a.site || 'Site'} • ${a.totalHours ? a.totalHours.toFixed(1) + 'h' : 'Active'}`, date: a.checkInTime || a.createdAt || new Date().toISOString(), status: a.approvalStatus === 'approved' ? 'Approved' : a.approvalStatus === 'rejected' ? 'Rejected' : 'Pending' }))
                                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((log: any, index: number) => (
                                    <div key={`${log.type}-${log._id}-${index}`} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-primary/20 transition-colors">
                                        <div className="p-2 bg-white/[0.05] rounded-lg shrink-0">
                                            {log.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h5 className="text-[12px] font-bold text-white uppercase tracking-wider truncate">{log.title}</h5>
                                                <span className="text-[9px] text-slate-500 shrink-0">{new Date(log.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 truncate">{log.detail}</p>
                                        </div>
                                        <div className="shrink-0 flex justify-end">
                                            {log.status === 'Approved' || log.status === 'Resolved' || log.status === 'Income' ? (
                                                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">{log.status}</span>
                                            ) : log.status === 'Pending' || log.status === 'Open' || log.status === 'In Progress' ? (
                                                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FFB600]/20 text-[#FFB600]">{log.status}</span>
                                            ) : log.status === 'Expense' ? (
                                                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">{log.status}</span>
                                            ) : log.status === 'Critical' || log.status === 'Rejected' ? (
                                                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">{log.status}</span>
                                            ) : (
                                                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">{log.status}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {dashData.materials.length === 0 && dashData.issues.length === 0 && dashData.pettyCash.length === 0 && (dashData.leaves || []).length === 0 && (
                                    <div className="text-center text-slate-500 text-[10px] uppercase tracking-widest mt-10">No recent activity logs found</div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions (50%) */}
                        <div className="premium-card p-8 flex flex-col h-[400px]">
                            <div className="mb-6 flex items-center gap-3 shrink-0">
                                <Activity size={18} className="text-blue-500" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Quick Actions</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                <Link href="/attendance" className="flex flex-col items-center justify-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-primary/10 hover:border-primary/30 transition-all group">
                                    <div className="p-3 bg-white/[0.05] rounded-xl group-hover:bg-primary/20 transition-colors">
                                        <Users size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Log Attendance</span>
                                </Link>
                                <Link href="/leave" className="flex flex-col items-center justify-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group">
                                    <div className="p-3 bg-white/[0.05] rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                        <Calendar size={20} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Leave Requests</span>
                                </Link>
                                <Link href="/sites" className="flex flex-col items-center justify-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group">
                                    <div className="p-3 bg-white/[0.05] rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                        <Building size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">My Sites</span>
                                </Link>
                                <Link href={`/sites/${activeSiteId !== 'All' ? activeSiteId : (engineerSites[0]?._id || engineerSites[0]?.id || '')}?tab=Issues`} className="flex flex-col items-center justify-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all group">
                                    <div className="p-3 bg-white/[0.05] rounded-xl group-hover:bg-red-500/20 transition-colors">
                                        <AlertTriangle size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Report Issue</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
