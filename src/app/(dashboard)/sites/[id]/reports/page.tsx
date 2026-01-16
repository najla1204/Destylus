"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Download, Printer, Share2, Package, AlertTriangle, Users } from "lucide-react";

interface ReportEntry {
    id: string;
    date: string;
    engineer: string;
    laborCost: number;
    materialCost: number;
    pettyCash: number;
    status: "Approved" | "Pending";
}

interface MaterialEntry {
    id: string;
    date: string;
    materialName: string;
    quantity: string;
    action: "Received" | "Used";
    engineer: string;
}

interface IssueEntry {
    id: string;
    date: string;
    description: string;
    severity: "Low" | "Medium" | "High";
    status: "Open" | "Resolved";
    reportedBy: string;
}

interface AttendanceEntry {
    date: string;
    presentCount: number;
    absentCount: number;
}

// --- MASTER MOCK DATA (Database) ---
const ALL_REPORT_ENTRIES: ReportEntry[] = [
    { id: "1", date: "2026-01-01", engineer: "John Doe", laborCost: 12000, materialCost: 5000, pettyCash: 1000, status: "Approved" },
    { id: "2", date: "2026-01-05", engineer: "Alex Smith", laborCost: 14000, materialCost: 8000, pettyCash: 1500, status: "Approved" },
    { id: "3", date: "2026-01-10", engineer: "John Doe", laborCost: 15000, materialCost: 45000, pettyCash: 2000, status: "Approved" },
    { id: "4", date: "2026-01-11", engineer: "John Doe", laborCost: 14500, materialCost: 12000, pettyCash: 1500, status: "Approved" },
    { id: "5", date: "2026-01-12", engineer: "Alex Smith", laborCost: 16000, materialCost: 30000, pettyCash: 3000, status: "Approved" },
    { id: "6", date: "2026-01-13", engineer: "John Doe", laborCost: 15500, materialCost: 5000, pettyCash: 1000, status: "Approved" },
    { id: "7", date: "2026-01-14", engineer: "John Doe", laborCost: 15000, materialCost: 0, pettyCash: 5000, status: "Approved" },
    { id: "8", date: "2026-01-20", engineer: "Alex Smith", laborCost: 16500, materialCost: 2000, pettyCash: 1000, status: "Approved" },
];

const ALL_MATERIALS: MaterialEntry[] = [
    { id: "1", date: "2026-01-01", materialName: "Bricks", quantity: "1000 pcs", action: "Received", engineer: "John Doe" },
    { id: "2", date: "2026-01-10", materialName: "Cement Bags", quantity: "50 Bags", action: "Received", engineer: "John Doe" },
    { id: "3", date: "2026-01-10", materialName: "Sand", quantity: "2 Trucks", action: "Received", engineer: "John Doe" },
    { id: "4", date: "2026-01-12", materialName: "Cement Bags", quantity: "20 Bags", action: "Used", engineer: "Alex Smith" },
    { id: "5", date: "2026-01-14", materialName: "Steel Rods", quantity: "500 kg", action: "Received", engineer: "John Doe" },
    { id: "6", date: "2026-01-20", materialName: "Paint", quantity: "50 L", action: "Received", engineer: "Alex Smith" },
];

const ALL_ISSUES: IssueEntry[] = [
    { id: "1", date: "2026-01-05", description: "Worker injury (minor).", severity: "Medium", status: "Resolved", reportedBy: "Alex Smith" },
    { id: "2", date: "2026-01-11", description: "Water supply interruption due to pipe burst.", severity: "High", status: "Resolved", reportedBy: "John Doe" },
    { id: "3", date: "2026-01-13", description: "Minor delay in material delivery.", severity: "Low", status: "Open", reportedBy: "Alex Smith" },
];

