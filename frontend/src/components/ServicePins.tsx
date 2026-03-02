"use client";

import { Star, Smartphone, Zap, Download, Gamepad2, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";

const ALL_SERVICES = [
    {
        id: "airtime", name: "Airtime", icon: <Smartphone className="w-5 h-5" />,
        path: "/products/airtime-data",
        gradient: "from-blue-500 to-indigo-600",
        glow: "glow-blue",
        ring: "shadow-blue-500/30",
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-600 dark:text-blue-400",
    },
    {
        id: "data", name: "Data", icon: <Smartphone className="w-5 h-5" />,
        path: "/products/airtime-data",
        gradient: "from-indigo-500 to-violet-600",
        glow: "glow-purple",
        ring: "shadow-indigo-500/30",
        bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
        text: "text-indigo-600 dark:text-indigo-400",
    },
    {
        id: "electricity", name: "Electricity", icon: <Zap className="w-5 h-5" />,
        path: "/products/bill-payment?type=electricity",
        gradient: "from-yellow-400 to-orange-500",
        glow: "glow-amber",
        ring: "shadow-yellow-500/30",
        bg: "bg-yellow-500/10 dark:bg-yellow-500/15",
        text: "text-yellow-600 dark:text-yellow-400",
    },
    {
        id: "software", name: "Software", icon: <Download className="w-5 h-5" />,
        path: "/products/software",
        gradient: "from-purple-500 to-pink-600",
        glow: "glow-purple",
        ring: "shadow-purple-500/30",
        bg: "bg-purple-500/10 dark:bg-purple-500/15",
        text: "text-purple-600 dark:text-purple-400",
    },
    {
        id: "education", name: "Education", icon: <BookOpen className="w-5 h-5" />,
        path: "/products/education",
        gradient: "from-emerald-500 to-teal-600",
        glow: "glow-green",
        ring: "shadow-emerald-500/30",
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    {
        id: "betting", name: "Betting", icon: <Trophy className="w-5 h-5" />,
        path: "/products/betting",
        gradient: "from-orange-500 to-red-600",
        glow: "glow-red",
        ring: "shadow-orange-500/30",
        bg: "bg-orange-500/10 dark:bg-orange-500/15",
        text: "text-orange-600 dark:text-orange-400",
    },
];

export function ServicePins() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ALL_SERVICES.map((service) => (
                <Link
                    key={service.id}
                    href={service.path}
                    className="shine group relative p-5 bg-white dark:bg-zinc-900/80 rounded-3xl border border-gray-100/80 dark:border-white/5 hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                    {/* Ambient glow blob */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />

                    {/* Icon */}
                    <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${service.gradient} text-white flex items-center justify-center mb-4 shadow-lg ${service.ring} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        {/* Inner shine */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                        <span className="relative z-10">{service.icon}</span>
                    </div>

                    <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{service.name}</div>
                    <div className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${service.text}`}>Quick Access</div>

                    {/* Star */}
                    <Star className="absolute top-4 right-4 w-3 h-3 text-gray-200 dark:text-gray-700 group-hover:text-yellow-400 fill-current transition-colors duration-300" />
                </Link>
            ))}
        </div>
    );
}
