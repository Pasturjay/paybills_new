"use client";

import Link from "next/link";
import { Bell, Wallet, ArrowUpRight, Zap, Gift, Smartphone, Gamepad2, BookOpen, Download, CreditCard, Clock } from "lucide-react";
import { useTransactions } from "@/hooks/useData";
import { WalletChart } from "./WalletChart";
import { ServicePins } from "./ServicePins";
import { SkeletonLoader } from "./ui/Skeleton";
import { getTransactionIcon, getTransactionStyle, isTransactionCredit } from "@/lib/transactionHelpers";

export function NewDashboardDesktopView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const { transactions, isLoading: txLoading } = useTransactions();

    return (
        <div className="hidden md:block p-8 pt-6">
            {/* ── Top Bar ── */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-gradient-blue">{user.firstName}</span>
                    </h1>
                    <p className="text-gray-300 text-[15px] font-bold mt-1">Your financial console — everything in one place.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-3 bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-white/10 transition-colors shadow-sm">
                        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-900 pulse-glow" />
                    </button>
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                            {user.firstName?.[0]}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Hero Grid ── */}
            <div className="grid grid-cols-12 gap-6 mb-10">
                {/* Balance Card */}
                <div
                    className="shine col-span-8 rounded-[2.5rem] p-8 text-white relative overflow-hidden min-h-[260px]"
                    style={{
                        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
                        boxShadow: "0 32px 80px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.07) inset"
                    }}
                >
                    {/* Gloss */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                    {/* Glow blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-indigo-200/60 mb-2 text-xs font-black uppercase tracking-widest">Available Balance</div>
                                    <div className="text-5xl font-black tracking-tighter">
                                        ₦{Number(balance?.balance || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 float glow-white">
                                    <Wallet className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onAddMoney}
                                className="shine btn-premium bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-2xl font-black text-[15px] flex items-center gap-2 glow-blue"
                            >
                                <ArrowUpRight className="w-4 h-4" /> Top up
                            </button>
                            <button
                                onClick={onSendMoney}
                                className="shine btn-premium bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-2xl font-black text-[15px] hover:bg-white/20 transition-all flex items-center gap-2 shadow-xl"
                            >
                                <Gift className="w-4 h-4" /> Gift Users
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cashflow Chart */}
                <div className="col-span-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-xl relative overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Cashflow</div>
                            <div className="text-lg font-black text-gray-900 dark:text-white">Trend</div>
                        </div>
                        <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-xl border border-emerald-500/20">+12.4%</div>
                    </div>
                    <WalletChart transactions={transactions} />
                </div>
            </div>

            {/* ── Pinned Services ── */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        Pinned Services
                        <div className="h-[2px] w-10 bg-gradient-to-r from-indigo-500 to-transparent rounded-full" />
                    </h2>
                    <Link href="/dashboard/services" className="text-xs font-black text-indigo-500 hover:text-indigo-400 transition-colors">
                        All Services →
                    </Link>
                </div>
                <ServicePins />
            </div>

            {/* ── Transactions ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent pointer-events-none" />
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-500" /> Recent Ledger
                    </h2>
                    <Link href="/dashboard/history" className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-black hover:bg-indigo-500 hover:text-white transition-all duration-300">
                        View All
                    </Link>
                </div>

                {txLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <SkeletonLoader key={i} type="list" />)}
                    </div>
                ) : transactions?.length === 0 ? (
                    <div className="text-center py-20">
                        <Clock className="w-16 h-16 text-gray-100 dark:text-white/5 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Vault is Empty</h3>
                        <p className="text-gray-400 text-sm">Synchronize your first transaction to view data.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx: any) => {
                            const isCredit = isTransactionCredit(tx);
                            const styleClass = getTransactionStyle(tx.type, tx.description, isCredit);
                            return (
                                <div key={tx.id} className="shine group p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/5 hover:border-indigo-400/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${styleClass} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                            <span className="relative z-10">{getTransactionIcon(tx.type, tx.description)}</span>
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 dark:text-white text-sm group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                {tx.description || tx.type.replace(/_/g, " ")}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                                <span className={`px-2 py-0.5 rounded-full ${tx.status === "SUCCESS" ? "bg-green-100 text-green-600 dark:bg-green-500/10" : tx.status === "PENDING" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-black ${isCredit ? "text-emerald-500" : "text-gray-900 dark:text-white"}`}>
                                            {isCredit ? "+" : "−"}₦{parseFloat(tx.amount || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium bg-gray-100 dark:bg-white/5 inline-block px-2 py-1 rounded-lg mt-1">
                                            {tx.reference?.slice(0, 8)}…
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}
