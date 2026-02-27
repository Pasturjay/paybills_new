"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Smartphone, Zap, BookOpen, Trophy, Gamepad2, Gift, Download, Clock, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const promos = [
    {
        title: "New! Gift Cards",
        desc: "Shop global brands like Amazon & Apple instantly.",
        icon: Gift,
        bg: "bg-gradient-to-r from-emerald-600 to-green-600",
        shadow: "shadow-green-900/20",
        text: "text-green-100",
        btnColor: "text-green-600",
        btnHover: "hover:bg-green-50",
        iconColor: "text-green-500/50",
        link: "/products/giftcards",
        btnText: "Buy Now"
    },
    {
        title: "Instant Airtime & Data",
        desc: "Top up any network in seconds. Always connected.",
        icon: Smartphone,
        bg: "bg-gradient-to-r from-blue-600 to-indigo-600",
        shadow: "shadow-blue-900/20",
        text: "text-blue-100",
        btnColor: "text-blue-600",
        btnHover: "hover:bg-blue-50",
        iconColor: "text-blue-500/50",
        link: "/products/airtime-data",
        btnText: "Top Up"
    },
    {
        title: "Pay Bills Easily",
        desc: "Electricity, Cable TV, and more with zero stress.",
        icon: Zap,
        bg: "bg-gradient-to-r from-orange-500 to-red-600",
        shadow: "shadow-orange-900/20",
        text: "text-orange-100",
        btnColor: "text-orange-600",
        btnHover: "hover:bg-orange-50",
        iconColor: "text-orange-500/50",
        link: "/products/bill-payment",
        btnText: "Pay Bill"
    }
];

function PromoCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % promos.length);
        }, 5000); // 5 seconds interval
        return () => clearInterval(timer);
    }, []);

    const promo = promos[current];
    const Icon = promo.icon;

    return (
        <div className={`transition-all duration-700 ease-in-out ${promo.bg} rounded-2xl p-6 text-white mb-12 relative overflow-hidden flex items-center justify-between shadow-lg ${promo.shadow}`}>
            <div className="relative z-10 max-w-sm transition-opacity duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="font-bold text-xl mb-1">{promo.title}</div>
                <p className={`text-sm ${promo.text} mb-4`}>{promo.desc}</p>
                <Link href={promo.link} className={`px-4 py-2 bg-white ${promo.btnColor} rounded-lg text-xs font-bold ${promo.btnHover}`}>
                    {promo.btnText}
                </Link>
            </div>
            <Icon className={`w-24 h-24 absolute -right-4 -bottom-4 ${promo.iconColor} rotate-12 transition-transform duration-700`} />

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {promos.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-4" : "bg-white/40"}`}
                    />
                ))}
            </div>
        </div>
    );
}

const quickActions = [
    { name: "Airtime", icon: Smartphone, href: "/products/airtime-data", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Bills", icon: Zap, href: "/products/bill-payment", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { name: "Software", icon: Download, href: "/products/software", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Games", icon: Gamepad2, href: "/products/games", color: "text-pink-500", bg: "bg-pink-500/10" },
    { name: "Education", icon: BookOpen, href: "/products/education", color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Betting", icon: Trophy, href: "/products/betting", color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Gift Cards", icon: Gift, href: "/products/giftcards", color: "text-red-500", bg: "bg-red-500/10" },
];

const transactions = [
    { id: 1, type: "Data Purchase", desc: "MTN 10GB Monthly", amount: -3500, date: "Today, 10:23 AM", status: "success", icon: Smartphone },
    { id: 3, type: "Betting Fund", desc: "SportyBet Top-up", amount: -5000, date: "Yesterday, 2:30 PM", status: "success", icon: Trophy },
    { id: 4, type: "Software", desc: "Windows 11 Pro", amount: -15000, date: "24 Jan, 9:00 AM", status: "success", icon: Download },
];

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pb-24 md:pb-0">
            <Navbar />

            {/* Top Section */}
            <div className="pt-24 pb-8 px-4 sm:px-6 container mx-auto">
                {/* Hero / Welcome */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-[#0f172a] z-0"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="max-w-xl">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 leading-tight">
                                One App for<br />
                                <span className="text-blue-400">Everything Digital.</span>
                            </h1>
                            <p className="text-gray-300 text-sm sm:text-lg mb-5">
                                Pay bills, buy software, top-up games, and more. Instant delivery, zero transaction fees.
                            </p>
                            <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm">
                                Explore Products <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {/* Abstract generic illustration could go here */}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-10">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href} className="flex flex-col items-center gap-2 group">
                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${action.bg} flex items-center justify-center ${action.color} shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                                    <action.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 text-center group-hover:text-blue-500 transition-colors leading-tight">{action.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Animated Promo Banner */}
                <PromoCarousel />

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" /> Recent Activity
                        </h2>
                        <Link href="/history" className="text-sm text-blue-600 font-bold hover:underline">See All</Link>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-2">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"}`}>
                                    <tx.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tx.type}</h4>
                                    <div className="text-xs text-gray-500">{tx.desc}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                                        ₦{Math.abs(tx.amount).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">{tx.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <Footer />
        </main>
    );
}
