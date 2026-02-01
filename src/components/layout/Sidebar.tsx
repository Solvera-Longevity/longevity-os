"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Activity,
    History,
    Settings,
    FileText,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Timeline", href: "/timeline", icon: History },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Protocols", href: "/protocols", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border bg-card h-screen fixed left-0 top-0 hidden md:flex flex-col z-10 transition-all duration-300">
            <div className="p-8 pb-4">
                <h1 className="text-2xl font-serif font-bold text-gold-500 tracking-wider">
                    SOLVERA
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">Longevity Concierge</p>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
                                isActive
                                    ? "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
