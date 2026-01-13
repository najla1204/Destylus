import Link from "next/link";
import { mockProjects } from "@/lib/mockData";
import { Plus, Search, Filter } from "lucide-react";

export default function ProjectsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-primary-hover">
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-gray-700 bg-panel p-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full rounded-lg border border-gray-600 bg-surface py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockProjects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group flex flex-col gap-4 rounded-xl border border-gray-700 bg-panel p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-primary">{project.id.toUpperCase()}</span>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${project.status === 'Active' ? 'bg-success/20 text-success' :
                                project.status === 'On Hold' ? 'bg-warning/20 text-warning' :
                                    'bg-blue-500/20 text-blue-500'
                                }`}>
                                {project.status}
                            </span>
                        </div>

                        <p className="line-clamp-2 text-sm text-muted">{project.description}</p>

                        <div className="mt-auto flex flex-col gap-2">
                            <div className="flex justify-between text-xs text-muted">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted">Budget</span>
                                <span className="font-semibold text-foreground">₹{(project.budget / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-muted">Deadline</span>
                                <span className="font-semibold text-foreground">{project.completionDate}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
