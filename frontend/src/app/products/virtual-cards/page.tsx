"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";

export default function VirtualCards() {
    return (
        <main className="min-h-screen bg-[#0f172a] text-white pb-24 md:pb-0">
            <Navbar />

            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 rotate-12">
                        <CreditCard className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
                        Global Spending Power<br className="hidden sm:block" /> Coming Soon.
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                        We&apos;re building the ultimate virtual dollar card for your international payments.
                        Subscriptions, shopping, and more — without limits.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Join Waitlist
                        </button>
                        <Link href="/" className="px-8 py-4 bg-white/10 border border-white/20 rounded-full font-bold hover:bg-white/20 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
