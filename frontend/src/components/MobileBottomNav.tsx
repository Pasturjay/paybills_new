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
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Cards", href: "/dashboard/virtual-cards", icon: CreditCard },
        { name: "Transactions", href: "/dashboard/history", icon: Clock },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-gray-800 py-2 px-6 pb-6 md:hidden z-50">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-colors ${active ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            <item.icon className={`w-6 h-6 ${active ? "fill-current" : ""}`} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
