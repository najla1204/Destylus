"use client";

import { useState } from "react";
import { ArrowLeft, Package, User, Building, Plus, Trash2, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Mock Site Relation
const SITES = [
    { id: "1", name: "Metro Station Beta", pm: "Robert Fox" },
    { id: "2", name: "Skyline Complex", pm: "Cameron Williamson" },
    { id: "3", name: "River Bridge Expansion", pm: "Esther Howard" },
];

export default function MaterialRequestPage() {
    const [selectedSite, setSelectedSite] = useState(SITES[0].id);
    const [items, setItems] = useState([{ id: 1, name: "", quantity: 1, unit: "pcs" }]);
    const [submitted, setSubmitted] = useState(false);

    const currentSite = SITES.find(s => s.id === selectedSite);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: "", quantity: 1, unit: "pcs" }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleChange = (id: number, field: string, value: string | number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Request Sent!</h1>
                <p className="text-muted mt-2 max-w-md">
                    Your material request for <span className="text-foreground font-medium">{currentSite?.name}</span> has been forwarded to <span className="text-foreground font-medium">{currentSite?.pm}</span>.
                </p>
                <div className="mt-8 flex gap-4">
                    <Link href="/dashboard" className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Return Home</Link>
                    <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">New Request</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="rounded-lg p-2 text-muted hover:bg-gray-800 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Extra Material Request</h1>
                    <p className="text-muted">Request additional supplies for your site.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Project Details */}
                <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2"><Building size={18} className="text-primary" /> Project Context</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted">Site Name</label>
                            <select
                                className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                            >
                                {SITES.map(site => (
                                    <option key={site.id} value={site.id}>{site.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted">Project Manager</label>
                            <div className="flex items-center gap-3 w-full bg-surface/50 border border-gray-700 rounded-lg p-3">
                                <User size={18} className="text-blue-500" />
                                <span className="text-foreground font-medium">{currentSite?.pm}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Items */}
                <div className="bg-panel border border-gray-700 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-foreground flex items-center gap-2"><Package size={18} className="text-orange-500" /> Material Items</h3>
                        <button type="button" onClick={handleAddItem} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-foreground transition-colors">
                            <Plus size={14} /> Add Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="flex gap-3 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Item Name (e.g. Cement Bags)"
                                        className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                                        value={item.name}
                                        onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                                        value={item.quantity}
                                        onChange={(e) => handleChange(item.id, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-24">
                                    <select
                                        className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-foreground focus:border-primary focus:outline-none"
                                        value={item.unit}
                                        onChange={(e) => handleChange(item.id, 'unit', e.target.value)}
                                    >
                                        <option value="pcs">Pcs</option>
                                        <option value="kg">Kg</option>
                                        <option value="ltr">Ltr</option>
                                        <option value="box">Box</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    disabled={items.length === 1}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-transform hover:scale-[1.02] shadow-lg shadow-primary/20">
                        <Send size={18} /> Send Request
                    </button>
                </div>

            </form>
        </div>
    );
}
