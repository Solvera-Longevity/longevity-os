"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Activity,
    History,
    Settings,
    FileText,
    LogOut,
    Menu,
    X
} from "lucide-react";

// Duplicated from Sidebar for Mobile Menu
const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Timeline", href: "/timeline", icon: History },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Protocols", href: "/protocols", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 ml-0 md:ml-64 transition-all duration-300">
            <div className="flex items-center gap-3">
                {/* Mobile Logo Text (Since Sidebar is hidden) */}
                <div className="md:hidden">
                    <span className="font-serif font-bold text-gold-500 tracking-wider">SOLVERA</span>
                </div>

                {/* Desktop Title */}
                <div className="hidden md:block">
                    <h2 className="text-sm font-medium text-muted-foreground">My Health & Longevity</h2>
                </div>
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-4 focus:outline-none group"
                >
                    <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
                        <p className="text-sm font-medium text-foreground">Dr. Peter Theo</p>
                        <p className="text-xs text-muted-foreground">Premium Member</p>
                    </div>
                    <div className={cn(
                        "h-10 w-10 rounded-full bg-gold-500/20 border border-gold-500 text-gold-500 flex items-center justify-center font-serif text-lg transition-all",
                        isOpen && "bg-gold-500 text-black border-gold-400"
                    )}>
                        PT
                    </div>
                </button>

                {/* Mobile Dropdown Menu */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 top-14 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 p-2 animate-in slide-in-from-top-2">
                            {/* Mobile Nav Links - Hidden on Desktop */}
                            <div className="md:hidden border-b border-white/10 pb-2 mb-2">
                                <p className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Menu</p>
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg",
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
                            </div>

                            {/* Profile Actions (Always visible in dropdown if we wanted, but mostly for Sign Out) */}
                            <div>
                                <button className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
