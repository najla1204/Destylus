"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, MapPin, Users, Phone, Mail, Award, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

// Mock Data
const PM_DATA = {
    "1": {
        id: "1",
        name: "Robert Fox",
        role: "Senior Project Manager",
        email: "robert.fox@destylus.com",
        phone: "+91 98765 43210",
        department: "Infrastructure",
        activeSites: [
            { id: "1", name: "Metro Station Beta", location: "Downtown", status: "Active", progress: 75 },
            { id: "3", name: "River Bridge Expansion", location: "North River", status: "Active", progress: 40 }
        ],
        team: [
            { id: "1", name: "John Doe", role: "Site Engineer" },
            { id: "3", name: "Sarah Connor", role: "Safety Officer" }
        ],
        performance: {
            onTime: "92%",
            budgetAdherence: "98%",
            projectsCompleted: 24
        }
    }
};

export default function ProjectManagerDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const pm = PM_DATA[id as keyof typeof PM_DATA] || PM_DATA["1"]; // Fallback to 1 for demo

    return (
        <div className="space-y-6">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/project-managers" className="rounded-lg p-2 text-muted hover:bg-gray-800 hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manager Profile</h1>
                </div>
            </div>

            {/* Header Card */}
            <div className="rounded-xl border border-gray-700 bg-panel p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-orange-300 flex items-center justify-center text-3xl font-bold text-black border-2 border-orange-400/20">
                        {pm.name.charAt(0)}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-foreground">{pm.name}</h2>
                        <p className="text-primary font-medium">{pm.role}</p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted">
                            <div className="flex items-center gap-2"><Mail size={16} /> {pm.email}</div>
                            <div className="flex items-center gap-2"><Phone size={16} /> {pm.phone}</div>
                            <div className="flex items-center gap-2"><Briefcase size={16} /> {pm.department}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-center p-3 rounded-lg bg-surface border border-gray-700 min-w-[120px]">
                            <p className="text-2xl font-bold text-success">{pm.performance.onTime}</p>
                            <p className="text-xs text-muted">On-Time Rate</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-surface border border-gray-700 min-w-[120px]">
                            <p className="text-2xl font-bold text-blue-500">{pm.performance.projectsCompleted}</p>
                            <p className="text-xs text-muted">Projects Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. MANAGED SITES */}
                <div className="space-y-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2"><MapPin size={20} className="text-primary" /> Assigned Sites</h3>
                    <div className="grid gap-4">
                        {pm.activeSites.map(site => (
                            <Link key={site.id} href={`/sites/${site.id}`} className="block rounded-xl border border-gray-700 bg-panel p-4 hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-foreground">{site.name}</h4>
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">{site.status}</span>
                                </div>
                                <p className="text-sm text-muted mb-3 flex items-center gap-1"><MapPin size={12} /> {site.location}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted">
                                        <span>Completion</span>
                                        <span>{site.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-gray-700">
                                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${site.progress}%` }}></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 2. TEAM MEMBERS */}
                <div className="space-y-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2"><Users size={20} className="text-blue-500" /> Team Members</h3>
                    <div className="grid gap-4">
                        {pm.team.map(member => (
                            <Link key={member.id} href={`/engineers/${member.id}`} className="flex items-center justify-between rounded-xl border border-gray-700 bg-panel p-4 hover:bg-surface transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-black">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{member.name}</p>
                                        <p className="text-xs text-muted">{member.role}</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-muted" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