const ALL_ATTENDANCE: AttendanceEntry[] = [
    { date: "2026-01-01", presentCount: 40, absentCount: 5 },
    { date: "2026-01-05", presentCount: 42, absentCount: 3 },
    { date: "2026-01-10", presentCount: 45, absentCount: 2 },
    { date: "2026-01-11", presentCount: 44, absentCount: 3 },
    { date: "2026-01-12", presentCount: 46, absentCount: 1 },
    { date: "2026-01-13", presentCount: 45, absentCount: 2 },
    { date: "2026-01-14", presentCount: 45, absentCount: 2 },
    { date: "2026-01-20", presentCount: 47, absentCount: 1 },
];

export default function SiteReportsPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>("");

    // State
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);

    // Data State (Filtered)
    const [reportData, setReportData] = useState<ReportEntry[]>([]);
    const [materialData, setMaterialData] = useState<MaterialEntry[]>([]);
    const [issueData, setIssueData] = useState<IssueEntry[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.id);
        };
        resolveParams();

        // Set default dates (Current Month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, [params]);

    const handleGenerate = () => {
        if (!startDate || !endDate) return;

        // FILTER Logic
        const filterByDate = (dateStr: string) => {
            return dateStr >= startDate && dateStr <= endDate;
        };

        setReportData(ALL_REPORT_ENTRIES.filter(e => filterByDate(e.date)));
        setMaterialData(ALL_MATERIALS.filter(e => filterByDate(e.date)));
        setIssueData(ALL_ISSUES.filter(e => filterByDate(e.date)));
        setAttendanceData(ALL_ATTENDANCE.filter(e => filterByDate(e.date)));

        setIsGenerated(true);
    };

    const handleDownloadCSV = () => {
        // Simple CSV generation for Expenses (uses currently filtered reportData)
        const headers = ["Date", "Engineer", "Labor Cost", "Material Cost (Est)", "Petty Cash", "Total"];
        const rows = reportData.map(entry => [
            entry.date,
            entry.engineer,
            entry.laborCost,
            entry.materialCost,
            entry.pettyCash,
            entry.laborCost + entry.materialCost + entry.pettyCash
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `expense_sheet_${id}_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        alert("Report shared successfully via Email/WhatsApp (Integration Pending)");
    };

    // Calculations
    const totalLabor = reportData.reduce((acc, curr) => acc + curr.laborCost, 0);
    const totalMaterial = reportData.reduce((acc, curr) => acc + curr.materialCost, 0);
    const totalPetty = reportData.reduce((acc, curr) => acc + curr.pettyCash, 0);
    const grandTotal = totalLabor + totalMaterial + totalPetty;

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header (Hidden in Print) */}
            <div className="flex flex-col gap-4 print:hidden">
                <Link href={`/sites/${id}`} className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Site Details
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-foreground">Generate Site Report</h1>
                </div>
            </div>

            {/* Controls (Hidden in Print) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 print:hidden">
                <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold text-foreground flex items-center gap-2">
                        <Calendar size={18} className="text-primary" />
                        Select Date Range
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">From Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">To Date</label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-gray-700 bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            {isGenerated && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                    {/* Actions Bar */}
                    <div className="flex items-center justify-end gap-3 print:hidden border-b border-gray-700 pb-4">
                        <button
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
                        >
                            <Download size={16} />
                            Download Expense Sheet (CSV)
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
                        >
                            <Printer size={16} />
                            Print / PDF
                        </button>
                    </div>

                    {/* Printable Document */}
                    <div className="rounded-xl border border-gray-700 bg-white text-black p-8 shadow-sm overflow-hidden min-h-[1000px] print:min-h-0 print:shadow-none print:border-none print:p-0" id="printable-area">

                        {/* Report Header */}
                        <div className="mb-8 border-b border-gray-200 pb-6 print:break-inside-avoid">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Project Status Report</h1>
                                    <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lg text-gray-900">Destylus Construction</p>
                                    <p className="text-sm text-gray-500">Site ID: {id}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-8">
                                <div>
                                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold">From Date</span>
                                    <span className="font-medium text-gray-900">{startDate}</span>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold">To Date</span>
                                    <span className="font-medium text-gray-900">{endDate}</span>
                                </div>
                            </div>
                        </div>

                        {reportData.length === 0 && materialData.length === 0 && issueData.length === 0 && attendanceData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No activities found for this date range.
                            </div>
                        ) : (
                            <>
                                {/* SECTION 1: FINANCIAL SUMMARY */}
                                <div className="mb-12 print:break-inside-avoid">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        1. Financial Executive Summary
                                    </h2>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Total Labor</span>
                                            <p className="text-xl font-bold text-gray-900">₹{totalLabor.toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Material Est.</span>
                                            <p className="text-xl font-bold text-gray-900">₹{totalMaterial.toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Petty Cash</span>
                                            <p className="text-xl font-bold text-gray-900">₹{totalPetty.toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                                            <span className="text-xs font-semibold text-primary uppercase">Grand Total</span>
                                            <p className="text-xl font-bold text-primary">₹{grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Expense Table */}
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detailed Expense Sheet</h3>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Date</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Engineer</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900 text-right">Labor</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900 text-right">Material (Est)</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900 text-right">Petty Cash</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {reportData.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td className="px-4 py-2 text-gray-700">{entry.date}</td>
                                                        <td className="px-4 py-2 text-gray-700">{entry.engineer}</td>
                                                        <td className="px-4 py-2 text-gray-900 text-right font-medium">₹{entry.laborCost.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-gray-900 text-right font-medium">₹{entry.materialCost.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-gray-900 text-right font-medium">₹{entry.pettyCash.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-gray-900 text-right font-bold">
                                                            ₹{(entry.laborCost + entry.materialCost + entry.pettyCash).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SECTION 2: MATERIAL ACTIVITY */}
                                <div className="mb-12 print:break-inside-avoid">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <Package size={20} className="text-gray-500" />
                                        2. Material Activity Log
                                    </h2>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Date</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Material</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Action</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Quantity</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Engineer</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {materialData.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td className="px-4 py-2 text-gray-700">{entry.date}</td>
                                                        <td className="px-4 py-2 text-gray-900 font-medium">{entry.materialName}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${entry.action === "Received" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                                }`}>
                                                                {entry.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700">{entry.quantity}</td>
                                                        <td className="px-4 py-2 text-gray-700">{entry.engineer}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SECTION 3: SITE ISSUES */}
                                <div className="mb-12 print:break-inside-avoid">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <AlertTriangle size={20} className="text-gray-500" />
                                        3. Reported Issues & Incidents
                                    </h2>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Date</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Severity</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Description</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Status</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-900">Reported By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {issueData.map((entry) => (
                                                    <tr key={entry.id}>
                                                        <td className="px-4 py-2 text-gray-700">{entry.date}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${entry.severity === "High" ? "bg-red-100 text-red-700" :
                                                                entry.severity === "Medium" ? "bg-amber-100 text-amber-700" :
                                                                    "bg-gray-100 text-gray-600"
                                                                }`}>
                                                                {entry.severity}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-700 max-w-xs">{entry.description}</td>
                                                        <td className="px-4 py-2 text-gray-700">{entry.status}</td>
                                                        <td className="px-4 py-2 text-gray-700">{entry.reportedBy}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SECTION 4: ATTENDANCE */}
                                <div className="mb-12 print:break-inside-avoid">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <Users size={20} className="text-gray-500" />
                                        4. Daily Workforce Attendance
                                    </h2>
                                    <div className="grid grid-cols-5 gap-4">
                                        {attendanceData.map((entry) => (
                                            <div key={entry.date} className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-center">
                                                <p className="text-xs text-gray-500 font-semibold">{entry.date}</p>
                                                <div className="mt-2 flex justify-center gap-4 text-sm">
                                                    <span className="text-green-600 font-bold" title="Present">P: {entry.presentCount}</span>
                                                    <span className="text-red-500 font-bold" title="Absent">A: {entry.absentCount}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Footer / Approval Sig */}
                        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-end print:break-inside-avoid">
                            <div className="text-xs text-gray-400">
                                <p>Report generated by CivilERP System</p>
                                <p>This document is confidential.</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-48 border-b border-gray-300"></div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Project Manager Signature</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
