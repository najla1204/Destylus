"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, MessageSquare, Camera, CheckCircle, Clock } from "lucide-react";

interface Issue {
    id: string;
    description: string;
    date: string;
    status: "Open" | "Resolved";
    photoUrl?: string;
    severity: "Low" | "Medium" | "High";
}

const initialIssues: Issue[] = [
    { id: "1", description: "Water leakage in sector 4 foundation", date: "2024-03-01", status: "Open", severity: "High" },
    { id: "2", description: "Delay in cement delivery", date: "2024-02-28", status: "Resolved", severity: "Medium" }
];

export default function SiteIssuesPage() {
    const params = useParams();
    const [issues, setIssues] = useState<Issue[]>(initialIssues);
    const [showForm, setShowForm] = useState(false);

    // Form
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<Issue["severity"]>("Medium");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIssue: Issue = {
            id: Math.random().toString(36).substring(2, 9),
            description,
            date: new Date().toISOString().split('T')[0],
            status: "Open",
            severity,
            photoUrl: photoPreview || undefined
        };
        setIssues([newIssue, ...issues]);
        resetForm();
    };

    const resetForm = () => {
        setDescription("");
        setSeverity("Medium");
        setPhotoPreview(null);
        setShowForm(false);
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case "High": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-700 pb-6">
                <Link
                    href={`/sites/${params.id}`}
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Site Details
                </Link>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <AlertTriangle className="text-warning" />
                            Site Issues Reporting
                        </h1>
                        <p className="text-muted">Report and track obstacles or problems at the site.</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary text-black font-bold px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Report New Issue
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Section */}
                {showForm ? (
                    <div className="lg:col-span-1">
                        <div className="bg-panel border border-gray-700 rounded-xl p-6 shadow-xl sticky top-6 animate-in slide-in-from-left duration-300">
                            <h2 className="text-lg font-bold text-foreground mb-4">New Issue Details</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted block mb-2">Description</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the issue..."
                                        className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-foreground min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted block mb-2">Severity</label>
                                    <div className="flex gap-2">
                                        {(["Low", "Medium", "High"] as const).map(lev => (
                                            <button
                                                key={lev}
                                                type="button"
                                                onClick={() => setSeverity(lev)}
                                                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${severity === lev ? getSeverityColor(lev) + " border-current font-bold" : "bg-surface border-gray-700 text-muted"}`}
                                            >
                                                {lev}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted block mb-2">Photo Evidence (Optional)</label>
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-surface/50 transition-colors bg-surface/20">
                                        <input
                                            type="file"
                                            id="issue-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                        {photoPreview ? (
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById("issue-upload")?.click()}>
                                                    <span className="text-white text-xs font-semibold">Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="issue-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                                <Camera className="text-muted" size={24} />
                                                <span className="text-xs text-muted">Click to upload</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-3 bg-surface border border-gray-600 rounded-lg text-foreground hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="bg-panel border border-gray-700 rounded-xl p-6 text-center text-muted">
                            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Select "Report New Issue" to log a problem.</p>
                            <p className="text-xs mt-2">Documenting issues helps in faster resolution and tracking.</p>
                        </div>
                    </div>
                )}

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        Recent Issues
                        <span className="px-2 py-0.5 bg-surface rounded-full text-xs text-muted border border-gray-700">{issues.length}</span>
                    </h2>

                    {issues.length === 0 ? (
                        <div className="text-center py-12 text-muted">No issues reported yet. Good job!</div>
                    ) : (
                        issues.map(issue => (
                            <div key={issue.id} className="bg-panel border border-gray-700 rounded-xl p-4 flex gap-4 hover:border-gray-500 transition-colors">
                                {issue.photoUrl ? (
                                    <div className="w-24 h-24 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                                        <img src={issue.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-lg bg-surface flex-shrink-0 flex items-center justify-center text-muted">
                                        <AlertTriangle size={24} />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`text-xs px-2 py-0.5 rounded border ${getSeverityColor(issue.severity)}`}>
                                            {issue.severity} Priority
                                        </div>
                                        <div className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${issue.status === "Resolved" ? "text-success border-success/30 bg-success/10" : "text-gray-400 border-gray-700 bg-surface"}`}>
                                            {issue.status === "Resolved" ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {issue.status}
                                        </div>
                                    </div>
                                    <p className="text-foreground font-medium mb-2">{issue.description}</p>
                                    <p className="text-xs text-muted">{issue.date} • Reported by Site Engineer</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
