"use client";

import { X, LogOut, Home, LayoutGrid, CreditCard, Phone, Clock, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Overview", href: "/dashboard", icon: LayoutGrid },
    { name: "Services", href: "/dashboard/services", icon: LayoutGrid },
    { name: "Virtual Cards", href: "/dashboard/virtual-cards", icon: CreditCard },
    { name: "Virtual Numbers", href: "/dashboard/virtual-numbers", icon: Phone },
    { name: "Ledger", href: "/dashboard/history", icon: Clock },
    { name: "Referrals", href: "/dashboard/referrals", icon: User },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Support", href: "https://wa.me/2348135216820", icon: Phone },
];

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose}>
            <div className="absolute top-0 left-0 w-[80%] max-w-[300px] h-full bg-[#0f172a] shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex-shrink-0 flex justify-between items-center border-b border-white/5">
                    -                    <span className="text-xl font-bold text-white tracking-tight">PayBills</span>
                    +                    <Link href="/" className="text-xl font-bold text-white tracking-tight hover:text-blue-400 transition-colors" onClick={onClose}>PayBills</Link>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${pathname === link.href
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 flex-shrink-0 pb-10">
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            window.location.href = "/auth/login";
                        }}
                        className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors font-bold"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                    <div className="text-center mt-4 text-[10px] text-gray-600">
                        v1.0.2 • Securing Your Vault
                    </div>
                </div>
            </div>
        </div>
    );
}
