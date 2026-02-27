"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Smartphone, CreditCard, User, History, X, Command } from "lucide-react";
import { useRouter } from "next/navigation";

const navigationItems = [
    { name: "Top-up Airtime", icon: Smartphone, href: "/dashboard/services/airtime", keywords: ["mtn", "airtel", "glo", "9mobile", "credit"] },
    { name: "Buy Data Bundle", icon: Zap, href: "/dashboard/services/data", keywords: ["internet", "gigabytes", "data", "wifi"] },
    { name: "Pay Electricity", icon: Zap, href: "/dashboard/services/electricity", keywords: ["power", "nepa", "disco"] },
    { name: "Pay TV Cable", icon: Zap, href: "/dashboard/services/tv", keywords: ["dstv", "gotv", "startimes"] },
    { name: "Virtual Cards", icon: CreditCard, href: "/dashboard/services/cards", keywords: ["dollar", "visa", "mastercard"] },
    { name: "My Profile", icon: User, href: "/dashboard/profile", keywords: ["account", "settings", "kyc"] },
    { name: "Transaction History", icon: History, href: "/dashboard/history", keywords: ["receipts", "payments", "past"] },
];

export function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        }
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const filteredItems = navigationItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(query.toLowerCase()))
    );

    const navigateTo = (href: string) => {
        router.push(href);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <>
            <div className="fixed bottom-28 md:bottom-10 right-6 md:right-10 z-[100]">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800"
                >
                    <Search className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
                                    placeholder="Search for a service... (Airtime, Data, Cards)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-[10px] font-bold text-slate-400">
                                    <Command className="w-3 h-3" /> K
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {filteredItems.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredItems.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => navigateTo(item.href)}
                                                className="w-full flex items-center gap-4 p-3 hover:bg-indigo-50 dark:hover:bg-white/5 rounded-xl transition-all group text-left"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{item.keywords.join(", ")}</div>
                                                </div>
                                                <div className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Go →
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center">
                                        <div className="text-slate-400 text-sm">No services found for "{query}"</div>
                                        <button onClick={() => setQuery("")} className="text-indigo-600 dark:text-indigo-400 text-xs mt-2 hover:underline">Clear search</button>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 flex justify-between">
                                <span>Tip: Use ↑↓ keys to navigate (coming soon)</span>
                                <span>ESC to close</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
