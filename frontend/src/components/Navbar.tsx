"use client";

import Link from 'next/link';
import { Menu, X, ChevronRight, Calculator, Globe, Shield, CreditCard, Zap, Smartphone, LogOut } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';

import { BackButton } from './BackButton';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, isLoading, logout } = useAuth();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const menuSections = [
        {
            title: "Product",
            items: [
                { name: "Airtime & Data", href: "/products/airtime-data", icon: Smartphone },
                { name: "Bill Payment", href: "/products/bill-payment", icon: Zap },
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

                    <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
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
                            <Link href="/dashboard/history" className="hover:text-blue-600 transition-colors">History</Link>
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
                <div className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 overflow-y-auto p-6 animate-in slide-in-from-left duration-300 md:hidden">
                    <div className="space-y-6 pb-24">
                        {/* Main Links */}
                        <div className="space-y-2">
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold">
                                <CreditCard className="w-5 h-5" /> Dashboard
                            </Link>
                            <Link href="/products/airtime-data" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <Smartphone className="w-5 h-5" /> Buy Airtime & Data
                            </Link>
                            <Link href="/products/bill-payment" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800">
                                <Zap className="w-5 h-5" /> Pay Bills
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Support</h3>
                            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm text-gray-600 dark:text-gray-300">
                                <Globe className="w-4 h-4" /> Help Center
                            </Link>
                            <Link href="/legal/privacy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm text-gray-600 dark:text-gray-300">
                                <Shield className="w-4 h-4" /> Privacy & Terms
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
