import { Project, InventoryItem, Employee } from "@/types";

export const mockProjects: Project[] = [
    {
        id: "p-001",
        name: "Skyline Tower A",
        location: "Downtown District",
        status: "Active",
        startDate: "2025-01-15",
        completionDate: "2026-06-30",
        budget: 5000000,
        spent: 1200000,
        manager: "John Doe",
        progress: 25,
        description: "A 45-story residential tower with luxury amenities."
    },
    {
        id: "p-002",
        name: "City Bridge Renovation",
        location: "West River",
        status: "On Hold",
        startDate: "2024-11-01",
        completionDate: "2025-05-15",
        budget: 800000,
        spent: 300000,
        manager: "Sarah Smith",
        progress: 40,
        description: "Structural reinforcement and resurfacing of the West River bridge."
    },
    {
        id: "p-003",
        name: "Green Valley Mall",
        location: "Suburban Area",
        status: "Planning",
        startDate: "2026-03-01",
        completionDate: "2027-09-01",
        budget: 12000000,
        spent: 50000,
        manager: "Mike Johnson",
        progress: 0,
        description: "Eco-friendly shopping complex with solar integration."
    }
];

export const mockInventory: InventoryItem[] = [
    {
        id: "i-001",
        name: "Cement Bags (50kg)",
        category: "Raw Materials",
        quantity: 450,
        unit: "Bags",
        reorderLevel: 100,
        status: "In Stock",
        lastUpdated: "2026-01-10"
    },
    {
        id: "i-002",
        name: "Steel Rods (16mm)",
        category: "Reinforcement",
        quantity: 50,
        unit: "Tons",
        reorderLevel: 80,
        status: "Low Stock",
        lastUpdated: "2026-01-11"
    }
];
