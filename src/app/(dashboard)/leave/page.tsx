"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle, User, Briefcase } from "lucide-react";

// Mock Data for HR View
const MOCK_LEAVE_REQUESTS = [
    { id: 1, name: "Robert Fox", role: "Project Manager", type: "Sick Leave", from: "2026-01-20", to: "2026-01-22", reason: "Viral Fever", status: "Pending" },
    { id: 2, name: "John Doe", role: "Site Engineer", type: "Casual Leave", from: "2026-01-18", to: "2026-01-19", reason: "Family Function", status: "Pending" },
    { id: 3, name: "Sarah Connor", role: "Safety Officer", type: "Emergency", from: "2026-01-15", to: "2026-01-15", reason: "Medical Emergency", status: "Approved" },
];

export default function LeavePage() {
    const [userRole, setUserRole] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [requests, setRequests] = useState(MOCK_LEAVE_REQUESTS);

    // Existing "Apply" State
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "Engineer";
        setUserRole(role);

        const savedLeaves = localStorage.getItem("destylus_dashboard_leaves_v2");
        if (savedLeaves) {
            setRequests(JSON.parse(savedLeaves));
        } else {
            localStorage.setItem("destylus_dashboard_leaves_v2", JSON.stringify(MOCK_LEAVE_REQUESTS));
        }
    }, []);

    const handleAction = (id: number, status: string) => {
        const updated = requests.map(req => req.id === id ? { ...req, status } : req);
        setRequests(updated);
        localStorage.setItem("destylus_dashboard_leaves_v2", JSON.stringify(updated));
    };

    const handleSubmitApplication = (e: React.FormEvent) => {
        e.preventDefault();
        const userName = localStorage.getItem("userName") || "New User";
        const role = localStorage.getItem("userRole") || "Engineer";

        const newRequest = {
            id: Date.now(),
            name: userName,
            role: role,
            type: leaveType,
            from: startDate,
            to: endDate,
            reason: reason,
            status: "Pending"
        };

        const updated = [newRequest, ...requests];
        setRequests(updated);
        localStorage.setItem("destylus_dashboard_leaves_v2", JSON.stringify(updated));
        setIsSubmitted(true);
    };

    // --- HR VIEW ---
    if (userRole === "HR Manager") {
        const displayedRequests = activeTab === "pending"
            ? requests.filter(r => r.status === "Pending")
            : requests.filter(r => r.status !== "Pending");

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
                    <p className="text-muted">Manage and verify leave applications.</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
                    >
                        Pending Requests <span className="ml-2 rounded-lg bg-primary/20 text-primary px-2 py-0.5 text-xs">{requests.filter(r => r.status === "Pending").length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
                    >
                        History
                    </button>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {displayedRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted bg-panel rounded-xl border border-gray-700">
                            <CheckCircle size={48} className="mx-auto mb-4 text-green-500/50" />
                            <p>No requests found in this category.</p>
                        </div>
                    ) : (
                        displayedRequests.map((req) => (
                            <div key={req.id} className="bg-panel border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`h-12 w-12 rounded-full border flex items-center justify-center text-lg font-bold text-black
                                        ${req.role === 'Project Manager' ? 'bg-orange-300 border-orange-400/20' : 'bg-orange-100 border-orange-200'}`}>
                                        {req.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{req.name}</h3>
                                        <p className="text-sm text-muted flex items-center gap-2">
                                            {req.role} <span className="w-1 h-1 rounded-full bg-gray-500"></span> {req.type}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-foreground bg-surface px-2 py-1 rounded">
                                                <Calendar size={14} className="text-primary" />
                                                <span>{req.from}</span> <span className="text-muted">to</span> <span>{req.to}</span>
                                            </div>
                                            <div className="text-muted italic">"{req.reason}"</div>
                                        </div>
                                    </div>
                                </div>

                                {req.status === "Pending" ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction(req.id, "Rejected")}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(req.id, "Approved")}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 rounded-lg text-sm font-medium border ${req.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // --- ENGINEER / PM VIEW (Apply) ---
    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Application Submitted</h1>
                <p className="text-muted mt-2">Your leave request has been sent for approval.</p>
                <button onClick={() => setIsSubmitted(false)} className="mt-8 text-primary hover:underline">Submit Another Request</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Apply for Leave</h1>
                <p className="text-muted">Submit your leave application for approval.</p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-6 bg-panel border border-gray-700 rounded-xl p-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Leave Type</label>
                    <select
                        className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                    >
                        <option>Casual Leave</option>
                        <option>Sick Leave</option>
                        <option>Emergency Leave</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">From Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">To Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Reason</label>
                    <textarea
                        required
                        className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none h-32 resize-none"
                        placeholder="Please describe the reason for your leave..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex items-center gap-2 text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <AlertCircle size={16} />
                    <span>Your PM/HR will review the application.</span>
                </div>

                <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
                    Submit Application
                </button>
            </form>
        </div>
    );
}
