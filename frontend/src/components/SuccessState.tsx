"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Share2, Download, Home, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

interface SuccessStateProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    amount?: string;
    recipient?: string;
}

export function SuccessState({ isOpen, onClose, title, message, amount, recipient }: SuccessStateProps) {
    useEffect(() => {
        if (isOpen) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden text-center p-8 border border-white/10"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-10 h-10" />
                        </motion.div>

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                            {message}
                        </p>

                        {amount && (
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-6">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Transaction Amount</div>
                                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₦{amount}</div>
                                {recipient && <div className="text-xs text-slate-500 mt-1">Sent to {recipient}</div>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-colors">
                                <Download className="w-4 h-4" /> Receipt
                            </button>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                            >
                                <Home className="w-4 h-4" /> Back Home
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-slate-500 hover:text-slate-700 dark:hover:text-white font-bold text-sm"
                            >
                                New Transaction
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
