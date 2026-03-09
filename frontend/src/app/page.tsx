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
    { name: "Airtime", icon: Smartphone, href: "/products/airtime-data", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { name: "Bills", icon: Zap, href: "/products/bill-payment", bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
    { name: "Software", icon: Download, href: "/products/software", bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-600 dark:text-indigo-400" },
    { name: "Games", icon: Gamepad2, href: "/products/games", bg: "bg-pink-100 dark:bg-pink-900/30", color: "text-pink-600 dark:text-pink-400" },
    { name: "Education", icon: BookOpen, href: "/products/education", bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
    { name: "Betting", icon: Trophy, href: "/products/betting", bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" },
    { name: "Gift Cards", icon: Gift, href: "/products/giftcards", bg: "bg-rose-100 dark:bg-rose-900/30", color: "text-rose-600 dark:text-rose-400" },
];

const transactions = [
    { id: 1, type: "Data Purchase", desc: "MTN 10GB Monthly", amount: -3500, date: "Today, 10:23 AM", icon: Smartphone, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
    { id: 3, type: "Betting Fund", desc: "SportyBet Top-up", amount: -5000, date: "Yesterday, 2:30 PM", icon: Trophy, bg: "bg-pink-100 dark:bg-pink-900/30", color: "text-pink-600 dark:text-pink-400" },
    { id: 4, type: "Software License", desc: "Windows 11 Pro", amount: -15000, date: "24 Jan, 9:00 AM", icon: Download, bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-600 dark:text-indigo-400" },
];

const trustBadges = [
    { icon: Shield, label: "Bank-level Security", sub: "256-bit SSL Encryption" },
    { icon: Zap, label: "Instant Delivery", sub: "Avg. 3-second fulfillment" },
    { icon: Star, label: "Trusted by 10,000+", sub: "Happy customers nationwide" },
];

const heroSlides = [
    {
        badgeText: "Nigeria's #1 Digital Services Platform",
        badgeColor: "bg-[#293260]/40 border-white/10 text-[#a5b4fc]",
        badgeDot: "bg-indigo-400",
        titleLine1: "One App for",
        titleLine2: "Everything Digital.",
        titleLine2Style: "text-[#818cf8]",
        desc: "Pay bills, buy software, top-up games, and more. Instant delivery, zero transaction fees.",
        btn1Text: "Explore Products",
        btn1Link: "/products",
        btn1Icon: ArrowRight,
        btn1Class: "bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-xl glow-blue font-bold",
        btn2Text: "Create Free Account",
        btn2Link: "/auth/register",
        btn2Class: "bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 shadow-xl",
        bg: "linear-gradient(135deg, #101538 0%, #1e1b4b 100%)",
        glow: "bg-indigo-600/10",
        glow2: "bg-violet-600/10"
    },
    {
        badgeText: "Global Payments Instantly",
        badgeColor: "bg-white/10 border-white/20 text-white",
        titleLine1: "Your Virtual USD Card",
        titleLine2: "Is Here.",
        desc: "Pay for Netflix, Spotify, Amazon, and international software seamlessly without limits.",
        btn1Text: "Get Your Card",
        btn1Link: "/dashboard/virtual-cards",
        btn1Icon: ArrowRight,
        bg: "linear-gradient(135deg, #1C0F38 0%, #3B1B61 50%, #1e1b4b 100%)",
        btn1Class: "bg-white text-orange-600 hover:text-orange-700 hover:bg-white/90 shadow-xl font-bold",
        glow: "bg-fuchsia-600/20",
        glow2: "bg-purple-600/20"
    },
    {
        badgeText: "Instant Utility Top-Ups",
        titleLine1: "Never Run Out",
        titleLine2: "Of Airtime & Data.",
        desc: "Recharge any network in seconds. Enjoy fast routing and secure transactions across Nigeria.",
        btn1Text: "Top Up Now",
        btn1Link: "/products/airtime-data",
        btn1Icon: Zap,
        btn2Text: "View Packages",
        btn2Link: "/products",
        bg: "linear-gradient(135deg, #0f172a 0%, #0c3e60 40%, #0f172a 100%)",
        glow: "bg-sky-600/25",
        glow2: "bg-blue-600/20"
    }
];

function HeroCarouselMobile() {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % heroSlides.length);
                setAnimating(false);
            }, 300);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = heroSlides[current];

    return (
        <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500"
            style={{
                background: slide.bg,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.07)"
            }}>
            {/* Decorative glows */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${slide.glow} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500`} />
            <div className={`absolute bottom-0 left-0 w-[200px] h-[200px] ${slide.glow2} rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none transition-colors duration-500`} />
            {/* Top gloss line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Dot indicators positioned top-right INSIDE the card matching the reference */}
            <div className="absolute top-8 right-6 flex gap-1.5 z-20">
                {heroSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`rounded-full transition-all duration-300 ${i === current ? "bg-white w-5 h-1.5" : "bg-white/40 w-1.5 h-1.5"}`}
                    />
                ))}
            </div>

            <div className={`relative z-10 flex flex-col items-start p-6 pb-8 pt-6 transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 ${slide.badgeColor || 'bg-white/10 border-white/20 text-white'} border rounded-full text-[9px] font-black mb-6 backdrop-blur-md uppercase tracking-widest`}>
                    {slide.badgeDot ? (
                        <span className={`w-1.5 h-1.5 rounded-full ${slide.badgeDot} animate-pulse`} />
                    ) : (
                        <Sparkles className="w-2.5 h-2.5 text-white/70" />
                    )} {slide.badgeText}
                </div>
                <h1 className="text-[28px] font-bold mb-3 leading-[1.1] tracking-tight text-white pr-4">
                    {slide.titleLine1} <br /> <span className={slide.titleLine2Style || "text-white"}>{slide.titleLine2}</span>
                </h1>
                <p className="text-white/80 text-[14px] mb-6 leading-relaxed font-medium max-w-[95%]">
                    {slide.desc}
                </p>
                <div className="flex flex-col w-full gap-3 mt-auto">
                    <Link href={slide.btn1Link} className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl w-full text-[15px] transition-all duration-300 ${slide.btn1Class || 'bg-white text-orange-600 hover:bg-white/90 shadow-xl font-bold'}`}>
                        {slide.btn1Text} {slide.btn1Icon && <slide.btn1Icon className="w-4 h-4" />}
                    </Link>
                    {(slide as any).btn2Text && (
                        <Link href={(slide as any).btn2Link} className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl w-full text-[15px] transition-all duration-300 ${(slide as any).btn2Class}`}>
                            {(slide as any).btn2Text}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] pb-24 md:pb-0 overflow-x-hidden">
            <Navbar />

            {/* ── Hero Section ── */}
            <div className="pt-24 pb-8 px-4 sm:px-6 container mx-auto">
                {/* ── Mobile Layout (Carousel First, then Quick Actions) ── */}
                <div className="block md:hidden">
                    <div className="mb-8">
                        <HeroCarouselMobile />
                    </div>

                    <div className="mb-10">
                        <h2 className="text-[14px] font-black text-indigo-900 dark:text-indigo-200 mb-4 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
                            <Zap className="w-4 h-4 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> Quick Actions
                        </h2>
                        <div className="grid grid-cols-4 gap-3">
                            {quickActions.map((action) => (
                                <Link key={action.name} href={action.href} className="flex flex-col items-center gap-2 group">
                                    <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                                        <action.icon className={`w-6 h-6 ${action.color}`} />
                                    </div>
                                    <span className="text-[11px] font-black text-gray-700 dark:text-gray-300 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-wider">
                                        {action.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Hero Static */}
                <div className="hidden md:block shine relative overflow-hidden rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-2xl"
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

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="flex-1 max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                                One Platform <br />
                                to Power <span className="text-gradient-blue">Everything</span>
                            </h1>
                            <p className="text-gray-300 text-lg mb-8 max-w-xl font-medium leading-relaxed">
                                Join over 10,000+ users securely paying bills, buying software licenses, and shopping globally with instant delivery.
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <Link href="/products" className="btn-premium px-8 py-4 bg-indigo-600 text-white rounded-2xl glow-blue flex items-center gap-2">
                                    Explore <ArrowRight className="w-4 h-4" />
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

                {/* ── Desktop Quick Actions ── */}
                <div className="hidden md:block mb-12">
                    <h2 className="text-[15px] font-black text-indigo-900 dark:text-indigo-200 mb-6 uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-md">
                        <Zap className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-7 gap-3">
                        {quickActions.map((action) => (
                            <Link key={action.name} href={action.href} className="flex flex-col items-center gap-2.5 group">
                                <div className={`w-16 h-16 rounded-3xl ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                                    <action.icon className={`w-7 h-7 ${action.color}`} />
                                </div>
                                <span className="text-[12px] font-black text-gray-700 dark:text-gray-300 text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-wider">
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
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 drop-shadow-sm">
                            <Clock className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" /> Recent Activity
                        </h2>
                        <Link href="/dashboard/history" className="text-xs text-indigo-600 dark:text-indigo-400 font-black hover:underline">See All</Link>
                    </div>
                    <div className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-gray-100 dark:border-white/5 p-2 space-y-1 shadow-sm"
                        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                        {transactions.map((tx) => (
                            <div key={tx.id} className="shine group p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all duration-300 cursor-pointer">
                                <div className={`w-10 h-10 rounded-xl ${tx.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                    <tx.icon className={`w-4 h-4 ${tx.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{tx.type}</h4>
                                    <div className="text-xs text-gray-400 font-medium truncate">{tx.desc}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                                        ₦{Math.abs(tx.amount).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium mt-0.5 bg-gray-100 dark:bg-white/5 inline-block px-2 py-0.5 rounded-lg">
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
