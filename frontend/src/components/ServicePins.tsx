"use client";

import { Star, Smartphone, Zap, Download, Gamepad2, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";

const ALL_SERVICES = [
    { id: 'airtime', name: "Airtime", icon: <Smartphone className="w-5 h-5" />, path: "/products/airtime-data", color: "bg-blue-500" },
    { id: 'data', name: "Data", icon: <Smartphone className="w-5 h-5" />, path: "/products/airtime-data", color: "bg-indigo-500" },
    { id: 'electricity', name: "Electricity", icon: <Zap className="w-5 h-5" />, path: "/products/bill-payment?type=electricity", color: "bg-yellow-500" },
    { id: 'software', name: "Software", icon: <Download className="w-5 h-5" />, path: "/products/software", color: "bg-purple-500" },
    { id: 'education', name: "Education", icon: <BookOpen className="w-5 h-5" />, path: "/products/education", color: "bg-green-500" },
    { id: 'betting', name: "Betting", icon: <Trophy className="w-5 h-5" />, path: "/products/betting", color: "bg-orange-500" },
];

export function ServicePins() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ALL_SERVICES.map((service) => (
                <Link
                    key={service.id}
                    href={service.path}
                    className="group relative p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                >
                    <div className={`w-10 h-10 rounded-2xl ${service.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        {service.icon}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{service.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">Quick Access</div>
                    <Star className="absolute top-4 right-4 w-3 h-3 text-gray-200 dark:text-gray-700 group-hover:text-yellow-400 fill-current transition-colors" />
                </Link>
            ))}
        </div>
    );
}
