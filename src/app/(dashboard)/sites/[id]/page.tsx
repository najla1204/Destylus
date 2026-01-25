"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Users, Package, Calendar, Activity, HardHat, DollarSign, CheckCircle, Edit, Save, X, FileText, AlertTriangle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Placeholder data type for daily report
interface DailyReport {
    id: string;
    date: string;
    engineerName: string;
    engineerAttendance: "Present" | "Absent" | "Half Day";
    laborCost: number;
    materialIn: string[];
    materialOut: string[];
    extraMaterials: string[];
    pettyCashSpend: number;
    pettyCashDetails: string;
    status: "Pending" | "Approved";
}

interface AttendanceLog {
    _id: string;
    employeeName: string;
    role: string;
    status: 'checked-in' | 'checked-out';
    checkInTime: string;
    checkOutTime?: string;
    inTimePhoto?: string;
    outTimePhoto?: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
}

export default function SiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>("");
    const [userRole, setUserRole] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);

    // Mock Site Data
    // Mock Site Data - Dynamic based on ID
    const getSiteDetails = (siteId: string) => {
        const sites: Record<string, any> = {
            "1": { name: "Skyline Tower A", location: "Downtown District", status: "Active" },
            "2": { name: "City Bridge Renovation", location: "West River", status: "Planning" },
            "3": { name: "Green Valley Mall", location: "Suburban Area", status: "Active" }
        };
        return sites[siteId] || { name: "Unknown Site", location: "Unknown", status: "Pending" };
    };

    const currentSiteData = getSiteDetails(id);

    const site = {
        id: id,
        name: currentSiteData.name,
        location: currentSiteData.location,
        status: currentSiteData.status,
        manager: "John Doe",
        projectEngineer: "Alex Morgan",
        description: "A construction project managed by Destylus.",
        progress: 35,
        startDate: "2024-01-01",
        completionDate: "2025-12-31",
    };

    // Mock Daily Report Data
    const [report, setReport] = useState<DailyReport>({
        id: "rep_001",
        date: new Date().toLocaleDateString(),
        engineerName: "John Doe",
        engineerAttendance: "Present",
        laborCost: 15000,
        materialIn: ["Cement: 50 Bags", "Steel: 2 Tons"],
        materialOut: ["Cement: 12 Bags"],
        extraMaterials: ["Gloves: 10 pairs"],
        pettyCashSpend: 2500,
        pettyCashDetails: "Fuel for generator",
        status: "Pending"
    });

    // Real-time Attendance State
    const [siteAttendance, setSiteAttendance] = useState<AttendanceLog[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
            // Fetch real-time attendance for this site
            // Note: In a real app we'd filter by site name/ID. matching site name for now.
            // Mock site mapping for demo since IDs don't match names perfectly in this hybrid state
            // UPDATE: Mapped correctly to match sites/page.tsx
            const siteNameMap: Record<string, string> = {
                "1": "Skyline Tower A",
                "2": "City Bridge Renovation",
                "3": "Green Valley Mall",
            };

            // For now, we'll try to fetch using the site name from the mock object below
            // But we need to wait for site data if it was async. Here it is sync mock.
        };
        resolveParams();


        const role = localStorage.getItem("userRole") || "";
        if (role !== userRole) {
            setUserRole(role);
        }

        // Fetch attendance
        const fetchAttendance = async () => {
            setLoadingAttendance(true);
            try {
                // In a real app, use site.name or site.id
                const res = await fetch(`/api/attendance?site=${encodeURIComponent(site.name)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSiteAttendance(data.attendanceLogs || []);
                }
            } catch (e) {
                console.error("Failed to fetch attendance", e);
            } finally {
                setLoadingAttendance(false);
            }
        };

        if (userRole === "Project Manager" || userRole === "Site Engineer" || userRole === "Engineer") {
            fetchAttendance();
        }

    }, [params, userRole, site.name]);

    const handleApproveAttendance = async (logId: string) => {
        try {
            const res = await fetch(`/api/attendance/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) {
                // Refresh list
                const updated = siteAttendance.map(log =>
                    log._id === logId ? { ...log, approvalStatus: 'approved' as const } : log
                );
                setSiteAttendance(updated);
            } else {
                alert("Failed to approve attendance. Please try again.");
            }
        } catch (e) {
            console.error("Error approving", e);
            alert("An error occurred while approving attendance.");
        }
    };

    const handleRejectAttendance = async (logId: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return; // Cancelled

        try {
            const res = await fetch(`/api/attendance/${logId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', rejectionReason: reason || "No reason provided" })
            });
            if (res.ok) {
                // Refresh list
                const updated = siteAttendance.map(log =>
                    log._id === logId ? { ...log, approvalStatus: 'rejected' as const } : log
                );
                setSiteAttendance(updated);
            } else {
                alert("Failed to reject attendance. Please try again.");
            }
        } catch (e) {
            console.error("Error rejecting", e);
            alert("An error occurred while rejecting attendance.");
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        // In real app, API call to update report
    };

    const handleApprove = () => {
        if (confirm("Are you sure you want to approve this daily report?")) {
            setReport({ ...report, status: "Approved" });
        }
    };

    const totalCost = report.laborCost + report.pettyCashSpend; // Simplified logic

    // --- HR MANAGER VIEW ---
    if (userRole === "HR Manager") {
        return (
            <div className="space-y-6">
                {/* Breadcrumb & Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span>{site.name}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-foreground">{site.name} <span className="text-sm font-normal text-muted bg-gray-800 px-2 py-1 rounded-md ml-2">{site.status}</span></h1>
                        <Link
                            href={`/sites/${id}/reports`}
                            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-800 transition-colors"
                        >
                            <FileText size={18} />
                            Generate Report
                        </Link>
                    </div>
                </div>

                {/* 1. KEY PERSONNEL CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">Project Leadership</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={20} /></div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{site.manager}</p>
                                    <p className="text-xs text-muted">Project Manager</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><HardHat size={20} /></div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{site.projectEngineer}</p>
                                    <p className="text-xs text-muted">Site Engineer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. FINANCIAL SUMMARY */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h2 className="mb-4 text-sm font-semibold text-muted uppercase tracking-wider">Financial Overview</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted">Total Budget</p>
                                <p className="text-xl font-bold text-foreground">₹2.4 Cr</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Expense Till Date</p>
                                <p className="text-xl font-bold text-red-400">₹85.2 L</p>
                            </div>
                        </div>
                        <div className="mt-4 h-2 w-full rounded-full bg-gray-800">
                            <div className="h-2 w-[35%] rounded-full bg-primary"></div>
                        </div>
                        <p className="mt-2 text-xs text-muted text-right">35% Utilized</p>
                    </div>
                </div>

                {/* 3. OPERATIONAL DETAILS (Tabs/Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LABOUR DETAILS */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2"><Users size={18} className="text-primary" /> Labour Force</h3>
                            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm p-2 bg-surface rounded">
                                <span className="text-muted">Skilled</span>
                                <span className="font-semibold text-foreground">12 Present</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 bg-surface rounded">
                                <span className="text-muted">Unskilled</span>
                                <span className="font-semibold text-foreground">25 Present</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 bg-surface rounded">
                                <span className="text-muted">Supervisors</span>
                                <span className="font-semibold text-foreground">2 Present</span>
                            </div>
                        </div>
                    </div>

                    {/* MATERIAL DETAILS */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2"><Package size={18} className="text-orange-400" /> Materials</h3>
                            <span className="text-xs bg-surface text-muted px-2 py-1 rounded">Today's Inward</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm p-2 border-l-2 border-primary pl-3">
                                <span className="text-foreground">Cement Bags</span>
                                <span className="font-mono text-muted">50 Nos</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 border-l-2 border-blue-500 pl-3">
                                <span className="text-foreground">Steel (12mm)</span>
                                <span className="font-mono text-muted">2.5 Tons</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 border-l-2 border-purple-500 pl-3">
                                <span className="text-foreground">M-Sand</span>
                                <span className="font-mono text-muted">3 Units</span>
                            </div>
                        </div>
                    </div>

                    {/* SITE ISSUES */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Critical Issues</h3>
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">2 Open</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-surface rounded-lg border border-gray-700">
                                <p className="text-sm font-medium text-red-400">Material Shortage</p>
                                <p className="text-xs text-muted mt-1">Cement stock critical. Need urgent order.</p>
                            </div>
                            <div className="p-3 bg-surface rounded-lg border border-gray-700">
                                <p className="text-sm font-medium text-warning">Machinery Breakdown</p>
                                <p className="text-xs text-muted mt-1">Mixer machine maintenance required.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // --- PM VIEW ---
    if (userRole === "Project Manager") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            <span>/</span>
                            <span>{site.name}</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold text-foreground">Site Work Entry Review</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/sites/${id}/reports`}
                            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-800 transition-colors"
                        >
                            <FileText size={18} />
                            Generate Report
                        </Link>
                        {report.status === "Approved" ? (
                            <div className="flex items-center gap-2 rounded-lg bg-success/20 px-4 py-2 text-sm font-semibold text-success border border-success/30">
                                <CheckCircle size={18} />
                                Approved
                            </div>
                        ) : (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                                        >
                                            <Save size={18} />
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-800"
                                        >
                                            <Edit size={18} />
                                            Customize Data
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:bg-success/90"
                                        >
                                            <CheckCircle size={18} />
                                            Approve Entry
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Engineer & Attendance */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Users className="text-primary" size={20} />
                            Site Engineer Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-700 pb-2">
                                <span className="text-muted">Name</span>
                                <span className="font-medium text-foreground">{report.engineerName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted">Attendance</span>
                                {isEditing ? (
                                    <select
                                        className="rounded border border-gray-600 bg-surface px-2 py-1 text-sm text-foreground"
                                        value={report.engineerAttendance}
                                        onChange={(e) => setReport({ ...report, engineerAttendance: e.target.value as any })}
                                    >
                                        <option>Present</option>
                                        <option>Absent</option>
                                        <option>Half Day</option>
                                    </select>
                                ) : (
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${report.engineerAttendance === 'Present' ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'
                                        }`}>
                                        {report.engineerAttendance}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <DollarSign className="text-warning" size={20} />
                            Financial Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-muted">Labor Cost</span>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        className="w-32 rounded border border-gray-600 bg-surface px-2 py-1 text-right text-sm text-foreground"
                                        value={report.laborCost}
                                        onChange={(e) => setReport({ ...report, laborCost: Number(e.target.value) })}
                                    />
                                ) : (
                                    <span className="font-medium text-foreground">₹{report.laborCost.toLocaleString()}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-muted">Petty Cash Spend</span>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        className="w-32 rounded border border-gray-600 bg-surface px-2 py-1 text-right text-sm text-foreground"
                                        value={report.pettyCashSpend}
                                        onChange={(e) => setReport({ ...report, pettyCashSpend: Number(e.target.value) })}
                                    />
                                ) : (
                                    <span className="font-medium text-foreground">₹{report.pettyCashSpend.toLocaleString()}</span>
                                )}
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="font-semibold text-foreground">Total Cost per Day</span>
                                <span className="text-xl font-bold text-primary">₹{totalCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Material In / Out */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Package className="text-blue-400" size={20} />
                            Material Log
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-muted uppercase">In (Received)</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                                    {report.materialIn.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-muted uppercase">Out (Used)</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                                    {report.materialOut.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {isEditing && <p className="mt-4 text-xs text-muted italic">Material editing specific UI would go here (adding/removing items).</p>}
                    </div>

                    {/* Extras & Details */}
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Activity className="text-purple-400" size={20} />
                            Additional Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-sm text-muted mb-1">Extra Materials Required</span>
                                <div className="rounded bg-surface p-2 text-sm text-foreground">
                                    {report.extraMaterials.length > 0 ? report.extraMaterials.join(", ") : "None"}
                                </div>
                            </div>
                            <div>
                                <span className="block text-sm text-muted mb-1">Petty Cash Details</span>
                                {isEditing ? (
                                    <textarea
                                        className="w-full rounded border border-gray-600 bg-surface px-2 py-1 text-sm text-foreground"
                                        value={report.pettyCashDetails}
                                        onChange={(e) => setReport({ ...report, pettyCashDetails: e.target.value })}
                                    />
                                ) : (
                                    <div className="rounded bg-surface p-2 text-sm text-foreground">
                                        {report.pettyCashDetails}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. REAL-TIME ATTENDANCE LOG (For PM) */}
                        <div className="rounded-xl border border-gray-700 bg-panel p-6 mt-6">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                <Clock className="text-blue-400" size={20} />
                                Real-Time Site Attendance
                            </h3>

                            {loadingAttendance ? (
                                <div className="text-center py-4 text-muted">Loading attendance data...</div>
                            ) : siteAttendance.length === 0 ? (
                                <div className="text-center py-8 text-muted border border-dashed border-gray-700 rounded-lg">
                                    No attendance records found for this site today.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-surface text-muted">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Engineer</th>
                                                <th className="px-4 py-3 font-medium">Role</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium">Check In</th>
                                                <th className="px-4 py-3 font-medium">Check Out</th>
                                                <th className="px-4 py-3 font-medium">Geotag</th>
                                                <th className="px-4 py-3 font-medium">Approval</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {siteAttendance.map((log) => (
                                                <tr key={log._id}>
                                                    <td className="px-4 py-3 font-medium text-foreground">{log.employeeName}</td>
                                                    <td className="px-4 py-3 text-muted">{log.role}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${log.status === 'checked-in' ? 'bg-green-500/10 text-green-500' : 'bg-gray-700 text-gray-300'
                                                            }`}>
                                                            {log.status === 'checked-in' ? 'On Site' : 'Checked Out'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted">{new Date(log.checkInTime).toLocaleTimeString()}</td>
                                                    <td className="px-4 py-3 text-muted">
                                                        {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {log.inTimePhoto ? (
                                                            <a href={log.inTimePhoto} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                                <MapPin size={14} /> View
                                                            </a>
                                                        ) : <span className="text-muted">-</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {log.approvalStatus === 'pending' ? (
                                                            <button
                                                                onClick={() => handleApproveAttendance(log._id)}
                                                                className="px-3 py-1 bg-primary text-black rounded text-xs font-bold hover:bg-primary/90"
                                                            >
                                                                Approve
                                                            </button>
                                                        ) : (
                                                            <span className={`text-xs font-semibold ${log.approvalStatus === 'approved' ? 'text-success' : 'text-red-500'
                                                                }`}>
                                                                {log.approvalStatus.toUpperCase()}
                                                            </span>
                                                        )}
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
            </div>
        );
    }

    // --- DEFAULT / ENGINEER VIEW ---
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Info Bar */}
            <div className="flex flex-col gap-4">
                <Link href="/sites" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Sites
                </Link>

                {/* Requested Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Project Engineer</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <HardHat size={18} className="text-primary" />
                            {site.projectEngineer}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Site Name</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <MapPin size={18} className="text-primary" />
                            {site.name}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Date / Day</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Calendar size={18} className="text-primary" />
                            {currentDate}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Site Engineer</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Users size={18} className="text-primary" />
                            {site.manager}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">

                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Site Overview</h2>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${site.status === 'Active' ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-300'
                                }`}>
                                {site.status}
                            </span>
                        </div>
                        <p className="text-muted">{site.description}</p>

                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Overall Progress</span>
                                <span className="font-semibold text-foreground">{site.progress}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${site.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-700 bg-panel p-6 flex flex-col gap-2">
                            <Calendar className="text-primary h-8 w-8 mb-2" />
                            <span className="text-muted text-sm">Start Date</span>
                            <span className="text-xl font-bold text-foreground">{site.startDate}</span>
                        </div>
                        <div className="rounded-xl border border-gray-700 bg-panel p-6 flex flex-col gap-2">
                            <Activity className="text-success h-8 w-8 mb-2" />
                            <span className="text-muted text-sm">Status</span>
                            <span className="text-xl font-bold text-foreground">On Schedule</span>
                        </div>
                    </div>
                </div>



                {/* 4. REAL-TIME ATTENDANCE LOG (For PM) */}
                <div className="rounded-xl border border-gray-700 bg-panel p-6 mt-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Clock className="text-blue-400" size={20} />
                        Real-Time Site Attendance
                    </h3>

                    {loadingAttendance ? (
                        <div className="text-center py-4 text-muted">Loading attendance data...</div>
                    ) : siteAttendance.length === 0 ? (
                        <div className="text-center py-8 text-muted border border-dashed border-gray-700 rounded-lg">
                            No attendance records found for this site today.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Engineer</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Check In</th>
                                        <th className="px-4 py-3 font-medium">Check Out</th>
                                        <th className="px-4 py-3 font-medium">Geotag</th>
                                        <th className="px-4 py-3 font-medium">Approval</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {siteAttendance.map((log) => (
                                        <tr key={log._id}>
                                            <td className="px-4 py-3 font-medium text-foreground">{log.employeeName}</td>
                                            <td className="px-4 py-3 text-muted">{log.role}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${log.status === 'checked-in' ? 'bg-green-500/10 text-green-500' : 'bg-gray-700 text-gray-300'
                                                    }`}>
                                                    {log.status === 'checked-in' ? 'On Site' : 'Checked Out'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted">{new Date(log.checkInTime).toLocaleTimeString()}</td>
                                            <td className="px-4 py-3 text-muted">
                                                {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.inTimePhoto ? (
                                                    <a href={log.inTimePhoto} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                        <MapPin size={14} /> View
                                                    </a>
                                                ) : <span className="text-muted">-</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {log.approvalStatus === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApproveAttendance(log._id)}
                                                            className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-bold hover:bg-primary/30 flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectAttendance(log._id)}
                                                            className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-bold hover:bg-red-500/30 flex items-center gap-1"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.approvalStatus === 'approved' ? 'bg-[#d1fae5] text-black' :
                                                        log.approvalStatus === 'rejected' ? 'bg-[#fee2e2] text-black' :
                                                            'bg-[#fef3c7] text-black'
                                                        }`}>
                                                        {log.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
                <div className="rounded-xl border border-gray-700 bg-panel p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                        <Package size={18} />
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        <Link
                            href={`/sites/${site.id}/labor`}
                            className="flex w-full items-center justify-center gap-2 py-2 bg-primary rounded-lg text-sm text-black font-semibold hover:bg-primary-hover transition-colors"
                        >
                            <Users size={16} />
                            Manage General Labour
                        </Link>
                        <Link
                            href={`/sites/${site.id}/skilled-labor`}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            <HardHat size={24} />
                            Manage Skilled Workers
                        </Link>

                        <Link
                            href={`/sites/${site.id}/materials`}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            <Package size={24} />
                            Manage Materials
                        </Link>

                        <Link
                            href={`/sites/${site.id}/petty-cash`}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            <Users size={24} className="hidden" /> {/* Placeholder for layout alignment if needed, or use specific icon */}
                            <div className="flex flex-col items-center">
                                <div className="mb-1 rounded-full bg-primary/20 p-2 text-primary">
                                    <div className="h-6 w-6 font-bold flex items-center justify-center">₹</div>
                                </div>
                                Petty Cash / Allowance
                            </div>
                        </Link>

                        <Link
                            href={`/sites/${site.id}/issues`}
                            className="flex items-center justify-center gap-2 rounded-lg border border-red-900/50 p-4 text-center font-semibold text-red-400 transition-colors hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                            <div className="flex flex-col items-center">
                                <Activity size={24} className="mb-1" />
                                Report Site Issue
                            </div>
                        </Link>

                        <Link
                            href={`/sites/${site.id}/reports`}
                            className="flex items-center justify-center gap-2 rounded-lg bg-surface border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            <div className="flex flex-col items-center">
                                <Activity size={24} className="mb-1 hidden" />
                                {/* Reusing Activity temporarily or import FileText if available. Let's use Calendar for now if FileText isn't imported, or add FileText to import */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                                Generate Site Report
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

    );
}
