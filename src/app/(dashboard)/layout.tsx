"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-[260px] flex min-h-screen flex-1 flex-col bg-background">
                <Navbar />
                <div className="flex-1 overflow-y-auto p-8">{children}</div>
            </main>
        </div>
    );
}
