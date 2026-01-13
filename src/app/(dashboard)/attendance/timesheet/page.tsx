"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle, X } from "lucide-react";

interface DailyLog {
    date: string;
    hours: number;
    isLeave: boolean;
    status: "Present" | "Leave" | "Weekend" | "Holiday";
}

// Helper to generate days for current month (Mock: March 2024 for demo)
const generateMonthDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        // Mock data logic
        const isWeekend = new Date(year, month, i).getDay() === 0; // Sunday
        days.push({
            day: i,
            date: date,
            isWeekend: isWeekend
        });
    }
    return days;
};

export default function TimesheetPage() {
    const currentYear = 2024;
    const currentMonth = 2; // March (0-indexed)
    const monthName = "March 2024";
    const days = generateMonthDays(currentYear, currentMonth);

    // Local state for logs
    const [logs, setLogs] = useState<Record<string, DailyLog>>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [hours, setHours] = useState("8");
    const [isLeave, setIsLeave] = useState(false);

    const handleDateClick = (date: string) => {
        setSelectedDate(date);
        // Load existing log if any
        if (logs[date]) {
            setHours(logs[date].hours.toString());
            setIsLeave(logs[date].isLeave);
        } else {
            setHours("8");
            setIsLeave(false);
        }
        setShowModal(true);
    };

    const handleSaveLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;

        setLogs({
            ...logs,
            [selectedDate]: {
                date: selectedDate,
                hours: isLeave ? 0 : parseFloat(hours),
                isLeave: isLeave,
                status: isLeave ? "Leave" : "Present"
            }
        });
        setShowModal(false);
    };

    // Calculate Stats
    const totalHours = Object.values(logs).reduce((sum, log) => sum + log.hours, 0);
    const daysWorked = Object.values(logs).filter(l => !l.isLeave && l.hours > 0).length;
    const leaveDays = Object.values(logs).filter(l => l.isLeave).length;

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
                        <h1 className="text-3xl font-bold text-foreground">Working Hours & Timesheet</h1>
                        <p className="text-muted">Log your daily working hours or mark leaves.</p>
                    </div>
                    {/* Stats Summary */}
                    <div className="flex gap-4">
                        <div className="bg-surface rounded-lg p-3 px-6 text-center border border-gray-700">
                            <p className="text-xs text-muted uppercase">Total Hours</p>
                            <p className="text-xl font-bold text-primary">{totalHours}</p>
                        </div>
                        <div className="bg-surface rounded-lg p-3 px-6 text-center border border-gray-700">
                            <p className="text-xs text-muted uppercase">Days Worked</p>
                            <p className="text-xl font-bold text-success">{daysWorked}</p>
                        </div>
                        <div className="bg-surface rounded-lg p-3 px-6 text-center border border-gray-700">
                            <p className="text-xs text-muted uppercase">Leaves</p>
                            <p className="text-xl font-bold text-warning">{leaveDays}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-panel rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="text-primary" />
                        {monthName}
                    </h2>
                </div>

                <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-muted py-2">
                            {day}
                        </div>
                    ))}

                    {/* Empty slots for start of month alignment (Mocking Start on Friday for Mar 2024 if needed, but keeping simple grid for now) */}
                    {/* Note: Mar 1 2024 is Friday. Adding 5 placeholders */}
                    {[...Array(5)].map((_, i) => <div key={`empty-${i}`} className="h-24 md:h-32"></div>)}

                    {days.map((dayItem) => {
                        const log = logs[dayItem.date];
                        const isLogged = !!log;
                        const isLeave = log?.isLeave;

                        return (
                            <button
                                key={dayItem.date}
                                onClick={() => handleDateClick(dayItem.date)}
                                className={`
                                    h-24 md:h-32 rounded-xl border p-2 flex flex-col items-start justify-between transition-all hover:scale-[1.02]
                                    ${dayItem.isWeekend ? 'bg-surface/30 border-gray-800 opacity-60' : 'bg-surface border-gray-700 hover:border-primary'}
                                    ${isLogged && !isLeave ? 'border-success/50 bg-success/5' : ''}
                                    ${isLeave ? 'border-warning/50 bg-warning/5' : ''}
                                `}
                            >
                                <span className="text-sm font-bold text-muted">{dayItem.day}</span>

                                {isLogged ? (
                                    <div className="w-full">
                                        {isLeave ? (
                                            <span className="inline-block w-full text-center py-1 bg-warning/20 text-warning text-xs rounded font-bold">
                                                LEAVE
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1 text-success">
                                                <Clock size={14} />
                                                <span className="font-bold text-lg">{log.hours}h</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    !dayItem.isWeekend && (
                                        <div className="w-full text-center opacity-0 hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mx-auto text-primary">
                                                <Clock size={16} />
                                            </div>
                                        </div>
                                    )
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Modal: Log Hours */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-panel rounded-xl border border-gray-700 p-6 shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-muted hover:text-foreground">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-foreground mb-1">
                            Log Time
                        </h2>
                        <p className="text-primary mb-6">{selectedDate}</p>

                        <form onSubmit={handleSaveLog} className="space-y-6">

                            {/* Toggle Leave */}
                            <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-gray-700">
                                <span className="text-sm font-medium text-foreground">Mark as Leave?</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isLeave}
                                        onChange={(e) => setIsLeave(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
                                </label>
                            </div>

                            {/* Hours Input */}
                            {!isLeave && (
                                <div>
                                    <label className="text-sm font-medium text-muted block mb-2">Working Hours</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.5"
                                            max="24"
                                            min="0"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            className="w-full bg-surface p-3 pl-10 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-foreground text-lg font-mono"
                                        />
                                        <Clock className="absolute left-3 top-3.5 text-muted" size={18} />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[4, 8, 9, 10, 12].map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => setHours(h.toString())}
                                                className="px-2 py-1 text-xs bg-gray-800 text-muted rounded hover:bg-gray-700 border border-gray-700"
                                            >
                                                {h}h
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2
                                    ${isLeave ? 'bg-warning hover:bg-yellow-400 text-black' : 'bg-success hover:bg-success-hover text-black'}
                                `}
                            >
                                <CheckCircle size={18} />
                                {isLeave ? "Mark as Leave" : "Save Log"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
