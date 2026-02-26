"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Clock, User, LogOut, Wallet, LayoutGrid, Phone } from "lucide-react";

export function DashboardSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") return true;
        if (path !== "/dashboard" && pathname?.startsWith(path)) return true;
        return false;
    };

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Services", href: "/dashboard/services", icon: LayoutGrid },
        { name: "Virtual Cards", href: "/dashboard/virtual-cards", icon: CreditCard },
        { name: "Virtual Numbers", href: "/dashboard/virtual-numbers", icon: Phone },
        { name: "History", href: "/dashboard/history", icon: Clock },
        { name: "Referrals", href: "/dashboard/referrals", icon: User },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 fixed h-full z-10 transition-colors duration-300">
            <div className="p-6">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Paybills
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6">
                {links.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-blue-600 dark:hover:text-blue-400"
                                }`}
                        >
                            <link.icon className={`w-5 h-5 ${active ? "text-white" : ""}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-zinc-900">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/auth/login";
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
