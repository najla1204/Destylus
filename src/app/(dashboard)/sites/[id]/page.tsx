"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Users, Package, Calendar, HardHat, FileText, Plus, X, AlertTriangle, IndianRupee, Phone, UserCheck, Wallet, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight, Clock, Filter } from "lucide-react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
interface SiteData {
    _id: string;
    name: string;
    locationName: string;
    locationLink: string;
    status: "Active" | "Completed" | "Planning" | "Pending";
    budget: number;
    managers: string[];
    engineers: string[];
    labourCount: number;
    materialCount: number;
    issueCount: number;
}

interface Labour {
    _id: string;
    name: string;
    mobile?: string;
    workerType: "Skilled" | "Unskilled" | "Supervisor";
    createdAt: string;
}

interface Material {
    _id: string;
    item: string;
    quantity: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
}

interface Issue {
    _id: string;
    title: string;
    description?: string;
    status: "Open" | "In Progress" | "Resolved";
    priority: "Low" | "Medium" | "High" | "Critical";
    createdAt: string;
}

interface PettyCashTransaction {
    _id: string;
    title: string;
    amount: number;
    type: "Allocation" | "Expense";
    loggedBy: string;
    date: string;
}

interface PettyCashSummary {
    allocated: number;
    spent: number;
    balance: number;
}

interface AttendanceRecord {
    _id: string;
    employeeName: string;
    employeeId: string;
    role: string;
    site: string;
    status: 'checked-in' | 'checked-out';
    approvalStatus: 'pending' | 'approved' | 'rejected';
    checkInTime: string;
    checkOutTime?: string;
    totalHours?: number;
}

