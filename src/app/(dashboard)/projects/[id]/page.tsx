import Link from "next/link";
import { notFound } from "next/navigation";
import { mockProjects } from "@/lib/mockData";
import { ArrowLeft, Calendar, DollarSign, MapPin, Users, Package } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const project = mockProjects.find((p) => p.id === id);

    if (!project) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-700 pb-6">
                <Link href="/projects" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Projects
                </Link>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {project.location}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${project.status === 'Active' ? 'bg-success/20 text-success' :
                                project.status === 'On Hold' ? 'bg-warning/20 text-warning' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                    <button className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-black hover:bg-primary-hover">
                        Edit Project
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <section className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h2 className="mb-4 text-lg font-semibold text-foreground">Project Overview</h2>
                        <p className="text-muted leading-relaxed">
                            {project.description}
                        </p>

                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <div className="flex items-start gap-4 rounded-lg bg-surface p-4">
                                <Calendar className="mt-1 text-primary" size={20} />
                                <div>
                                    <p className="text-xs text-muted">Timeline</p>
                                    <p className="font-semibold text-foreground">{project.startDate} — {project.completionDate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 rounded-lg bg-surface p-4">
                                <DollarSign className="mt-1 text-primary" size={20} />
                                <div>
                                    <p className="text-xs text-muted">Budget</p>
                                    <p className="font-semibold text-foreground">
                                        ₹{project.spent.toLocaleString()} / ₹{project.budget.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Progress Section */}
                    <section className="rounded-xl border border-gray-700 bg-panel p-6">
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-lg font-semibold text-foreground">Construction Progress</h2>
                            <span className="text-2xl font-bold text-primary">{project.progress}%</span>
                        </div>
                        <div className="h-4 w-full overflow-hidden rounded-full bg-surface">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                            <Users size={18} />
                            Team
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface font-bold text-foreground">
                                {project.manager.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{project.manager}</p>
                                <p className="text-xs text-muted">Project Manager</p>
                            </div>
                        </div>
                        <button className="mt-6 w-full rounded-lg border border-gray-600 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground">
                            Manage Team
                        </button>
                    </div>

                    <div className="rounded-xl border border-gray-700 bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                            <Package size={18} />
                            Materials
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Cement</span>
                                <span className="text-foreground">450 Bags</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Steel</span>
                                <span className="text-foreground">50 Tons</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full rounded-lg border border-gray-600 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground">
                            View Inventory
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
