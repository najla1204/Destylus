"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface LeaveRequest {
    id: string;
    date: string;
    type: "Sick Leave" | "Casual Leave" | "Emergency";
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
}

const initialRequests: LeaveRequest[] = [
    { id: "1", date: "2024-03-10", type: "Casual Leave", reason: "Personal work", status: "Approved" },
];

export default function LeaveRequestPage() {
    const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [date, setDate] = useState("");
    const [type, setType] = useState<LeaveRequest["type"]>("Casual Leave");
    const [reason, setReason] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRequest: LeaveRequest = {
            id: Date.now().toString(),
            date,
            type,
            reason,
            status: "Pending"
        };
        setRequests([newRequest, ...requests]);
        setShowForm(false);
        setDate("");
        setReason("");
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-700 pb-6">
                <Link
                    href="/attendance"
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Attendance
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
                        <p className="text-muted">Submit and track your leave applications.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-panel border border-gray-700 rounded-xl p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">New Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-foreground"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Leave Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as LeaveRequest["type"])}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-foreground"
                                >
                                    <option>Casual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Emergency</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Reason</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Brief reason for leave..."
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-foreground min-h-[100px]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">Request History</h2>
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-muted border border-dashed border-gray-700 rounded-xl">
                            No leave requests found.
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="bg-panel border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-500 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg text-foreground">{req.date}</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-muted border border-gray-700">
                                            {req.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">{req.reason}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-sm font-bold border flex items-center gap-2
                                    ${req.status === 'Approved' ? 'bg-success/10 text-success border-success/20' :
                                        req.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'}`
                                }>
                                    {req.status === 'Approved' ? <CheckCircle size={14} /> :
                                        req.status === 'Pending' ? <Clock size={14} /> : <AlertCircle size={14} />}
                                    {req.status}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
