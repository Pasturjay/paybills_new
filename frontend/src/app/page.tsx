"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Smartphone, Zap, BookOpen, Trophy, Gamepad2, Gift, Download, Clock, ArrowRight, CreditCard, Star, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const promos = [
    {
        title: "New! Gift Cards",
        desc: "Shop global brands like Amazon & Apple instantly.",
        icon: Gift,
        bg: "from-emerald-600 via-green-600 to-teal-700",
        light: "bg-emerald-400/20",
        btnColor: "text-emerald-700",
        btnHover: "hover:bg-emerald-50",
        iconColor: "text-emerald-300/30",
        link: "/products/giftcards",
        btnText: "Buy Now",
        badge: "NEW",
    },
    {
        title: "Instant Airtime & Data",
        desc: "Top up any network in seconds. Always connected.",
        icon: Smartphone,
        bg: "from-blue-600 via-indigo-600 to-violet-700",
        light: "bg-blue-400/20",
        btnColor: "text-blue-700",
        btnHover: "hover:bg-blue-50",
        iconColor: "text-blue-300/30",
        link: "/products/airtime-data",
        btnText: "Top Up",
        badge: "FAST",
    },
    {
        title: "Pay Bills Easily",
        desc: "Electricity, Cable TV, and more with zero stress.",
        icon: Zap,
        bg: "from-orange-500 via-rose-600 to-red-700",
        light: "bg-orange-400/20",
        btnColor: "text-orange-700",
        btnHover: "hover:bg-orange-50",
        iconColor: "text-orange-300/30",
        link: "/products/bill-payment",
        btnText: "Pay Bill",
        badge: "EASY",
    },
];

function PromoCarousel() {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % promos.length);
                setAnimating(false);
            }, 250);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const promo = promos[current];
    const Icon = promo.icon;

    return (
        <div className={`shine relative overflow-hidden bg-gradient-to-r ${promo.bg} rounded-3xl p-7 text-white mb-12 shadow-2xl transition-all duration-500`}
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset" }}
        >
            {/* Top gloss */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            {/* Ambient blob */}
            <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full blur-2xl ${promo.light}`} />
            <div className={`absolute -bottom-8 -left-4 w-24 h-24 rounded-full blur-xl ${promo.light} opacity-60`} />

            <div className={`relative z-10 max-w-xs transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                {/* Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-[10px] font-black tracking-widest mb-3">
                    <Sparkles className="w-2.5 h-2.5" /> {promo.badge}
                </span>
                <div className="font-black text-2xl mb-1.5 leading-tight">{promo.title}</div>
                <p className="text-sm text-white/80 mb-5 leading-relaxed">{promo.desc}</p>
                <Link
                    href={promo.link}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 bg-white ${promo.btnColor} rounded-xl text-xs font-black ${promo.btnHover} transition-all hover:scale-105 shadow-xl`}
                >
                    {promo.btnText} <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <Icon className={`w-36 h-36 absolute -right-6 -bottom-6 ${promo.iconColor} rotate-12`} />

            {/* Dot indicators */}
            <div className="absolute bottom-5 right-6 flex gap-1.5 z-20">
                {promos.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`rounded-full transition-all duration-300 ${i === current ? "bg-white w-5 h-1.5" : "bg-white/40 w-1.5 h-1.5"}`}
                    />
                ))}
            </div>
        </div>
    );
}

