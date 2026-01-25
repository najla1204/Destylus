"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Receipt, Upload, X } from "lucide-react";

interface Transaction {
    id: string;
    type: "IN" | "OUT";
    amount: number;
    description: string;
    date: string;
    receiptImage?: string; // URL to uploaded image
    source?: string; // For "IN" transactions (e.g. "From Office")
}

// Mock initial data
const initialTransactions: Transaction[] = [
    { id: "1", type: "IN", amount: 15000, description: "Monthly Allowance", date: "2024-03-01", source: "Head Office" },
    { id: "2", type: "OUT", amount: 1200, description: "Tea & Snacks for Labours", date: "2024-03-02", receiptImage: "mock_url" },
    { id: "3", type: "OUT", amount: 4500, description: "Urgent Cement Bags (5)", date: "2024-03-03", receiptImage: "mock_url" },
    { id: "4", type: "IN", amount: 5000, description: "Emergency Fund", date: "2024-03-05", source: "Site Manager" },
];

export default function PettyCashPage() {
    const params = useParams();
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [showAllowanceForm, setShowAllowanceForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);

    // Form States
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [source, setSource] = useState("");
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Calculate Dashboard Stats
    const totalIn = transactions.filter(t => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = totalIn - totalOut;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceiptFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddAllowance = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: Math.random().toString(36).substring(2, 9),
            type: "IN",
            amount: parseFloat(amount),
            description: description || "Cash Allowance",
            date: new Date().toISOString().split('T')[0],
            source: source || "Office"
        };
        setTransactions([newTransaction, ...transactions]); // Add to top
        resetForms();
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: Math.random().toString(36).substring(2, 9),
            type: "OUT",
            amount: parseFloat(amount),
            description: description || "Expense",
            date: new Date().toISOString().split('T')[0],
            receiptImage: previewUrl || undefined // Store the mock URL (in real app, upload to server first)
        };
        setTransactions([newTransaction, ...transactions]); // Add to top
        resetForms();
    };

    const resetForms = () => {
        setAmount("");
        setDescription("");
        setSource("");
        setReceiptFile(null);
        setPreviewUrl(null);
        setShowAllowanceForm(false);
        setShowExpenseForm(false);
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
                        <h1 className="text-3xl font-bold text-foreground">Petty Cash & Allowance</h1>
                        <p className="text-muted">Manage site cash flow, expenses, and upload bills.</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-panel border border-gray-700 p-6 rounded-xl flex items-center justify-between col-span-1 md:col-span-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                    <div>
                        <p className="text-sm font-medium text-muted mb-1">Current Balance</p>
                        <p className="text-4xl font-bold text-foreground font-mono tracking-tight">
                            ₹{currentBalance.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-primary/20 p-3 rounded-full text-primary">
                        <Wallet size={32} />
                    </div>
                </div>

                {/* In/Out Setup */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {/* Total In */}
                    <div className="bg-panel border border-gray-700 p-6 rounded-xl flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-2 text-success">
                            <ArrowUpCircle size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Total Received</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">₹{totalIn.toLocaleString()}</p>
                    </div>

                    {/* Total Out */}
                    <div className="bg-panel border border-gray-700 p-6 rounded-xl flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-2 text-warning">
                            <ArrowDownCircle size={20} />
                            <span className="text-sm font-semibold uppercase tracking-wider">Total Expenses</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">₹{totalOut.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Actions & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">

                {/* Left Column: Action Buttons (Sticky) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-panel rounded-xl border border-gray-700 p-6 sticky top-8">
                        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowAllowanceForm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-success hover:bg-success-hover text-black font-bold rounded-lg transition-colors"
                            >
                                <Plus size={20} />
                                Add Allowance (Cash In)
                            </button>
                            <button
                                onClick={() => setShowExpenseForm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-warning hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                            >
                                <Receipt size={20} />
                                Add Extra Bill (Expense)
                            </button>
                        </div>
                        <div className="mt-6 p-4 bg-surface rounded-lg text-xs text-muted leading-relaxed">
                            <strong>Note:</strong> Ensure you take clear photos of bills for all expenses above ₹500 for audit purposes.
                        </div>
                    </div>
                </div>

                {/* Right Column: Transactions List */}
                <div className="lg:col-span-2">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Receipt size={18} className="text-primary" />
                        Recent Transactions
                    </h3>
                    <div className="space-y-4">
                        {transactions.map((t) => (
                            <div key={t.id} className="bg-panel border border-gray-700 rounded-xl p-4 flex items-center justify-between group hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${t.type === "IN" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                                        {t.type === "IN" ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{t.description}</p>
                                        <p className="text-xs text-muted">
                                            {t.date} • {t.type === "IN" ? `From: ${t.source}` : "Bill Expense"}
                                        </p>
                                        {t.receiptImage && (
                                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-400 hover:underline cursor-pointer">
                                                <Receipt size={10} /> View Receipt
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-lg font-bold font-mono ${t.type === "IN" ? "text-success" : "text-warning"}`}>
                                    {t.type === "IN" ? "+" : "-"}₹{t.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal: Add Allowance */}
            {showAllowanceForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-panel rounded-xl border border-gray-700 p-6 shadow-2xl relative">
                        <button onClick={resetForms} className="absolute right-4 top-4 text-muted hover:text-foreground">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Wallet className="text-success" />
                            Add Cash Allowance
                        </h2>
                        <form onSubmit={handleAddAllowance} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-success focus:outline-none text-foreground font-mono text-lg"
                                    placeholder="0.00"
                                />
                                <div className="flex gap-2 mt-2">
                                    {[500, 1000, 2000, 5000].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val.toString())}
                                            className="px-2 py-1 text-xs bg-gray-800 text-muted rounded hover:bg-gray-700 border border-gray-700 transition-colors"
                                        >
                                            +₹{val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Source / Note</label>
                                <input
                                    type="text"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-success focus:outline-none text-foreground"
                                    placeholder="e.g. Head Office, Site Manager"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-success hover:bg-success-hover text-black font-bold rounded-lg transition-colors mt-4"
                            >
                                <Plus size={18} className="inline mr-2" />
                                Add Cash to Balance
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Expense */}
            {showExpenseForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-panel rounded-xl border border-gray-700 p-6 shadow-2xl relative">
                        <button onClick={resetForms} className="absolute right-4 top-4 text-muted hover:text-foreground">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Receipt className="text-warning" />
                            Add Expense / Bill
                        </h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Total Bill Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-warning focus:outline-none text-foreground font-mono text-lg"
                                    placeholder="0.00"
                                />
                                <div className="flex gap-2 mt-2">
                                    {[100, 500, 1000, 2000].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val.toString())}
                                            className="px-2 py-1 text-xs bg-gray-800 text-muted rounded hover:bg-gray-700 border border-gray-700 transition-colors"
                                        >
                                            +₹{val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Description</label>
                                <input
                                    required
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-surface p-3 rounded-lg border border-gray-700 focus:border-warning focus:outline-none text-foreground"
                                    placeholder="e.g. Tea for workforce, Cement bags"
                                />
                            </div>

                            {/* Photo Upload UI */}
                            <div>
                                <label className="text-sm font-medium text-muted block mb-2">Upload Bill Photo</label>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:bg-surface/50 transition-colors bg-surface/20">
                                    <input
                                        type="file"
                                        id="bill-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {previewUrl ? (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                                            <img src={previewUrl} alt="Bill Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => document.getElementById("bill-upload")?.click()}>
                                                <span className="text-white text-xs font-semibold">Click to Change</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <label htmlFor="bill-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
                                            <Upload className="text-muted" size={24} />
                                            <span className="text-xs text-muted">Click to upload or drag and drop</span>
                                            <span className="text-[10px] text-gray-500">JPG, PNG (Max 5MB)</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-warning hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors mt-4"
                            >
                                <Receipt size={18} className="inline mr-2" />
                                Submit Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
