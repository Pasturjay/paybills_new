"use client";

import { Home, CreditCard, Clock, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname?.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Cards", href: "/dashboard/virtual-cards", icon: CreditCard },
        { name: "Ledger", href: "/dashboard/history", icon: Clock },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden z-50"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
        >
            <div className="flex justify-around items-end pt-2 pb-2 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center gap-1 min-w-[48px] min-h-[48px] justify-center transition-all duration-200"
                        >
                            <div
                                className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${active
                                        ? "bg-indigo-500/20"
                                        : "hover:bg-white/5"
                                    }`}
                            >
                                {active && (
                                    <span className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-pulse" />
                                )}
                                <item.icon
                                    className={`w-5 h-5 relative z-10 transition-all duration-300 ${active ? "text-indigo-400" : "text-gray-500"
                                        }`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "text-indigo-400" : "text-gray-600"
                                    }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
