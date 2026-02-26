"use client";

import { CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VirtualCardsPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <CreditCard className="w-12 h-12" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Virtual Cards
            </h1>

            <div className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold mb-6">
                COMING SOON
            </div>

            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10">
                We are building a robust virtual card system for your international payments. Stay tuned!
            </p>

            <Link
                href="/dashboard"
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold transition-transform hover:scale-105 flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
        </div>
    );
}