const quickActions = [
    { name: "Airtime", icon: Smartphone, href: "/products/airtime-data", gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/40" },
    { name: "Bills", icon: Zap, href: "/products/bill-payment", gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/40" },
    { name: "Software", icon: Download, href: "/products/software", gradient: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/40" },
    { name: "Games", icon: Gamepad2, href: "/products/games", gradient: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/40" },
    { name: "Education", icon: BookOpen, href: "/products/education", gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/40" },
    { name: "Betting", icon: Trophy, href: "/products/betting", gradient: "from-orange-500 to-red-600", shadow: "shadow-orange-500/40" },
    { name: "Gift Cards", icon: Gift, href: "/products/giftcards", gradient: "from-red-500 to-pink-600", shadow: "shadow-red-500/40" },
];

const transactions = [
    { id: 1, type: "Data Purchase", desc: "MTN 10GB Monthly", amount: -3500, date: "Today, 10:23 AM", icon: Smartphone, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/30" },
    { id: 3, type: "Betting Fund", desc: "SportyBet Top-up", amount: -5000, date: "Yesterday, 2:30 PM", icon: Trophy, gradient: "from-pink-500 to-rose-600", shadow: "shadow-rose-500/30" },
    { id: 4, type: "Software License", desc: "Windows 11 Pro", amount: -15000, date: "24 Jan, 9:00 AM", icon: Download, gradient: "from-fuchsia-500 to-purple-600", shadow: "shadow-purple-500/30" },
];

const trustBadges = [
    { icon: Shield, label: "Bank-level Security", sub: "256-bit SSL Encryption" },
    { icon: Zap, label: "Instant Delivery", sub: "Avg. 3-second fulfillment" },
    { icon: Star, label: "Trusted by 10,000+", sub: "Happy customers nationwide" },
];

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] pb-24 md:pb-0 overflow-x-hidden">
            <Navbar />

            {/* ── Hero Section ── */}
            <div className="pt-24 pb-8 px-4 sm:px-6 container mx-auto">
                <div className="shine relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-2xl"
                    style={{
                        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)",
                        boxShadow: "0 32px 80px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.07) inset"
                    }}
                >
                    {/* Decorative glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    {/* Top gloss line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-indigo-300 mb-5 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                Nigeria's #1 Digital Services Platform
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tight">
                                One App for<br />
                                <span className="text-gradient-blue">Everything Digital.</span>
                            </h1>
                            <p className="text-gray-100 text-sm sm:text-base mb-7 leading-relaxed max-w-md font-medium">
                                Pay bills, buy software, top-up games, and more. Instant delivery, zero transaction fees.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                <Link href="/products" className="btn-premium inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[15px] glow-blue">
                                    Explore Products <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/auth/register" className="shine inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-black transition-all duration-300 text-[15px] backdrop-blur-md shadow-xl">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>

                        {/* Trust badges — desktop only */}
                        <div className="hidden lg:flex flex-col gap-3 min-w-[220px]">
                            {trustBadges.map((badge) => (
                                <div key={badge.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center flex-shrink-0 border border-indigo-500/50 glow-blue">
                                        <badge.icon className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">{badge.label}</div>
                                        <div className="text-[11px] font-bold text-gray-300">{badge.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="mb-12">
                    <h2 className="text-[15px] font-black text-indigo-900 dark:text-indigo-200 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
                        <Zap className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        {quickActions.map((action) => (
                            <Link key={action.name} href={action.href} className="shine flex flex-col items-center gap-2.5 group">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${action.gradient} relative flex items-center justify-center text-white shadow-lg ${action.shadow} group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300`}>
                                    {/* Inner gloss */}
                                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                                    <action.icon className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
                                </div>
                                <span className="text-[11px] sm:text-[12px] font-black text-gray-800 dark:text-gray-200 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-wider drop-shadow-sm">
                                    {action.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Promo Carousel ── */}
                <PromoCarousel />

                {/* ── Recent Activity ── */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 drop-shadow-sm">
                            <Clock className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" /> Recent Activity
                        </h2>
                        <Link href="/dashboard/history" className="text-xs text-indigo-600 dark:text-indigo-400 font-black hover:underline">See All</Link>
                    </div>
                    <div className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-gray-100 dark:border-white/5 p-2 space-y-1 shadow-sm"
                        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                        {transactions.map((tx) => (
                            <div key={tx.id} className="shine group p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all duration-300 cursor-pointer">
                                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${tx.gradient} flex items-center justify-center text-white shadow-lg ${tx.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                                    <tx.icon className="w-5 h-5 relative z-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{tx.type}</h4>
                                    <div className="text-xs text-gray-400 font-medium truncate">{tx.desc}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-black text-sm text-gray-900 dark:text-white">
                                        ₦{Math.abs(tx.amount).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold mt-0.5 bg-gray-100 dark:bg-white/5 inline-block px-2 py-0.5 rounded-lg">
                                        {tx.date}
                                    </div>
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
