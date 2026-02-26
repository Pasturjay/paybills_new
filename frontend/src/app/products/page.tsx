import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Smartphone, Zap, Tv, BookOpen, Trophy, Gamepad2, Gift, ArrowRight, Download } from "lucide-react";

const products = [
    {
        category: "Utilities",
        items: [
            { name: "Airtime & Data", icon: Smartphone, href: "/products/airtime-data", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", desc: "Instant top-up for all networks" },
            { name: "Electricity", icon: Zap, href: "/products/bill-payment", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", desc: "Pay prepaid & postpaid bills" },
            { name: "Cable TV", icon: Tv, href: "/products/bill-payment", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", desc: "DSTV, GOTV & Startimes" },
        ]
    },
    {
        category: "Lifestyle",
        items: [
            { name: "Education", icon: BookOpen, href: "/products/education", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", desc: "WAEC, NECO & JAMB Pins" },
            { name: "Betting", icon: Trophy, href: "/products/betting", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", desc: "Fund your betting wallets" },
            { name: "Games", icon: Gamepad2, href: "/products/games", color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", desc: "Top-up PUBG, Free Fire & more" },
            { name: "Gift Cards", icon: Gift, href: "/products/giftcards", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", desc: "Amazon, Apple & Google Play" },
            { name: "Software Store", icon: Download, href: "/products/software", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", desc: "Windows, Office, Adobe & Antivirus" },
        ]
    }
];

export default function ProductsHub() {
    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950">
            <Navbar />

            <section className="pt-32 pb-12 bg-gray-50 dark:bg-zinc-900/50">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">All Products</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Everything you need to manage your digital life, all in one place.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-6 max-w-5xl">
                    {products.map((section, idx) => (
                        <div key={idx} className="mb-16">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-blue-600 pl-4">
                                {section.category}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item, i) => (
                                    <Link key={i} href={item.href} className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                                <item.icon className="w-7 h-7" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
