"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function MonthlyAttendancePage() {
    // Mock Month: Jan 2026
    const daysInMonth = 31;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Monthly Attendance</h1>
                    <p className="text-muted">January 2026</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg border border-gray-700 bg-panel hover:bg-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 rounded-lg border border-gray-700 bg-panel hover:bg-gray-700">
                        <ChevronRight size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black font-bold text-sm">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-panel p-4 rounded-xl border border-gray-700">
                    <span className="text-muted text-xs uppercase">Present</span>
                    <p className="text-2xl font-bold text-success">24 Days</p>
                </div>
                <div className="bg-panel p-4 rounded-xl border border-gray-700">
                    <span className="text-muted text-xs uppercase">Absent</span>
                    <p className="text-2xl font-bold text-red-400">01 Day</p>
                </div>
                <div className="bg-panel p-4 rounded-xl border border-gray-700">
                    <span className="text-muted text-xs uppercase">Leaves</span>
                    <p className="text-2xl font-bold text-orange-400">02 Days</p>
                </div>
                <div className="bg-panel p-4 rounded-xl border border-gray-700">
                    <span className="text-muted text-xs uppercase">Overtime</span>
                    <p className="text-2xl font-bold text-blue-400">12 Hrs</p>
                </div>
            </div>

            {/* Calendar Grid Mock */}
            <div className="bg-panel rounded-xl border border-gray-700 p-6">
                <h3 className="font-bold text-foreground mb-4">Daily Logs</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-muted uppercase">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty Start Days (Assume Jan 1 starts on Thu for mock) */}
                    <div className="h-24 rounded-lg bg-surface/50"></div>
                    <div className="h-24 rounded-lg bg-surface/50"></div>
                    <div className="h-24 rounded-lg bg-surface/50"></div>
                    <div className="h-24 rounded-lg bg-surface/50"></div>

                    {days.map(d => {
                        const isWeekend = (d + 4) % 7 === 0 || (d + 4) % 7 === 6; // Rough Calc
                        const status = isWeekend ? "Off" : "Present";
                        return (
                            <div key={d} className={`h-24 p-2 rounded-lg border border-gray-700 flex flex-col justify-between ${isWeekend ? 'bg-surface/30' : 'bg-surface'}`}>
                                <span className={`text-right font-medium ${isWeekend ? 'text-red-400' : 'text-foreground'}`}>{d}</span>
                                {status === "Present" && (
                                    <span className="text-xs bg-green-500/10 text-green-500 px-1 py-0.5 rounded text-center">9h 00m</span>
                                )}
                                {status === "Off" && (
                                    <span className="text-xs text-muted text-center">-</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
