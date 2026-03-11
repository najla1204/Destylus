"use client";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import { Suspense, useState, useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Persist collapse state
    useEffect(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebarCollapsed", newState.toString());
    };

    return (
        <div className="flex min-h-screen">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <Sidebar 
                isCollapsed={isCollapsed} 
                onToggle={toggleCollapse}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
            />
            
            <main className={`flex min-h-screen flex-1 flex-col bg-background transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'} ml-0`}>
                <Suspense fallback={<div className="h-16 border-b border-gray-700 bg-background" />}>
                    <Navbar onMenuClick={() => setIsMobileOpen(true)} />
                </Suspense>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
