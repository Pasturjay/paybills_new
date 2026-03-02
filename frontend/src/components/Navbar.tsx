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
                    className="relative flex items-center justify-between px-5 py-3.5 rounded-2xl"
                    style={{
                        background: "rgba(15, 23, 42, 0.85)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.12) inset",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}
                >
                    {/* Top gloss */}
                    <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                            style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)" }}
                        >
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                            <PaybillsLogo className="w-5 h-5 text-white relative z-10" variant="white" />
                        </div>
                        <span className="text-white font-black text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
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
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${active
                                        ? "bg-white/10 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
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
                                className="shine px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                                style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}
                            >
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="px-4 py-2.5 text-gray-300 hover:text-white rounded-xl font-bold text-sm transition-colors hover:bg-white/5">
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="shine px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                                    style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}
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
                            background: "rgba(15, 23, 42, 0.97)",
                            backdropFilter: "blur(24px)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
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
                                        className="flex items-center justify-center gap-2 py-3.5 bg-white/5 text-white rounded-xl font-bold text-sm border border-white/10"
                                    >
                                        <LogIn className="w-4 h-4" /> Sign In
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-center py-3.5 bg-indigo-500 text-white rounded-xl font-black text-sm"
                                        style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.5)" }}
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
