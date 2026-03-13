"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Mail, Briefcase, AlertTriangle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

interface PMData {
    _id: string;
    name: string;
    email?: string;
    role: string;
    site?: string;
}

interface SiteData {
    _id: string;
    name: string;
    locationName: string;
    status: string;
}

interface EngineerData {
    _id: string;
    name: string;
    email?: string;
    site?: string;
}

interface IssueData {
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    createdAt: string;
}

export default function ProjectManagerDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const [pm, setPm] = useState<PMData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sites, setSites] = useState<SiteData[]>([]);
    const [siteEngineers, setSiteEngineers] = useState<EngineerData[]>([]);
    const [issues, setIssues] = useState<IssueData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the PM user
                const userRes = await fetch(`/api/users/${id}`);
                let pmData: PMData | null = null;

                if (userRes.ok) {
                    const userData = await userRes.json();
                    pmData = userData.user || userData;
                    setPm(pmData);
                } else {
                    // Fallback: search in users list
                    const listRes = await fetch(`/api/users?role=project_manager`);
                    if (listRes.ok) {
                        const listData = await listRes.json();
                        const found = (listData.users || []).find((u: any) => u._id === id);
                        if (found) {
                            pmData = found;
                            setPm(found);
                        }
                    }
                }

                if (!pmData) {
                    setIsLoading(false);
                    return;
                }

                // 2. Fetch all sites
                const sitesRes = await fetch("/api/sites");
                let allSites: SiteData[] = [];
                if (sitesRes.ok) {
                    const sitesData = await sitesRes.json();
                    allSites = sitesData.sites || sitesData || [];
                }

                // Filter sites matching the PM's allocated site
                const matchedSites = pmData.site
                    ? allSites.filter(s => s.name === pmData!.site)
                    : [];
                setSites(matchedSites);

                // 3. Fetch engineers whose site matches PM's site
                const engRes = await fetch("/api/users?role=engineer");
                if (engRes.ok) {
                    const engData = await engRes.json();
                    const allEngineers: EngineerData[] = engData.users || [];
                    const matched = pmData.site
                        ? allEngineers.filter(e => e.site === pmData!.site)
                        : [];
                    setSiteEngineers(matched);
                }

                // 4. Fetch issues for each matched site
                const allIssues: IssueData[] = [];
                for (const site of matchedSites) {
                    try {
                        const issueRes = await fetch(`/api/sites/${site._id}/issues`);
                        if (issueRes.ok) {
                            const issueData = await issueRes.json();
                            const issuesArr = Array.isArray(issueData) ? issueData : issueData.issues || [];
                            allIssues.push(...issuesArr.map((iss: any) => ({ ...iss, siteName: site.name })));
                        }
                    } catch {
                        // skip
                    }
                }
                setIssues(allIssues);

            } catch (error) {
                console.error("Failed to load PM details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="p-6 text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl m-6 text-center animate-pulse">
                Loading Manager Details...
            </div>
        );
    }

    if (!pm) {
        return (
            <div className="space-y-4 m-6">
                <Link href="/project-managers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Project Managers
                </Link>
                <div className="p-6 text-muted border border-dashed border-gray-700 bg-panel/50 rounded-xl text-center">
                    Manager not found.
                </div>
            </div>
        );
    }

    const priorityColor = (p: string) => {
        switch (p) {
            case "Critical": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "Medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }
    };

    const statusIcon = (s: string) => {
        switch (s) {
            case "Open": return <AlertTriangle size={14} className="text-red-400" />;
            case "In Progress": return <Clock size={14} className="text-yellow-400" />;
            case "Resolved": return <CheckCircle2 size={14} className="text-green-400" />;
            default: return <Clock size={14} className="text-muted" />;
        }
    };

    const statusColor = (s: string) => {
        switch (s) {
            case "Open": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "In Progress": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "Resolved": return "bg-green-500/10 text-green-400 border-green-500/20";
            default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

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
            <div className="rounded-xl border border-gray-700 bg-panel p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-orange-300 flex items-center justify-center text-3xl font-bold text-black border-2 border-orange-400/20 shrink-0">
                        {pm.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-foreground">{pm.name}</h2>
                        <p className="text-primary font-medium">Project Manager</p>
                        <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted">
                            {pm.email && (
                                <div className="flex items-center gap-2"><Mail size={16} /> {pm.email}</div>
                            )}
                            {pm.site && (
                                <div className="flex items-center gap-2"><MapPin size={16} /> {pm.site}</div>
                            )}
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="flex gap-3 shrink-0">
                        <div className="text-center p-4 rounded-xl bg-surface border border-gray-700 min-w-[100px]">
                            <p className="text-2xl font-bold text-primary">{sites.length}</p>
                            <p className="text-xs text-muted mt-1">Sites</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-surface border border-gray-700 min-w-[100px]">
                            <p className="text-2xl font-bold text-blue-400">{siteEngineers.length}</p>
                            <p className="text-xs text-muted mt-1">Engineers</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-surface border border-gray-700 min-w-[100px]">
                            <p className="text-2xl font-bold text-orange-400">{issues.length}</p>
                            <p className="text-xs text-muted mt-1">Issues</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allocated Sites */}
                <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center justify-between">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <MapPin size={18} className="text-primary" /> Allocated Sites
                        </h3>
                        <span className="text-xs text-muted bg-panel px-2.5 py-1 rounded-full border border-gray-700">
                            {sites.length} site{sites.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="p-5">
                        {sites.length === 0 ? (
                            <div className="py-8 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                                <MapPin className="mx-auto mb-3 opacity-40" size={32} />
                                <p className="text-sm">No sites allocated to this manager.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sites.map(site => (
                                    <Link
                                        key={site._id}
                                        href={`/sites/${site._id}`}
                                        className="flex items-center justify-between p-4 rounded-xl border border-gray-700 bg-surface hover:border-primary/50 hover:bg-gray-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{site.name}</p>
                                                <p className="text-xs text-muted">{site.locationName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
                                                {site.status}
                                            </span>
                                            <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Site Engineers */}
                <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center justify-between">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <Users size={18} className="text-blue-400" /> Site Engineers
                        </h3>
                        <span className="text-xs text-muted bg-panel px-2.5 py-1 rounded-full border border-gray-700">
                            {siteEngineers.length} engineer{siteEngineers.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="p-5">
                        {siteEngineers.length === 0 ? (
                            <div className="py-8 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                                <Users className="mx-auto mb-3 opacity-40" size={32} />
                                <p className="text-sm">No engineers found for this manager&apos;s site.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {siteEngineers.map(eng => (
                                    <Link
                                        key={eng._id}
                                        href={`/engineers/${eng._id}`}
                                        className="flex items-center justify-between p-3 rounded-xl border border-gray-700 bg-surface hover:border-blue-500/30 hover:bg-gray-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-black shrink-0">
                                                {eng.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-sm group-hover:text-blue-400 transition-colors">{eng.name}</p>
                                                {eng.email && <p className="text-xs text-muted">{eng.email}</p>}
                                                <p className="text-xs text-muted">Site Engineer</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-muted group-hover:text-blue-400 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Issues Section */}
            <div className="rounded-xl border border-gray-700 bg-panel shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700 bg-surface flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-400" /> Site Issues
                    </h3>
                    <span className="text-xs text-muted bg-panel px-2.5 py-1 rounded-full border border-gray-700">
                        {issues.length} issue{issues.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <div className="p-5">
                    {issues.length === 0 ? (
                        <div className="py-8 text-center text-muted border border-dashed border-gray-700 rounded-lg">
                            <CheckCircle2 className="mx-auto mb-3 text-green-500/40" size={32} />
                            <p className="text-sm">No issues reported for this manager&apos;s sites.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface border-b border-gray-700 text-muted">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Issue</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Priority</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {issues.map(issue => (
                                        <tr key={issue._id} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-foreground">{issue.title}</p>
                                                    {issue.description && (
                                                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{issue.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950 px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityColor(issue.priority)}`}>
                                                    {issue.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200/50 bg-zinc-200 text-zinc-950`}>
                                                    {statusIcon(issue.status)}
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted text-xs">
                                                {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
