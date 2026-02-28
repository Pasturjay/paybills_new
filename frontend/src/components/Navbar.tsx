"use client";

import Link from 'next/link';
import { Menu, X, ChevronRight, Calculator, Globe, Shield, CreditCard, Zap, Smartphone, LogOut } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';

import { BackButton } from './BackButton';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, isAdmin, isLoading, logout } = useAuth();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const menuSections = [
        {
            title: "Product",
            items: [
                { name: "Airtime & Data", href: "/products/airtime-data", icon: Smartphone },
                { name: "Top Up & Bills", href: "/products/bill-payment", icon: Zap },
                { name: "Virtual Cards", href: "/products/virtual-cards", icon: CreditCard },
            ]
        },
        {
            title: "Company",
            items: [
                { name: "About Us", href: "/about", icon: Globe },
                { name: "Careers", href: "/careers", icon: Calculator },
                { name: "Contact", href: "/contact", icon: Globe },
            ]
        },
        {
            title: "Legal",
            items: [
                { name: "Privacy Policy", href: "/legal/privacy", icon: Shield },
                { name: "Terms of Service", href: "/legal/terms", icon: Shield },
            ]
        }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo & Menu Trigger */}
                <div className="flex items-center gap-4">
                    <button onClick={toggleMenu} className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300">
                        <Menu className="w-6 h-6" />
                    </button>

                    <BackButton className="md:hidden" />

                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <Image src="/logo.png" alt="PayBills" fill className="object-cover" />
                        </div>
                        <span className="text-xl font-bold text-[#0f172a] dark:text-white">
                            Paybills
                        </span>
                    </Link>
                </div>

                {/* Desktop Links - Conditionally show Dashboard/History if logged in, or standard public links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Overview</Link>
                            <Link href="/dashboard/services" className="hover:text-blue-600 transition-colors">Services</Link>
                            <Link href="/dashboard/history" className="hover:text-blue-600 transition-colors">Ledger</Link>
                            {isAdmin && (
                                <Link href="/admin/dashboard" className="px-3 py-1 bg-red-50 text-red-600 rounded-md font-bold border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 hover:bg-red-100 transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
                            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
                            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
                        </>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    ) : isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Log Out">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300">
                                Log in
                            </Link>
                            <Link href="/auth/register" className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 overflow-y-auto p-6 animate-in slide-in-from-top-4 duration-300 md:hidden flex flex-col">
                    <div className="space-y-8 pb-10 flex-1">
                        {/* Auth Priority Action */}
                        {!isAuthenticated && (
                            <Link
                                href="/auth/register"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold shadow-lg shadow-blue-600/20"
                            >
                                Get Started Free
                            </Link>
                        )}

                        {/* Navigation Sections */}
                        {menuSections.map((section, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] pl-2">{section.title}</h3>
                                <div className="grid grid-cols-1 gap-1">
                                    {section.items.map((item, i) => (
                                        <Link
                                            key={i}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</span>
                                            <ChevronRight className="w-4 h-4 ml-auto text-gray-300" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {isAuthenticated && (
                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 font-bold"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span>Personal Dashboard</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {!isAuthenticated ? (
                        <div className="py-6 border-t border-gray-100 dark:border-zinc-800 text-center">
                            <span className="text-sm text-gray-500">Already have an account? </span>
                            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-blue-600">Log In</Link>
                        </div>
                    ) : (
                        <button
                            onClick={() => { logout(); setIsMenuOpen(false); }}
                            className="w-full py-4 text-red-500 font-bold border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
