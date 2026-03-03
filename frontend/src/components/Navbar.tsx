"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { useUser } from "@/hooks/useData";
import { PaybillsLogo } from "@/components/PaybillsLogo";

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useUser();

    const navLinks = [
        { label: "Products", href: "/products" },
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Gloss & blur bar */}
            <div className="mx-4 mt-3">
                <nav
                    className="relative flex items-center justify-between px-5 py-3.5 rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10"
                    style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)"
                    }}
                >

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 glow-blue btn-premium"
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                            <PaybillsLogo className="w-5 h-5 text-white relative z-10" variant="white" />
                        </div>
                        <span className="text-zinc-900 dark:text-white font-black text-xl tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            Pay<span className="text-gradient-blue">bills</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-xl text-[16px] font-black transition-all duration-200 ${active
                                        ? "bg-indigo-500/10 text-indigo-600 dark:bg-white/20 dark:text-white"
                                        : "text-zinc-600 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="shine btn-premium px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black text-[16px] transition-all duration-300 hover:scale-[1.03] glow-blue"
                            >
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="px-5 py-2.5 text-zinc-700 dark:text-white hover:text-indigo-600 dark:hover:text-white rounded-xl font-black text-[16px] transition-colors hover:bg-zinc-100 dark:hover:bg-white/10">
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="shine btn-premium px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black text-[16px] transition-all duration-300 hover:scale-[1.03] glow-blue"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <div
                        className="mt-2 p-4 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(32px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                        }}
                    >
                        <div className="space-y-1 mb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-bold text-sm transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                            {user ? (
                                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-indigo-500 text-white rounded-xl font-black text-sm"
                                    style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.5)" }}
                                >
                                    Dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-white/5 text-white rounded-xl font-black text-[16px] border border-white/20 hover:bg-white/10 transition-colors"
                                    >
                                        <LogIn className="w-5 h-5" /> Sign In
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                                        className="btn-premium shine flex items-center justify-center py-3.5 bg-indigo-500 text-white rounded-xl font-black text-[16px] glow-blue"
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
