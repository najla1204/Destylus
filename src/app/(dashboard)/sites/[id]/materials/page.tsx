"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, AlertTriangle, Package, Trash2 } from "lucide-react";

interface MaterialItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    totalIn: number;
    totalOut: number;
    unitPrice: number;
}

// Mock initial data
const initialMaterials: MaterialItem[] = [
    { id: "1", name: "Cement", category: "Construction", unit: "Bags", totalIn: 500, totalOut: 350, unitPrice: 400 },
    { id: "2", name: "Steel (16mm)", category: "Construction", unit: "Tons", totalIn: 50, totalOut: 20, unitPrice: 65000 },
    { id: "3", name: "Bricks", category: "Construction", unit: "Pcs", totalIn: 10000, totalOut: 8500, unitPrice: 12 },
    { id: "4", name: "Sand", category: "Aggregates", unit: "Cft", totalIn: 2000, totalOut: 1800, unitPrice: 60 },
    { id: "5", name: "Paint (White)", category: "Finishing", unit: "Liters", totalIn: 100, totalOut: 10, unitPrice: 450 },
];

export default function MaterialsPage() {
    const params = useParams();
    const router = useRouter();
    const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: "",
        category: "Construction",
        unit: "",
        quantity: "",
        type: "IN" as "IN" | "OUT",
        price: "",
        existingId: ""
    });

    // Calculate Dashboard Stats
    const totalInventoryValue = materials.reduce((sum, item) => sum + ((item.totalIn - item.totalOut) * item.unitPrice), 0);
    const totalItemsCount = materials.length;
    const overstockedItems = materials.filter(item => (item.totalIn - item.totalOut) > (item.totalIn * 0.7)).length; // Logic: > 70% of total In remains

    const handleTransaction = (e: React.FormEvent) => {
        e.preventDefault();

        const qty = Number(newItem.quantity) || 0;
        const price = Number(newItem.price) || 0;

        if (newItem.existingId) {
            // Update existing material
            setMaterials(prev => prev.map(item => {
                if (item.id === newItem.existingId) {
                    return {
                        ...item,
                        totalIn: newItem.type === "IN" ? item.totalIn + qty : item.totalIn,
                        totalOut: newItem.type === "OUT" ? item.totalOut + qty : item.totalOut,
                        unitPrice: newItem.type === "IN" && price > 0 ? price : item.unitPrice, // Update price on new purchase
                    };
                }
                return item;
            }));
        } else {
            // Add new material (Only for IN)
            const newMaterial: MaterialItem = {
                id: Date.now().toString(),
                name: newItem.name,
                category: newItem.category,
                unit: newItem.unit,
                totalIn: qty,
                totalOut: 0,
                unitPrice: price,
            };
            setMaterials([...materials, newMaterial]);
        }

        // Reset
        setShowAddForm(false);
        setNewItem({ name: "", category: "Construction", unit: "", quantity: "", type: "IN", price: "", existingId: "" });
    };

    const openTransaction = (type: "IN" | "OUT", material?: MaterialItem) => {
        setNewItem({
            name: material?.name || "",
            category: material?.category || "Construction",
            unit: material?.unit || "",
            quantity: "",
            type: type,
            price: material?.unitPrice.toString() || "",
            existingId: material?.id || ""
        });
        setShowAddForm(true);
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-700 pb-6">
                <Link
                    href={`/sites/${params.id}`}
                    className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Site Details
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Material Management</h1>
                        <p className="text-muted">Track inventory, purchases, and material usage.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => openTransaction("OUT")}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 hover:bg-surface text-foreground font-medium transition-colors"
                        >
                            <ArrowDownLeft size={18} className="text-warning" />
                            Record Usage
                        </button>
                        <button
                            onClick={() => openTransaction("IN")}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-black font-semibold transition-colors"
                        >
                            <ArrowUpRight size={18} />
                            Add Stock (IN)
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-panel border border-gray-700 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-foreground">₹{totalInventoryValue.toLocaleString()}</p>
                    </div>
                    <Package className="text-primary opacity-20" size={40} />
                </div>
                <div className="bg-panel border border-gray-700 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted">Total Items Tracked</p>
                        <p className="text-2xl font-bold text-foreground">{totalItemsCount}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        {totalItemsCount}
                    </div>
                </div>
                <div className="bg-panel border border-gray-700 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted">Overstocked Items</p>
                        <p className="text-2xl font-bold text-warning">{overstockedItems}</p>
                    </div>
                    <AlertTriangle className="text-warning opacity-80" size={32} />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-panel border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface text-muted uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold">Material Name</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold text-center">Total In</th>
                                <th className="p-4 font-semibold text-center">Total Out</th>
                                <th className="p-4 font-semibold text-center">Current Stock</th>
                                <th className="p-4 font-semibold text-right">Unit Price</th>
                                <th className="p-4 font-semibold text-right">Total Value</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {materials.map((item) => {
                                const stock = item.totalIn - item.totalOut;
                                const isOverstocked = stock > (item.totalIn * 0.7) && item.totalIn > 0;

                                return (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium text-foreground">{item.name}</td>
                                        <td className="p-4 text-muted">{item.category}</td>
                                        <td className="p-4 text-center text-success">+{item.totalIn} {item.unit}</td>
                                        <td className="p-4 text-center text-warning">-{item.totalOut} {item.unit}</td>
                                        <td className="p-4 text-center font-bold text-foreground bg-surface/30">
                                            {stock} <span className="text-xs font-normal text-muted">{item.unit}</span>
                                        </td>
                                        <td className="p-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono">₹{(stock * item.unitPrice).toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            {isOverstocked ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-1 text-xs font-medium text-warning">
                                                    Overstock
                                                </span>
                                            ) : stock < (item.totalIn * 0.2) ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openTransaction("IN", item)}
                                                className="p-1.5 rounded hover:bg-success/20 text-success"
                                                title="Add Stock"
                                            >
                                                <ArrowUpRight size={16} />
                                            </button>
                                            <button
                                                onClick={() => openTransaction("OUT", item)}
                                                className="p-1.5 rounded hover:bg-warning/20 text-warning"
                                                title="Record Usage"
                                            >
                                                <ArrowDownLeft size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-panel rounded-xl border border-gray-700 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            {newItem.existingId ?
                                `Record Material ${newItem.type}: ${newItem.name}` :
                                `Add New Material (IN)`
                            }
                        </h2>

                        <form onSubmit={handleTransaction} className="flex flex-col gap-4">
                            {!newItem.existingId && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-muted">Material Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full bg-surface p-2 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground"
                                            placeholder="e.g. Cement, Steel"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-2 flex-1">
                                            <label className="text-sm font-medium text-muted">Category</label>
                                            <select
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                                className="w-full bg-surface p-2 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground"
                                            >
                                                <option>Construction</option>
                                                <option>Finishing</option>
                                                <option>Aggregates</option>
                                                <option>Electrical</option>
                                                <option>Plumbing</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1">
                                            <label className="text-sm font-medium text-muted">Unit</label>
                                            <input
                                                required
                                                type="text"
                                                value={newItem.unit}
                                                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                                className="w-full bg-surface p-2 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground"
                                                placeholder="Bags, Tons..."
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Selecting existing item if opening generic modal */}
                            {!newItem.existingId && newItem.name === "" && (
                                <div className="p-2 text-xs text-yellow-400 bg-yellow-400/10 rounded">
                                    Select an item from the list to add stock or record usage, or create a new item above.
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-sm font-medium text-muted">Quantity ({newItem.type})</label>
                                    <div className="relative">
                                        {newItem.type === "IN" ?
                                            <ArrowUpRight size={14} className="absolute left-3 top-3 text-success" /> :
                                            <ArrowDownLeft size={14} className="absolute left-3 top-3 text-warning" />
                                        }
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                            className="w-full bg-surface p-2 pl-8 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground font-mono"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-sm font-medium text-muted">Unit Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted">₹</span>
                                        <input
                                            // Price optional for OUT
                                            required={newItem.type === "IN"}
                                            disabled={newItem.type === "OUT"}
                                            type="number"
                                            min="0"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full bg-surface p-2 pl-7 rounded border border-gray-700 focus:border-primary focus:outline-none text-foreground font-mono disabled:opacity-50"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-muted hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-lg text-sm font-bold text-black transition-colors ${newItem.type === "IN" ? "bg-primary hover:bg-primary-hover" : "bg-warning hover:bg-yellow-400"}`}
                                >
                                    {newItem.type === "IN" ? "Add Stock" : "Record Usage"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
