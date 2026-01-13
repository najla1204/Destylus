import Link from "next/link";
import { ArrowLeft, MapPin, Users, Package, Calendar, Activity, HardHat } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SiteDetailsPage({ params }: PageProps) {
    const { id } = await params;

    // In a real app, fetch data based on ID. Here we mock it.
    const site = {
        id: id,
        name: "Skyline Tower A",
        location: "Downtown District",
        status: "Active",
        manager: "John Doe", // Site Engineer
        projectEngineer: "Alex Morgan", // Project Engineer (Default)
        description: "A 45-story residential tower with luxury amenities under construction.",
        progress: 35,
        startDate: "2024-01-01",
        completionDate: "2025-12-31",
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Info Bar */}
            <div className="flex flex-col gap-4">
                <Link href="/sites" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Sites
                </Link>

                {/* Requested Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Project Engineer</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <HardHat size={18} className="text-primary" />
                            {site.projectEngineer}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Site Name</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <MapPin size={18} className="text-primary" />
                            {site.name}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Date / Day</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Calendar size={18} className="text-primary" />
                            {currentDate}
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-700 p-4 rounded-xl flex flex-col gap-1">
                        <span className="text-muted text-xs uppercase tracking-wider font-semibold">Site Engineer</span>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Users size={18} className="text-primary" />
                            {site.manager}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">

                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Site Overview</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${site.status === 'Active' ? 'bg-success/20 text-success' : 'bg-gray-700 text-gray-300'
                                }`}>
                                {site.status}
                            </span>
                        </div>
                        <p className="text-muted">{site.description}</p>

                        <div className="mt-6 flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Overall Progress</span>
                                <span className="font-semibold text-foreground">{site.progress}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${site.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-700 bg-panel p-6 flex flex-col gap-2">
                            <Calendar className="text-primary h-8 w-8 mb-2" />
                            <span className="text-muted text-sm">Start Date</span>
                            <span className="text-xl font-bold text-foreground">{site.startDate}</span>
                        </div>
                        <div className="rounded-xl border border-gray-700 bg-panel p-6 flex flex-col gap-2">
                            <Activity className="text-success h-8 w-8 mb-2" />
                            <span className="text-muted text-sm">Status</span>
                            <span className="text-xl font-bold text-foreground">On Schedule</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                            <Package size={18} />
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href={`/sites/${site.id}/labor`}
                                className="flex w-full items-center justify-center gap-2 py-2 bg-primary rounded-lg text-sm text-black font-semibold hover:bg-primary-hover transition-colors"
                            >
                                <Users size={16} />
                                Manage General Labour
                            </Link>
                            <Link
                                href={`/sites/${site.id}/skilled-labor`}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                <HardHat size={24} />
                                Manage Skilled Workers
                            </Link>

                            <Link
                                href={`/sites/${site.id}/materials`}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                <Package size={24} />
                                Manage Materials
                            </Link>

                            <Link
                                href={`/sites/${site.id}/petty-cash`}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-600 p-4 text-center font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                <Users size={24} className="hidden" /> {/* Placeholder for layout alignment if needed, or use specific icon */}
                                <div className="flex flex-col items-center">
                                    <div className="mb-1 rounded-full bg-primary/20 p-2 text-primary">
                                        <div className="h-6 w-6 font-bold flex items-center justify-center">₹</div>
                                    </div>
                                    Petty Cash / Allowance
                                </div>
                            </Link>

                            <Link
                                href={`/sites/${site.id}/issues`}
                                className="flex items-center justify-center gap-2 rounded-lg border border-red-900/50 p-4 text-center font-semibold text-red-400 transition-colors hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
                            >
                                <div className="flex flex-col items-center">
                                    <Activity size={24} className="mb-1" />
                                    Report Site Issue
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
