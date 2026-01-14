"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Clock, FileText, Briefcase, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock Data Type
interface Employee {
    id: string;
    name: string;
    role: string;
    site: string;
    status: "Active" | "Inactive";
    phone: string;
    email: string;
    joinDate: string;
    employeeId: string;
    reportingManager: string;
}

const MOCK_EMPLOYEES: Record<string, Employee> = {
    "1": {
        id: "1", name: "John Doe", role: "Site Engineer", site: "Metro Station Beta",
        status: "Active", phone: "+91 98765 43210", email: "john.doe@destylus.com",
        joinDate: "2023-05-15", employeeId: "EMP001", reportingManager: "Robert Fox"
    },
    "2": {
        id: "2", name: "Alex Smith", role: "Senior Engineer", site: "Skyline Complex",
        status: "Active", phone: "+91 98765 12345", email: "alex.smith@destylus.com",
        joinDate: "2022-11-01", employeeId: "EMP002", reportingManager: "Cameron Williamson"
    },
    "3": {
        id: "3", name: "Sarah Connor", role: "Safety Officer", site: "River Bridge Expansion",
        status: "Active", phone: "+91 91234 56789", email: "sarah.c@destylus.com",
        joinDate: "2024-01-10", employeeId: "EMP003", reportingManager: "Robert Fox"
    }
};

export default function EmployeeDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        if (id && MOCK_EMPLOYEES[id]) {
            setEmployee(MOCK_EMPLOYEES[id]);
        }
    }, [id]);

    if (!employee) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-muted">
                <User size={48} className="mb-4 opacity-50" />
                <p>Employee not found</p>
                <Link href="/dashboard" className="text-primary hover:underline mt-2">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="rounded-lg p-2 text-muted hover:bg-gray-800 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Employee Profile</h1>
                    <p className="text-sm text-muted">Managing {employee.name}'s details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. PROFILE CARD */}
                <div className="rounded-xl border border-gray-700 bg-panel p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-surface border-2 border-gray-700 flex items-center justify-center mb-4">
                            <User size={40} className="text-muted" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{employee.name}</h2>
                        <p className="text-primary font-medium">{employee.role}</p>
                        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-700 text-muted'
                            }`}>
                            {employee.status}
                        </span>
                    </div>

                    <div className="mt-8 space-y-4 border-t border-gray-700 pt-6">
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase size={16} className="text-muted" />
                            <span className="text-foreground">{employee.employeeId}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={16} className="text-muted" />
                            <span className="text-foreground">{employee.site}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-muted" />
                            <span className="text-foreground">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail size={16} className="text-muted" />
                            <span className="text-foreground">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <User size={16} className="text-muted" />
                            <span className="text-foreground">Reports to: <span className="font-semibold text-primary">{employee.reportingManager}</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={16} className="text-muted" />
                            <span className="text-foreground">Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. ACTIVITY & STATS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Activity Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-700 bg-panel p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="text-blue-400" size={20} />
                                <h3 className="font-semibold text-foreground">Attendance</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">98%</p>
                            <p className="text-xs text-muted">This Month</p>
                        </div>
                        <div className="rounded-xl border border-gray-700 bg-panel p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="text-success" size={20} />
                                <h3 className="font-semibold text-foreground">Performance</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">Excellent</p>
                            <p className="text-xs text-muted">Manager Rating</p>
                        </div>
                    </div>

                    {/* Recent History Table */}
                    <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-foreground">Attendance History</h3>
                            <button className="text-xs text-primary hover:underline">Download Report</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface text-muted">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Check In</th>
                                        <th className="px-4 py-3 font-medium">Check Out</th>
                                        <th className="px-4 py-3 font-medium">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    <tr>
                                        <td className="px-4 py-3 text-foreground">Today</td>
                                        <td className="px-4 py-3 text-success">Present</td>
                                        <td className="px-4 py-3 text-muted">09:00 AM</td>
                                        <td className="px-4 py-3 text-muted">--</td>
                                        <td className="px-4 py-3 text-warning">Pending</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-foreground">Yesterday</td>
                                        <td className="px-4 py-3 text-success">Present</td>
                                        <td className="px-4 py-3 text-muted">08:55 AM</td>
                                        <td className="px-4 py-3 text-muted">06:05 PM</td>
                                        <td className="px-4 py-3 text-success">Verified</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-foreground">12 Jan 2026</td>
                                        <td className="px-4 py-3 text-success">Present</td>
                                        <td className="px-4 py-3 text-muted">09:10 AM</td>
                                        <td className="px-4 py-3 text-muted">06:00 PM</td>
                                        <td className="px-4 py-3 text-success">Verified</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 text-foreground">11 Jan 2026</td>
                                        <td className="px-4 py-3 text-muted">Weekly Off</td>
                                        <td className="px-4 py-3 text-muted">--</td>
                                        <td className="px-4 py-3 text-muted">--</td>
                                        <td className="px-4 py-3 text-muted">--</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