export default function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const siteId = resolvedParams.id;

    const [site, setSite] = useState<SiteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Labours" | "Materials" | "Issues" | "Petty Cash" | "Attendance">("Labours");

    // Data States
    const [labours, setLabours] = useState<Labour[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([]);
    const [pettyCashSummary, setPettyCashSummary] = useState<PettyCashSummary | null>(null);
    const [tabLoading, setTabLoading] = useState(false);

    // Attendance states
    const [engineerAttendance, setEngineerAttendance] = useState<AttendanceRecord[]>([]);
    const [labourAttendance, setLabourAttendance] = useState<AttendanceRecord[]>([]);
    const [attendanceFromDate, setAttendanceFromDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [attendanceToDate, setAttendanceToDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [expandedEngineerId, setExpandedEngineerId] = useState<string | null>(null);
    const [todayLabourAttendance, setTodayLabourAttendance] = useState<AttendanceRecord[]>([]);
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

    // Modal States
    const [isAddLabourOpen, setIsAddLabourOpen] = useState(false);
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [isAllocatePettyCashOpen, setIsAllocatePettyCashOpen] = useState(false);
    const [isLogPettyCashExpenseOpen, setIsLogPettyCashExpenseOpen] = useState(false);

    // Form States
    const [newLabour, setNewLabour] = useState({ name: "", mobile: "", workerType: "Unskilled" });
    const [newMaterial, setNewMaterial] = useState({ item: "", quantity: "", unit: "Nos" });
    const [newPettyCash, setNewPettyCash] = useState({ title: "", amount: "" });

    // Fetch site data
    useEffect(() => {
        const fetchSite = async () => {
            try {
                const res = await fetch(`/api/sites/${siteId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data._id) {
                        setSite(data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch site from API:", err);
            }
            
            // Fallback: try localStorage
            try {
                const savedSites = localStorage.getItem("destylus_dashboard_sites_v4");
                if (savedSites) {
                    const parsed = JSON.parse(savedSites);
                    const found = parsed.find((s: any) => s._id === siteId || s.id === siteId);
                    if (found) {
                        setSite({
                            _id: found._id || found.id,
                            name: found.name,
                            locationName: found.locationName || '',
                            locationLink: found.locationLink || '',
                            status: found.status || 'Active',
                            budget: found.budget || 0,
                            managers: found.managers || [],
                            engineers: found.engineers || [],
                            labourCount: 0,
                            materialCount: 0,
                            issueCount: 0
                        });
                        setLoading(false);
                        return;
                    }
                }
            } catch (lsErr) {
                console.error("Failed localStorage fallback:", lsErr);
            }
            
            setLoading(false);
        };
        fetchSite();
    }, [siteId, router]);

    // Fetch tab data when tab changes
    useEffect(() => {
        const fetchTabData = async () => {
            setTabLoading(true);
            try {
                if (activeTab === "Labours") {
                    const res = await fetch(`/api/sites/${siteId}/labours`);
                    const data = await res.json();
                    setLabours(data);
                } else if (activeTab === "Materials") {
                    const res = await fetch(`/api/sites/${siteId}/materials`);
                    const data = await res.json();
                    setMaterials(data);
                } else if (activeTab === "Issues") {
                    const res = await fetch(`/api/sites/${siteId}/issues`);
                    const data = await res.json();
                    setIssues(data);
                } else if (activeTab === "Petty Cash") {
                    const res = await fetch(`/api/sites/${siteId}/petty-cash`);
                    const data = await res.json();
                    setPettyCashTransactions(data.transactions || []);
                    setPettyCashSummary(data.summary || null);
                } else if (activeTab === "Attendance") {
                    const params = new URLSearchParams();
                    if (site?.name) params.set('siteName', site.name);
                    if (attendanceFromDate) params.set('from', attendanceFromDate);
                    if (attendanceToDate) params.set('to', attendanceToDate);
                    const res = await fetch(`/api/sites/${siteId}/attendance?${params.toString()}`);
                    const data = await res.json();
                    setEngineerAttendance(data.engineerRecords || []);
                    setLabourAttendance(data.labourRecords || []);
                }
            } catch (err) {
                console.error(`Failed to fetch ${activeTab}:`, err);
            } finally {
                setTabLoading(false);
            }
        };
        if (site) fetchTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, siteId, site, attendanceFromDate, attendanceToDate]);

    // Fetch today's labour attendance for the Labours tab
    useEffect(() => {
        const fetchTodayLabourAttendance = async () => {
            if (!site) return;
            try {
                const today = new Date().toISOString().split('T')[0];
                const params = new URLSearchParams();
                if (site.name) params.set('siteName', site.name);
                params.set('from', today);
                params.set('to', today);
                const res = await fetch(`/api/sites/${siteId}/attendance?${params.toString()}`);
                const data = await res.json();
                setTodayLabourAttendance(data.labourRecords || []);
            } catch (err) {
                console.error('Failed to fetch today labour attendance:', err);
            }
        };
        if (site) fetchTodayLabourAttendance();
    }, [site, siteId]);

    // Submit handlers
    const handleAddLabour = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/sites/${siteId}/labours`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newLabour.name,
                    mobile: newLabour.mobile || undefined,
                    workerType: newLabour.workerType
                })
            });
            if (res.ok) {
                const created = await res.json();
                setLabours(prev => [created, ...prev]);
                setSite(prev => prev ? { ...prev, labourCount: prev.labourCount + 1 } : prev);
                setIsAddLabourOpen(false);
                setNewLabour({ name: "", mobile: "", workerType: "Unskilled" });
            }
        } catch (err) {
            console.error("Failed to add labour:", err);
        }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/sites/${siteId}/materials`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item: newMaterial.item,
                    quantity: Number(newMaterial.quantity),
                    unit: newMaterial.unit
                })
            });
            if (res.ok) {
                const created = await res.json();
                setMaterials(prev => [created, ...prev]);
                setSite(prev => prev ? { ...prev, materialCount: prev.materialCount + 1 } : prev);
                setIsAddMaterialOpen(false);
                setNewMaterial({ item: "", quantity: "", unit: "Nos" });
            }
        } catch (err) {
            console.error("Failed to add material:", err);
        }
    };

    const handlePettyCashSubmit = async (e: React.FormEvent, type: "Allocation" | "Expense") => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/sites/${siteId}/petty-cash`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newPettyCash.title,
                    amount: Number(newPettyCash.amount),
                    type,
                    loggedBy: "Current User" // In a real app, this would be the logged-in user's name
                })
            });
            if (res.ok) {
                const created = await res.json();
                setPettyCashTransactions(prev => [created, ...prev]);
                
                // Update summary locally to avoid immediate refetch
                setPettyCashSummary(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        allocated: type === "Allocation" ? prev.allocated + created.amount : prev.allocated,
                        spent: type === "Expense" ? prev.spent + created.amount : prev.spent,
                        balance: type === "Allocation" ? prev.balance + created.amount : prev.balance - created.amount
                    };
                });

                if (type === "Allocation") {
                    setSite(prev => prev ? { ...prev, budget: prev.budget + created.amount } : prev);
                }
                
                setIsAllocatePettyCashOpen(false);
                setIsLogPettyCashExpenseOpen(false);
                setNewPettyCash({ title: "", amount: "" });
            }
        } catch (err) {
            console.error(`Failed to log petty cash ${type.toLowerCase()}:`, err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted mt-4 text-sm">Loading Site Details...</p>
            </div>
        );
    }

    if (!site) {
        return <div className="p-8 text-center text-muted">Site not found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Back & Header */}
            <div className="flex flex-col gap-4">
                <Link href="/sites" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Sites
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-700 pb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">{site.name}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                site.status === 'Active' ? 'bg-primary/20 text-primary border border-primary/30' :
                                site.status === 'Completed' ? 'bg-success/20 text-success border border-success/30' :
                                'bg-surface text-muted border border-gray-700'
                            }`}>
                                {site.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                            <MapPin size={16} />
                            {site.locationName}
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-2">
                    {/* Project Managers */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Project Managers</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <Users size={18} className="text-primary shrink-0" />
                            <span className="truncate text-sm">{site.managers.length > 0 ? site.managers.join(", ") : "Unassigned"}</span>
                        </div>
                    </div>

                    {/* Site Engineers */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Site Engineers</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <HardHat size={18} className="text-primary shrink-0" />
                            <span className="truncate text-sm">{site.engineers.length > 0 ? site.engineers.join(", ") : "Unassigned"}</span>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Budget Allocated</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <IndianRupee size={18} className="text-success shrink-0" />
                            <span className="text-sm font-mono font-bold">{site.budget > 0 ? `₹${site.budget.toLocaleString('en-IN')}` : "Not Set"}</span>
                        </div>
                    </div>

                    {/* Labour Count */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Labours</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <UserCheck size={18} className="text-blue-400 shrink-0" />
                            <span className="text-2xl font-black">{site.labourCount}</span>
                        </div>
                    </div>

                    {/* Materials Count */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Materials</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <Package size={18} className="text-purple-400 shrink-0" />
                            <span className="text-2xl font-black">{site.materialCount}</span>
                        </div>
                    </div>

                    {/* Issues Count */}
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Issues</span>
                        <div className="flex items-center gap-2 text-foreground font-medium mt-1">
                            <AlertTriangle size={18} className="text-red-400 shrink-0" />
                            <span className="text-2xl font-black">{site.issueCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-700 pb-px mt-4 overflow-x-auto">
                {(["Labours", "Materials", "Issues", "Petty Cash", "Attendance"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-semibold text-sm transition-all whitespace-nowrap border-b-2 ${
                            activeTab === tab
                            ? "text-primary border-primary"
                            : "text-muted border-transparent hover:text-foreground"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Loading */}
            {tabLoading && (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* TAB: LABOURS */}
            {!tabLoading && activeTab === "Labours" && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-foreground">Labours Directory</h2>
                        <button
                            onClick={() => setIsAddLabourOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={16} /> Add Labour
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Mobile</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Worker Type</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Today&apos;s Attendance</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Added On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {labours.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No labours registered for this site.</td></tr>
                                ) : (
                                    labours.map(l => (
                                        <tr key={l._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                                            <td className="px-4 py-3 text-muted">
                                                {l.mobile ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone size={13} className="text-muted" />
                                                        {l.mobile}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted italic">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                    l.workerType === 'Skilled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    l.workerType === 'Supervisor' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-surface text-muted border-gray-700'
                                                }`}>
                                                    {l.workerType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const match = todayLabourAttendance.find(a => a.employeeName === l.name);
                                                    if (match) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                                <UserCheck size={12} /> Present
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-surface text-muted border border-gray-700">
                                                            — Absent
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: MATERIALS */}
            {!tabLoading && activeTab === "Materials" && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-foreground">Materials Inventory</h2>
                        <button
                            onClick={() => setIsAddMaterialOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={16} /> Add Material
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Item Name</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Unit</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {materials.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No materials recorded at this site.</td></tr>
                                ) : (
                                    materials.map(m => (
                                        <tr key={m._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{m.item}</td>
                                            <td className="px-4 py-3 text-primary font-mono font-bold">{m.quantity}</td>
                                            <td className="px-4 py-3 text-muted">{m.unit}</td>
                                            <td className="px-4 py-3 text-muted text-xs">{new Date(m.updatedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: ISSUES */}
            {!tabLoading && activeTab === "Issues" && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-foreground">Site Issues</h2>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Priority</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Reported</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {issues.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No issues reported for this site.</td></tr>
                                ) : (
                                    issues.map(i => (
                                        <tr key={i._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{i.title}</td>
                                            <td className="px-4 py-3 text-muted max-w-[300px] truncate">{i.description || "—"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                    i.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    i.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    i.priority === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-surface text-muted border-gray-700'
                                                }`}>
                                                    {i.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                    i.status === 'Open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    i.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-success/10 text-success border-success/20'
                                                }`}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: PETTY CASH */}
            {!tabLoading && activeTab === "Petty Cash" && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-foreground">Petty Cash Management</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsAllocatePettyCashOpen(true)}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-surface border border-primary/50 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex"
                            >
                                <ArrowUpRight size={16} /> Allocate Funds
                            </button>
                            <button
                                onClick={() => setIsLogPettyCashExpenseOpen(true)}
                                className="flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex"
                            >
                                <ArrowDownRight size={16} /> Log Expense
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {pettyCashSummary && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-panel border border-gray-700 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center">
                                    <Wallet size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted text-xs uppercase tracking-wider font-semibold">Total Allocated</span>
                                    <span className="text-xl font-bold font-mono mt-0.5">₹{pettyCashSummary.allocated.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <div className="bg-panel border border-gray-700 p-5 rounded-xl flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center">
                                    <ArrowDownRight size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted text-xs uppercase tracking-wider font-semibold">Total Spent</span>
                                    <span className="text-xl font-bold font-mono mt-0.5">₹{pettyCashSummary.spent.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <div className="bg-panel border border-gray-700 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${pettyCashSummary.balance < 0 ? 'bg-red-500' : 'bg-primary'}`}></div>
                                <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${pettyCashSummary.balance < 0 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                    <IndianRupee size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted text-xs uppercase tracking-wider font-semibold">Current Balance</span>
                                    <span className={`text-xl font-bold font-mono mt-0.5 ${pettyCashSummary.balance < 0 ? 'text-red-400' : 'text-primary'}`}>
                                        ₹{pettyCashSummary.balance.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Title/Description</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Logged By</th>
                                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {pettyCashTransactions.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No petty cash transactions recorded.</td></tr>
                                ) : (
                                    pettyCashTransactions.map(tx => (
                                        <tr key={tx._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 text-muted">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {tx.type === 'Allocation' ? (
                                                        <ArrowUpRight size={14} className="text-primary shrink-0" />
                                                    ) : (
                                                        <ArrowDownRight size={14} className="text-orange-400 shrink-0" />
                                                    )}
                                                    <span className="font-medium text-foreground">{tx.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted">{tx.loggedBy}</td>
                                            <td className={`px-4 py-3 text-right font-mono font-medium ${tx.type === 'Allocation' ? 'text-primary' : 'text-foreground'}`}>
                                                {tx.type === 'Allocation' ? '+' : '-'} {tx.amount.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: ATTENDANCE */}
            {!tabLoading && activeTab === "Attendance" && (() => {
                const allRecords = [...engineerAttendance, ...labourAttendance];
                const approvedCount = allRecords.filter(r => r.approvalStatus === 'approved').length;
                const pendingCount = allRecords.filter(r => r.approvalStatus === 'pending').length;
                const rejectedCount = allRecords.filter(r => r.approvalStatus === 'rejected').length;

                const filteredEngineers = attendanceStatusFilter === 'all'
                    ? engineerAttendance
                    : engineerAttendance.filter(r => r.approvalStatus === attendanceStatusFilter);
                const filteredLabours = attendanceStatusFilter === 'all'
                    ? labourAttendance
                    : labourAttendance.filter(r => r.approvalStatus === attendanceStatusFilter);

                return (
                <div className="flex flex-col gap-6">
                    {/* Summary Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'approved' ? 'all' : 'approved')}
                            className={`bg-panel border p-5 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] cursor-pointer ${
                                attendanceStatusFilter === 'approved' ? 'border-primary ring-1 ring-primary/30' : 'border-gray-700'
                            }`}
                        >
                            <div className="h-12 w-12 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <UserCheck size={22} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-muted text-xs uppercase tracking-wider font-semibold">Approved</span>
                                <span className="text-2xl font-black text-primary mt-0.5">{approvedCount}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'pending' ? 'all' : 'pending')}
                            className={`bg-panel border p-5 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] cursor-pointer ${
                                attendanceStatusFilter === 'pending' ? 'border-yellow-500 ring-1 ring-yellow-500/30' : 'border-gray-700'
                            }`}
                        >
                            <div className="h-12 w-12 shrink-0 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center">
                                <Clock size={22} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-muted text-xs uppercase tracking-wider font-semibold">Pending</span>
                                <span className="text-2xl font-black text-yellow-400 mt-0.5">{pendingCount}</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setAttendanceStatusFilter(attendanceStatusFilter === 'rejected' ? 'all' : 'rejected')}
                            className={`bg-panel border p-5 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] cursor-pointer ${
                                attendanceStatusFilter === 'rejected' ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-700'
                            }`}
                        >
                            <div className="h-12 w-12 shrink-0 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-muted text-xs uppercase tracking-wider font-semibold">Rejected</span>
                                <span className="text-2xl font-black text-red-400 mt-0.5">{rejectedCount}</span>
                            </div>
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-panel border border-gray-700 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                            <Filter size={16} />
                            Filters
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">From</label>
                            <input
                                type="date"
                                value={attendanceFromDate}
                                onChange={e => setAttendanceFromDate(e.target.value)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">To</label>
                            <input
                                type="date"
                                value={attendanceToDate}
                                onChange={e => setAttendanceToDate(e.target.value)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider font-semibold">Status</label>
                            <select
                                value={attendanceStatusFilter}
                                onChange={e => setAttendanceStatusFilter(e.target.value as any)}
                                className="rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer min-w-[120px]"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="text-xs text-muted mt-1 sm:mt-0">
                            Showing {filteredEngineers.length + filteredLabours.length} of {allRecords.length} records
                        </div>
                    </div>

                    {/* Site Engineers Attendance */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <HardHat size={20} className="text-primary" />
                            Site Engineers Attendance
                        </h2>
                        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider w-8"></th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Check-In</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Check-Out</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Hours</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredEngineers.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-muted">No engineer attendance records found for this date range.</td></tr>
                                    ) : (
                                        filteredEngineers.map(record => (
                                            <>
                                                <tr
                                                    key={record._id}
                                                    onClick={() => setExpandedEngineerId(
                                                        expandedEngineerId === record.employeeId ? null : record.employeeId
                                                    )}
                                                    className="hover:bg-surface/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-4 py-3 text-muted">
                                                        {expandedEngineerId === record.employeeId
                                                            ? <ChevronDown size={16} className="text-primary" />
                                                            : <ChevronRight size={16} />
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-foreground">{record.employeeName}</td>
                                                    <td className="px-4 py-3 text-muted">{new Date(record.checkInTime).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="flex items-center gap-1 text-primary">
                                                            <Clock size={13} />
                                                            {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted">
                                                        {record.checkOutTime
                                                            ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : <span className="text-blue-400 italic">Active</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                                                        {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                            record.approvalStatus === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                                                            record.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        }`}>
                                                            {record.approvalStatus.charAt(0).toUpperCase() + record.approvalStatus.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {/* Expanded sub-table: Labour attendance marked by this engineer */}
                                                {expandedEngineerId === record.employeeId && (
                                                    <tr key={`${record._id}-sub`}>
                                                        <td colSpan={7} className="p-0">
                                                            <div className="mx-4 my-3 rounded-lg border border-gray-600 bg-surface overflow-hidden">
                                                                <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-600 flex items-center gap-2">
                                                                    <Users size={14} className="text-blue-400" />
                                                                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                                                                        Labours under {record.employeeName}
                                                                    </span>
                                                                </div>
                                                                <table className="w-full text-left text-sm">
                                                                    <thead className="text-muted border-b border-gray-600">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Labour Name</th>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Date</th>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Check-In</th>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Check-Out</th>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Hours</th>
                                                                            <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider">Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-600">
                                                                        {filteredLabours.filter(la => {
                                                                            // Match labours whose attendance date is same as engineer record date
                                                                            const engDate = new Date(record.checkInTime).toDateString();
                                                                            const labDate = new Date(la.checkInTime).toDateString();
                                                                            return engDate === labDate;
                                                                        }).length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan={6} className="px-4 py-4 text-center text-muted text-xs italic">
                                                                                    No labour attendance records for this date.
                                                                                </td>
                                                                            </tr>
                                                                        ) : (
                                                                            filteredLabours.filter(la => {
                                                                                const engDate = new Date(record.checkInTime).toDateString();
                                                                                const labDate = new Date(la.checkInTime).toDateString();
                                                                                return engDate === labDate;
                                                                            }).map(la => (
                                                                                <tr key={la._id} className="hover:bg-gray-800/30 transition-colors">
                                                                                    <td className="px-4 py-2 font-medium text-foreground text-sm">{la.employeeName}</td>
                                                                                    <td className="px-4 py-2 text-muted text-xs">{new Date(la.checkInTime).toLocaleDateString()}</td>
                                                                                    <td className="px-4 py-2 text-xs text-primary">
                                                                                        {new Date(la.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-xs text-muted">
                                                                                        {la.checkOutTime
                                                                                            ? new Date(la.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                                            : <span className="text-blue-400 italic">Active</span>
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-xs font-mono font-medium text-foreground">
                                                                                        {la.totalHours ? `${la.totalHours.toFixed(1)}h` : '—'}
                                                                                    </td>
                                                                                    <td className="px-4 py-2">
                                                                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                                                            la.approvalStatus === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                                                                                            la.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                                        }`}>
                                                                                            {la.approvalStatus.charAt(0).toUpperCase() + la.approvalStatus.slice(1)}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Labour Attendance Summary */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <UserCheck size={20} className="text-blue-400" />
                            Labour Attendance
                        </h2>
                        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-panel shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Check-In</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Check-Out</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Hours</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredLabours.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-muted">No labour attendance records found for this date range.</td></tr>
                                    ) : (
                                        filteredLabours.map(la => (
                                            <tr key={la._id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground">{la.employeeName}</td>
                                                <td className="px-4 py-3 text-muted">{new Date(la.checkInTime).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <Clock size={13} />
                                                        {new Date(la.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted">
                                                    {la.checkOutTime
                                                        ? new Date(la.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : <span className="text-blue-400 italic">Active</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 font-mono font-medium text-foreground">
                                                    {la.totalHours ? `${la.totalHours.toFixed(1)}h` : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                                                        la.approvalStatus === 'approved' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        la.approvalStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                        {la.approvalStatus.charAt(0).toUpperCase() + la.approvalStatus.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* --- MODALS --- */}

            {/* Add Labour Modal */}
            {isAddLabourOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Add Site Labour</h3>
                            <button onClick={() => setIsAddLabourOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddLabour} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Full Name <span className="text-red-500">*</span></label>
                                <input required type="text" value={newLabour.name} onChange={e => setNewLabour({...newLabour, name: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Ramesh Kumar"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Mobile Number <span className="text-muted text-xs">(Optional)</span></label>
                                <input type="tel" value={newLabour.mobile} onChange={e => setNewLabour({...newLabour, mobile: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. 9876543210"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Worker Type <span className="text-red-500">*</span></label>
                                <select value={newLabour.workerType} onChange={e => setNewLabour({...newLabour, workerType: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                    <option value="Unskilled">Unskilled Labour</option>
                                    <option value="Skilled">Skilled Labour</option>
                                    <option value="Supervisor">Supervisor</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsAddLabourOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save Labour</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Material Modal */}
            {isAddMaterialOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Add Material Stock</h3>
                            <button onClick={() => setIsAddMaterialOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleAddMaterial} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Material Name <span className="text-red-500">*</span></label>
                                <input required type="text" value={newMaterial.item} onChange={e => setNewMaterial({...newMaterial, item: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Cement (UltraTech)"/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Quantity <span className="text-red-500">*</span></label>
                                    <input required type="number" step="0.5" min="0" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="100"/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">Unit <span className="text-red-500">*</span></label>
                                    <select value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                        <option value="Nos">Nos</option>
                                        <option value="Bags">Bags</option>
                                        <option value="Tons">Tons</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Ltrs">Ltrs</option>
                                        <option value="Units">Units</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsAddMaterialOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocate Petty Cash Modal */}
            {isAllocatePettyCashOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Allocate Petty Cash</h3>
                            <button onClick={() => setIsAllocatePettyCashOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => handlePettyCashSubmit(e, "Allocation")} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Reference / Title <span className="text-red-500">*</span></label>
                                <input required type="text" value={newPettyCash.title} onChange={e => setNewPettyCash({...newPettyCash, title: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Weekly Allocation"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Amount (₹) <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={newPettyCash.amount} onChange={e => setNewPettyCash({...newPettyCash, amount: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="10000"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsAllocatePettyCashOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Allocate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Log Petty Cash Expense Modal */}
            {isLogPettyCashExpenseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-panel shadow-lg">
                        <div className="flex items-center justify-between border-b border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-foreground">Log Petty Cash Expense</h3>
                            <button onClick={() => setIsLogPettyCashExpenseOpen(false)} className="text-muted hover:text-foreground transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => handlePettyCashSubmit(e, "Expense")} className="p-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Expense Description <span className="text-red-500">*</span></label>
                                <input required type="text" value={newPettyCash.title} onChange={e => setNewPettyCash({...newPettyCash, title: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="E.g. Travel to Hardware Store"/>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Amount Spent (₹) <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" value={newPettyCash.amount} onChange={e => setNewPettyCash({...newPettyCash, amount: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono" placeholder="500"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6">
                                <button type="button" onClick={() => setIsLogPettyCashExpenseOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface">Cancel</button>
                                <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Log Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
