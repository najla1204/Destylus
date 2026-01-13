"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

interface SkilledEntry {
    id: string;
    category: string;
    count: number | string;
    salary: number | string;
}

const defaultEntries: SkilledEntry[] = [
    { id: "1", category: "Electrician", count: "", salary: "" },
    { id: "2", category: "Plumber", count: "", salary: "" },
    { id: "3", category: "Carpenter", count: "", salary: "" },
    { id: "4", category: "Painter", count: "", salary: "" },
    { id: "5", category: "Tiles Worker", count: "", salary: "" },
    { id: "6", category: "Marble Worker", count: "", salary: "" },
];

export default function SkilledLaborEntryPage() {
    const params = useParams();
    const router = useRouter();
    const [entries, setEntries] = useState<SkilledEntry[]>(defaultEntries);
    const [submitting, setSubmitting] = useState(false);

    // Calculate totals
    const totalCount = entries.reduce((sum, entry) => sum + (Number(entry.count) || 0), 0);
    const grandTotal = entries.reduce(
        (sum, entry) => sum + (Number(entry.count) || 0) * (Number(entry.salary) || 0),
        0
    );

    const handleInputChange = (
        id: string,
        field: keyof SkilledEntry,
        value: string | number
    ) => {
        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry
            )
        );
    };

    const handleAddWork = () => {
        const newEntry: SkilledEntry = {
            id: Date.now().toString(),
            category: "",
            count: "",
            salary: "",
        };
        setEntries([...entries, newEntry]);
    };

    const handleDelete = (id: string) => {
        setEntries(entries.filter((entry) => entry.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            alert("Skilled workers data submitted successfully!");
            setSubmitting(false);
            router.push(`/sites/${params.id}`);
        }, 1500);
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-4 border-b border-gray-700 pb-6">
                <Link
                    href={`/sites/${params.id}`}
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Site Details
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Skilled Workers Entry</h1>
                    <p className="text-muted">Enter daily skilled manpower details and verify cost calculations.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="rounded-xl border border-gray-700 bg-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface text-muted uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold">Skilled Role / Category</th>
                                    <th className="p-4 font-semibold w-32">Members</th>
                                    <th className="p-4 font-semibold w-40">Salary / Wage</th>
                                    <th className="p-4 font-semibold w-40 text-right">Total</th>
                                    <th className="p-4 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={entry.category}
                                                onChange={(e) =>
                                                    handleInputChange(entry.id, "category", e.target.value)
                                                }
                                                className="w-full bg-transparent p-2 rounded border border-transparent focus:border-gray-600 focus:bg-surface focus:outline-none text-foreground placeholder-gray-500"
                                                placeholder="Enter role"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min="0"
                                                value={entry.count}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        entry.id,
                                                        "count",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full bg-surface/50 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground text-center"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                                    ₹
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={entry.salary}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            entry.id,
                                                            "salary",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full bg-surface/50 p-2 pl-8 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground text-right"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono font-medium text-foreground">
                                            ₹{((Number(entry.count) || 0) * (Number(entry.salary) || 0)).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-muted hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                                                title="Remove Row"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-surface/50 font-bold text-foreground">
                                <tr>
                                    <td className="p-4 text-primary">+ Add New Work (Optional)</td>
                                    <td className="p-4 text-center">{totalCount}</td>
                                    <td className="p-4 text-right text-muted">Grand Total:</td>
                                    <td className="p-4 text-right text-lg">
                                        ₹{grandTotal.toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="border-t border-gray-700 p-4">
                        <button
                            type="button"
                            onClick={handleAddWork}
                            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            <Plus size={16} />
                            Add Custom Work Row
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded-lg border border-gray-600 text-foreground font-semibold hover:bg-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            "Submitting..."
                        ) : (
                            <>
                                <Save size={18} />
                                Submit Skilled Workers
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
