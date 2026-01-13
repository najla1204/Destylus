import { Bell, Search } from "lucide-react";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-background px-8">
            <div className="relative w-[300px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    placeholder="Search projects, materials..."
                    className="w-full rounded-md border border-gray-700 bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground transition-colors focus:border-primary focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground">
                    <Bell size={20} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-background bg-error"></span>
                </button>
            </div>
        </header>
    );
}
