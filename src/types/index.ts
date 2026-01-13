export interface Project {
    id: string;
    name: string;
    location: string;
    status: "Active" | "Completed" | "On Hold" | "Planning";
    startDate: string;
    completionDate: string;
    budget: number;
    spent: number;
    manager: string;
    progress: number;
    description: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    reorderLevel: number;
    status: "In Stock" | "Low Stock" | "Out of Stock";
    lastUpdated: string;
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    status: "Active" | "On Leave" | "Terminated";
    contact: string;
    assignedProject?: string; // Project ID
}
