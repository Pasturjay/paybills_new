"use client";

import { Eye, EyeOff, Wallet, ArrowDownLeft, Gift, Smartphone, Zap, Download, Gamepad2, BookOpen, Trophy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import GiftCardModal from "./GiftCardModal";
import { useTransactions } from "@/hooks/useData";
import { SkeletonLoader } from "./ui/Skeleton";
import { getTransactionIcon, getTransactionStyle, isTransactionCredit } from "@/lib/transactionHelpers";

export function DashboardMobileView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const [showBalance, setShowBalance] = useState(true);
    const { transactions, isLoading: txLoading } = useTransactions();
    const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState(false);

    const quickActions = [
        { label: "Top Up", icon: Wallet, gradient: "from-indigo-500 to-violet-600", action: onAddMoney },
        { label: "Gift", icon: Gift, gradient: "from-emerald-500 to-teal-600", action: onSendMoney },
        { label: "History", icon: ArrowDownLeft, gradient: "from-amber-400 to-orange-500", action: () => { window.location.href = "/dashboard/history"; } },
        { label: "Services", icon: Smartphone, gradient: "from-pink-500 to-rose-600", action: () => { window.location.href = "/products"; } },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a14] text-white pb-28 md:hidden font-sans overflow-x-hidden">

            {/* ── Balance Hero ── */}
            <div className="relative overflow-hidden px-5 pt-12 pb-8 mx-4 mt-5 rounded-[2.5rem]"
                style={{
                    background: "linear-gradient(135deg, #13123a 0%, #1e1b4b 50%, #13123a 100%)",
                    boxShadow: "0 24px 64px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.07) inset"
                }}
            >
                {/* Top gloss */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                {/* Glow blobs */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/30 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-600/20 rounded-full blur-[40px] pointer-events-none" />

                <div className="relative z-10">
                    {/* Greeting */}
                    <div className="text-indigo-200/60 text-xs font-black uppercase tracking-[0.2em] mb-1">Good day,</div>
                    <div className="text-white/90 font-black text-lg mb-6 truncate">
                        {user.firstName} {user.lastName}
                    </div>

                    {/* Amount */}
                    <div className="flex items-end gap-3 mb-2">
                        <div className="text-5xl font-black tracking-tighter leading-none">
                            {showBalance ? `₦${Number(balance?.balance || 0).toLocaleString()}` : "••••••"}
                        </div>
                        <button onClick={() => setShowBalance(!showBalance)} className="mb-1 p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                            {showBalance ? <EyeOff className="w-4 h-4 text-indigo-300" /> : <Eye className="w-4 h-4 text-indigo-300" />}
                        </button>
                    </div>
                    <div className="text-indigo-200/40 text-xs font-bold uppercase tracking-widest mb-6">Available Balance</div>

                    {/* CTA row */}
                    <div className="flex gap-3">
                        <button
                            onClick={onAddMoney}
                            className="shine flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 glow-blue btn-premium"
                        >
                            <Wallet className="w-4 h-4" /> Top Up
                        </button>
                        <button
                            onClick={onSendMoney}
                            className="shine flex-1 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 hover:bg-white/15 transition-all shadow-md btn-premium"
                        >
                            <Gift className="w-4 h-4" /> Gift
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="px-5 mt-8">
                <div className="grid grid-cols-4 gap-4">
                    {quickActions.map((a) => (
                        <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-2.5 group">
                            <div className={`shine relative w-14 h-14 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300`}>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                                <a.icon className="w-6 h-6 relative z-10" />
                            </div>
                            <span className="text-[11px] font-black text-gray-300 uppercase tracking-wider group-hover:text-indigo-400 transition-colors drop-shadow-sm">
                                {a.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Services ── */}
            <div className="px-5 mt-10">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-base font-black text-white">Services</h2>
                    <Link href="/products" className="text-xs font-black text-indigo-400">See All →</Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { name: "Airtime", icon: Smartphone, href: "/products/airtime-data", gradient: "from-blue-500 to-indigo-600" },
                        { name: "Electricity", icon: Zap, href: "/products/bill-payment", gradient: "from-amber-400 to-orange-500" },
                        { name: "Software", icon: Download, href: "/products/software", gradient: "from-violet-500 to-purple-600" },
                        { name: "Games", icon: Gamepad2, href: "/products/games", gradient: "from-pink-500 to-rose-600" },
                        { name: "Education", icon: BookOpen, href: "/products/education", gradient: "from-emerald-500 to-teal-600" },
                        { name: "Betting", icon: Trophy, href: "/products/betting", gradient: "from-orange-500 to-red-600" },
                    ].map((svc) => (
                        <Link key={svc.name} href={svc.href} className="shine group flex flex-col items-center gap-2.5 p-4 bg-zinc-900/80 border border-white/5 rounded-3xl hover:border-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300">
                            <div className={`shine relative w-12 h-12 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                                <svc.icon className="w-5 h-5 relative z-10 drop-shadow-md" />
                            </div>
                            <span className="text-[11px] font-black text-gray-300 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">{svc.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Transactions ── */}
            <div className="px-5 mt-10">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-base font-black text-white">Recent Ledger</h2>
                    <Link href="/dashboard/history" className="text-xs font-black text-indigo-400">View All →</Link>
                </div>

                {txLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <SkeletonLoader key={i} type="list" />)}
                    </div>
                ) : !transactions?.length ? (
                    <div className="text-center py-16 bg-zinc-900/60 rounded-3xl border border-white/5">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ArrowDownLeft className="w-7 h-7 text-gray-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx: any) => {
                            const isCredit = isTransactionCredit(tx);
                            const styleClass = getTransactionStyle(tx.type, tx.description, isCredit);
                            return (
                                <div key={tx.id} className="shine group p-4 bg-zinc-900/80 border border-white/5 rounded-3xl flex items-center justify-between hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${styleClass} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                                            <span className="relative z-10">{getTransactionIcon(tx.type, tx.description)}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm group-hover:text-indigo-300 transition-colors truncate max-w-[150px]">
                                                {tx.description || tx.type?.replace(/_/g, " ")}
                                            </h4>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                                {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-black text-sm ${isCredit ? "text-emerald-400" : "text-white"}`}>
                                            {isCredit ? "+" : "−"}₦{Number(tx.amount || 0).toLocaleString()}
                                        </div>
                                        <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${tx.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" : tx.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
                                            {tx.status}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isGiftCardModalOpen && <GiftCardModal isOpen={isGiftCardModalOpen} onClose={() => setIsGiftCardModalOpen(false)} />}
        </div>
    );
}
