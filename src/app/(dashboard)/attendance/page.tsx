"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Fingerprint, Camera, CheckCircle2 } from "lucide-react";

type AttendanceState = "idle" | "checked-in" | "checked-out";

export default function AttendancePage() {
    const [status, setStatus] = useState<AttendanceState>("idle");
    const [inTime, setInTime] = useState<string | null>(null);
    const [outTime, setOutTime] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showGeoTagMessage, setShowGeoTagMessage] = useState(false);

    // Hardcoded for demo purposes as per current requirements
    const employeeDetails = {
        name: "John Engineer",
        id: "ENG-2024-001",
        role: "Senior Civil Engineer",
    };

    const handleMarkAttendance = (type: "in" | "out") => {
        setIsCapturing(true);
        setShowGeoTagMessage(false);

        // Simulate Geo-tag and Photo Capture Delay
        setTimeout(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            if (type === "in") {
                setInTime(timeString);
                setStatus("checked-in");
            } else {
                setOutTime(timeString);
                setStatus("checked-out");
            }

            setIsCapturing(false);
            setShowGeoTagMessage(true);

            // Hide the success message after a few seconds
            setTimeout(() => setShowGeoTagMessage(false), 3000);
        }, 2000);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">Engineer Attendance</h1>
                <p className="text-muted">Daily check-in and check-out management.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Employee Profile Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                                {employeeDetails.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {employeeDetails.name}
                                </h2>
                                <p className="text-sm font-medium text-gray-500">
                                    {employeeDetails.role}
                                </p>
                                <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                    <Fingerprint size={14} />
                                    ID: {employeeDetails.id}
                                </div>
                            </div>
                        </div>
                        <div
                            className={`rounded-full px-3 py-1 text-sm font-medium ${status === "checked-in"
                                ? "bg-green-100 text-green-700"
                                : status === "checked-out"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {status === "checked-in"
                                ? "On Duty"
                                : status === "checked-out"
                                    ? "Shift Ended"
                                    : "Not Checked In"}
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-medium text-gray-500">Today's Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                                    <Clock size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">In Time</span>
                            </div>
                            <span className="font-mono text-lg font-bold text-gray-900">{inTime || "--:--"}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                                    <Clock size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Out Time</span>
                            </div>
                            <span className="font-mono text-lg font-bold text-gray-900">{outTime || "--:--"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">

                {isCapturing ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-pulse">
                        <div className="mb-4 rounded-full bg-blue-50 p-4">
                            <Camera className="h-10 w-10 text-blue-600 animate-bounce" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Capturing Geo-tag Photo...</h3>
                        <p className="text-gray-500">Please wait while we verify your location.</p>
                    </div>
                ) : showGeoTagMessage ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-4 rounded-full bg-green-50 p-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Geo-tag Photo Captured!</h3>
                        <p className="text-green-600 font-medium">Attendance marked successfully.</p>
                    </div>
                ) : (
                    <div className="py-4">
                        {status === "idle" && (
                            <div className="flex flex-col items-center">
                                <MapPin className="mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Ready to Start?</h3>
                                <p className="mb-6 max-w-xs text-sm text-gray-500">
                                    Your location and a photo will be captured to verify your attendance.
                                </p>
                                <button
                                    onClick={() => handleMarkAttendance("in")}
                                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Mark In-Time
                                </button>
                            </div>
                        )}

                        {status === "checked-in" && (
                            <div className="flex flex-col items-center">
                                <MapPin className="mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Shift in Progress</h3>
                                <p className="mb-6 max-w-xs text-sm text-gray-500">
                                    You are currently checked in. Click below when you are ready to end your shift.
                                </p>
                                <button
                                    onClick={() => handleMarkAttendance("out")}
                                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Mark Out-Time
                                </button>
                            </div>
                        )}

                        {status === "checked-out" && (
                            <div className="flex flex-col items-center py-4">
                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                    <CheckCircle2 className="h-8 w-8 text-gray-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Shift Completed</h3>
                                <p className="text-sm text-gray-500">You have successfully logged out for today.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/attendance/timesheet"
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Timesheet & Hours</h3>
                        <p className="text-xs text-gray-500">View calendar and log daily working hours</p>
                    </div>
                </Link>

                <Link
                    href="/leave"
                    className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Fingerprint size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Leave Requests</h3>
                        <p className="text-xs text-gray-500">Apply for casual, sick, or emergency leave</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
