import { TrendingUp, AlertTriangle, Users, HardHat } from "lucide-react";

export default function Home() {
    return (
        <div>
            <h1 className="mb-4 text-xl font-semibold text-foreground">Dashboard Overview</h1>

            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-panel p-6 transition-transform hover:-translate-y-0.5 hover:border-gray-600">
                    <div className="flex items-center justify-between text-sm text-muted">
                        <span>Active Projects</span>
                        <HardHat size={20} />
                    </div>
                    <div className="mt-1 text-3xl font-bold text-foreground">12</div>
                    <span className="text-sm font-medium text-success">+2 this month</span>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-panel p-6 transition-transform hover:-translate-y-0.5 hover:border-gray-600">
                    <div className="flex items-center justify-between text-sm text-muted">
                        <span>Total Workforce</span>
                        <Users size={20} />
                    </div>
                    <div className="mt-1 text-3xl font-bold text-foreground">148</div>
                    <span className="text-sm font-medium text-success">+12 new hires</span>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-panel p-6 transition-transform hover:-translate-y-0.5 hover:border-gray-600">
                    <div className="flex items-center justify-between text-sm text-muted">
                        <span>Material Alerts</span>
                        <AlertTriangle size={20} className="text-warning" />
                    </div>
                    <div className="mt-1 text-3xl font-bold text-foreground">5</div>
                    <span className="text-sm font-medium text-error">Low stock warning</span>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-gray-700 bg-panel p-6 transition-transform hover:-translate-y-0.5 hover:border-gray-600">
                    <div className="flex items-center justify-between text-sm text-muted">
                        <span>Revenue (MoM)</span>
                        <TrendingUp size={20} />
                    </div>
                    <div className="mt-1 text-3xl font-bold text-foreground">₹2.4M</div>
                    <span className="text-sm font-medium text-success">+8.4%</span>
                </div>
            </div>

            <h2 className="mb-4 text-xl font-semibold text-foreground">Project Timelines</h2>
            <div className="min-h-[400px] rounded-xl border border-gray-700 bg-panel p-6">
                {/* Placeholder for Gantt/Chart */}
                <p className="mt-36 text-center text-muted">
                    Project Activity Visualization Coming Soon
                </p>
            </div>
        </div>
    );
}
