"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Mail, Briefcase, Users, Calendar, DollarSign, FileText, ChevronRight, AlertTriangle, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface EngineerData {
    _id: string;
    name: string;
    email?: string;
    role: string;
    site?: string;
    employeeId?: string;
    isActive?: boolean;
    createdAt?: string;
}

interface SiteData {
    _id: string;
    name: string;
    locationName: string;
    status: string;
}

interface PMData {
    _id: string;
    name: string;
    email?: string;
    site?: string;
}

interface PettyCashTx {
    _id: string;
    title: string;
    amount: number;
    type: string;
    loggedBy: string;
    date: string;
}

interface PettyCashSummary {
    allocated: number;
    spent: number;
    balance: number;
}

interface LeaveRequest {
    id: number;
    name: string;
    role: string;
    type: string;
    from: string;
    to: string;
    reason: string;
    status: string;
}

export default function EngineerDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const [engineer, setEngineer] = useState<EngineerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [site, setSite] = useState<SiteData | null>(null);
    const [projectManager, setProjectManager] = useState<PMData | null>(null);
    const [pettyCashTxs, setPettyCashTxs] = useState<PettyCashTx[]>([]);
    const [pettyCashSummary, setPettyCashSummary] = useState<PettyCashSummary>({ allocated: 0, spent: 0, balance: 0 });
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch engineer user data
                const userRes = await fetch(`/api/users/${id}`);
                let engData: EngineerData | null = null;

                if (userRes.ok) {
                    const userData = await userRes.json();
                    engData = userData.user || userData;
                    setEngineer(engData);
                } else {
                    // Fallback: search in list
                    const listRes = await fetch(`/api/users?role=engineer`);
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        const found = (listData.users || []).find((u: any) => u._id === id);
                        if (found) {
                            engData = found;
                            setEngineer(found);
                        }
                    }
                }

                if (!engData) {
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch sites — find site matching engineer's site name
                const sitesRes = await fetch("/api/sites");
                let matchedSite: SiteData | null = null;
                if (sitesRes.ok) {
                    const sitesData = await sitesRes.json();
                    const allSites: SiteData[] = sitesData.sites || sitesData || [];
                    if (engData.site) {
                        matchedSite = allSites.find(s => s.name === engData!.site) || null;
                        setSite(matchedSite);
                    }
                }

                // 3. Fetch project managers — find PM assigned to the same site
                if (engData.site) {
                    const pmRes = await fetch("/api/users?role=project_manager");
                    if (pmRes.ok) {
                        const pmData = await pmRes.json();
                        const allPMs: PMData[] = pmData.users || [];
                        const matchedPM = allPMs.find(pm => pm.site === engData!.site) || null;
                        setProjectManager(matchedPM);
                    }
                }

                // 4. Fetch petty cash for the matched site
                if (matchedSite) {
                    try {
                        const pcRes = await fetch(`/api/sites/${matchedSite._id}/petty-cash`);
                        if (pcRes.ok) {
                            const pcData = await pcRes.json();
                            setPettyCashTxs(pcData.transactions || []);
                            setPettyCashSummary(pcData.summary || { allocated: 0, spent: 0, balance: 0 });
                        }
                    } catch {
                        // skip
                    }
                }

                // 5. Load leave requests from localStorage (they are stored there)
                try {
                    const savedLeaves = localStorage.getItem("destylus_dashboard_leaves_v2");
                    if (savedLeaves) {
                        const parsedLeaves: LeaveRequest[] = JSON.parse(savedLeaves);
                        const engineerLeaves = parsedLeaves.filter(
                            l => l.name.toLowerCase() === engData!.name.toLowerCase()
                        );
                        setLeaveRequests(engineerLeaves);
                    }
                } catch {
                    // skip
                }

            } catch (error) {
                console.error("Failed to load engineer details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="p-6 text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl m-6 text-center animate-pulse">
                Loading Engineer Details...
            </div>
        );
    }

    if (!engineer) {
        return (
            <div className="space-y-4 m-6">
                <Link href="/engineers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Engineers
                </Link>
                <div className="p-6 text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl text-center">
                    Engineer not found.
                </div>
            </div>
        );
    }

    const formatCurrency = (amt: number) => `₹${amt.toLocaleString("en-IN")}`;

    const leaveStatusColor = (s: string) => {
        switch (s) {
            case "Approved": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "Rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
            default: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        }
    };

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/engineers" className="rounded-lg p-2 text-muted hover:bg-gray-800 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Engineer Profile</h1>
                </div>
            </div>

            {/* Header Card */}
            <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-black border-2 border-orange-200 shrink-0">
                        {engineer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-foreground">{engineer.name}</h2>
                        <p className="text-primary font-medium">Site Engineer</p>
                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-5 text-sm text-muted">
                            {engineer.email && (
                                <div className="flex items-center gap-2"><Mail size={16} /> {engineer.email}</div>
                            )}
                            {engineer.site && (
                                <div className="flex items-center gap-2"><MapPin size={16} /> {engineer.site}</div>
                            )}
                            {engineer.employeeId && (
                                <div className="flex items-center gap-2"><Briefcase size={16} /> {engineer.employeeId}</div>
                            )}
                            {engineer.createdAt && (
                                <div className="flex items-center gap-2"><Calendar size={16} /> Joined {new Date(engineer.createdAt).toLocaleDateString()}</div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            engineer.isActive !== false
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}>
                            {engineer.isActive !== false ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Site Allocated */}
                <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center gap-2">
                        <MapPin size={18} className="text-primary" />
                        <h3 className="font-bold text-foreground">Site Allocated</h3>
                    </div>
                    <div className="p-5">
                        {site ? (
                            <Link
                                href={`/sites/${site._id}`}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-700 bg-surface hover:border-primary/50 hover:bg-gray-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{site.name}</p>
                                        <p className="text-xs text-muted">{site.locationName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                                        site.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        site.status === "Completed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    }`}>
                                        {site.status}
                                    </span>
                                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ) : (
                            <div className="py-6 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                                <MapPin className="mx-auto mb-2 opacity-40" size={28} />
                                <p className="text-sm">{engineer.site ? engineer.site : "No site allocated"}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Manager */}
                <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center gap-2">
                        <Users size={18} className="text-blue-400" />
                        <h3 className="font-bold text-foreground">Project Manager</h3>
                    </div>
                    <div className="p-5">
                        {projectManager ? (
                            <Link
                                href={`/project-managers/${projectManager._id}`}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-700 bg-surface hover:border-blue-500/30 hover:bg-gray-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-300 border border-orange-400/20 flex items-center justify-center text-sm font-bold text-black shrink-0">
                                        {projectManager.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">{projectManager.name}</p>
                                        {projectManager.email && <p className="text-xs text-muted">{projectManager.email}</p>}
                                        <p className="text-xs text-muted">Project Manager</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-muted group-hover:text-blue-400 transition-colors" />
                            </Link>
                        ) : (
                            <div className="py-6 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                                <Users className="mx-auto mb-2 opacity-40" size={28} />
                                <p className="text-sm">No project manager assigned to this site.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Petty Cash Section */}
            <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <DollarSign size={18} className="text-green-400" /> Petty Cash — {site?.name || engineer.site || "N/A"}
                    </h3>
                    <span className="text-xs text-muted bg-panel px-2.5 py-1 rounded-full border border-gray-700">
                        {pettyCashTxs.length} transaction{pettyCashTxs.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-px bg-gray-700">
                    <div className="bg-panel p-4 text-center">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Allocated</p>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(pettyCashSummary.allocated)}</p>
                    </div>
                    <div className="bg-panel p-4 text-center">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Spent</p>
                        <p className="text-lg font-bold text-red-400">{formatCurrency(pettyCashSummary.spent)}</p>
                    </div>
                    <div className="bg-panel p-4 text-center">
                        <p className="text-xs text-muted uppercase tracking-wider mb-1">Balance</p>
                        <p className={`text-lg font-bold ${pettyCashSummary.balance >= 0 ? "text-blue-400" : "text-red-400"}`}>
                            {formatCurrency(pettyCashSummary.balance)}
                        </p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="p-5">
                    {pettyCashTxs.length === 0 ? (
                        <div className="py-6 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                            <DollarSign className="mx-auto mb-2 opacity-40" size={28} />
                            <p className="text-sm">No petty cash transactions for this site.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Type</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Amount</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Logged By</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {pettyCashTxs.map(tx => (
                                        <tr key={tx._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{tx.title}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                    tx.type === "Allocation"
                                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}>
                                                    {tx.type === "Allocation" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-semibold ${
                                                tx.type === "Allocation" ? "text-green-400" : "text-red-400"
                                            }`}>
                                                {tx.type === "Allocation" ? "+" : "-"}{formatCurrency(tx.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-muted">{tx.loggedBy}</td>
                                            <td className="px-4 py-3 text-muted text-xs">
                                                {tx.date ? new Date(tx.date).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Requests Section */}
            <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <FileText size={18} className="text-purple-400" /> Leave Requests
                    </h3>
                    <span className="text-xs text-muted bg-panel px-2.5 py-1 rounded-full border border-gray-700">
                        {leaveRequests.length} request{leaveRequests.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <div className="p-5">
                    {leaveRequests.length === 0 ? (
                        <div className="py-6 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                            <CheckCircle2 className="mx-auto mb-2 text-green-500/40" size={28} />
                            <p className="text-sm">No leave requests found for this engineer.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-muted border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">From</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">To</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider">Reason</th>
                                        <th className="px-4 py-3 font-semibold uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {leaveRequests.map(lr => (
                                        <tr key={lr.id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{lr.type}</td>
                                            <td className="px-4 py-3 text-muted">{lr.from}</td>
                                            <td className="px-4 py-3 text-muted">{lr.to}</td>
                                            <td className="px-4 py-3 text-muted italic">{lr.reason}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${leaveStatusColor(lr.status)}`}>
                                                    {lr.status === "Approved" && <CheckCircle2 size={12} />}
                                                    {lr.status === "Pending" && <Clock size={12} />}
                                                    {lr.status === "Rejected" && <AlertTriangle size={12} />}
                                                    {lr.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
