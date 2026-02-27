"use client";

import Link from "next/link";
import { Search, Bell, Wallet, ArrowUpRight, Zap, Gift, Smartphone, Gamepad2, BookOpen, Download, CreditCard, Clock } from "lucide-react";
import { useTransactions } from "@/hooks/useData";
import { WalletChart } from "./WalletChart";
import { ServicePins } from "./ServicePins";
import { SkeletonLoader } from "./ui/Skeleton";

export function NewDashboardDesktopView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const { transactions, isLoading: txLoading } = useTransactions();

    const getTransactionIcon = (type: string, description: string) => {
        const descLower = description?.toLowerCase() || '';
        if (descLower.includes('airtime') || descLower.includes('data')) return <Smartphone className="w-5 h-5" />;
        if (descLower.includes('electricity')) return <Zap className="w-5 h-5" />;
        if (descLower.includes('software')) return <Download className="w-5 h-5" />;
        if (descLower.includes('bet') || descLower.includes('sport')) return <Gamepad2 className="w-5 h-5" />;
        if (descLower.includes('education')) return <BookOpen className="w-5 h-5" />;
        return <CreditCard className="w-5 h-5" />;
    };

    return (
        <div className="hidden md:block p-8 pt-6">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">System Console</h1>
                    <p className="text-gray-500 text-sm font-medium">Operator: {user.firstName} {user.lastName}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find logs..."
                            className="w-64 pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border-transparent dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-zinc-900 border transition-all text-sm font-medium"
                        />
                    </div>
                    <button className="relative p-2 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[14px] flex items-center justify-center text-indigo-500 font-black text-sm uppercase">
                            {user.firstName?.[0]}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-10">
                {/* Hero Balance Card */}
                <div className="col-span-8 mesh-gradient-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 min-h-[280px] border border-white/10 group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-indigo-100/70 mb-1 text-xs font-black uppercase tracking-widest">Available Credit</div>
                                    <div className="text-5xl font-black tracking-tighter mb-4">
                                        ₦{Number(balance?.balance || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={onAddMoney} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4" /> Add Funds
                            </button>
                            <button onClick={onSendMoney} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all flex items-center gap-2">
                                <Gift className="w-4 h-4" /> Transfer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Growth Chart */}
                <div className="col-span-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Cashflow Trend</div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">Active Growth</div>
                        </div>
                        <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg">+12.4%</div>
                    </div>
                    <WalletChart transactions={transactions} />
                </div>
            </div>

            {/* Service Pins Area */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        Pinned Services <div className="w-8 h-[2px] bg-indigo-500/30"></div>
                    </h2>
                </div>
                <ServicePins />
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Recent Ledger Entries</h2>
                    <Link href="/dashboard/history" className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-black hover:bg-indigo-500 hover:text-white transition-all">Export Report</Link>
                </div>

                {txLoading ? (
                    <div className="space-y-4">
                        <SkeletonLoader type="list" />
                        <SkeletonLoader type="list" />
                        <SkeletonLoader type="list" />
                    </div>
                ) : transactions?.length === 0 ? (
                    <div className="text-center py-20">
                        <Clock className="w-16 h-16 text-gray-100 dark:text-white/5 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Vault is Empty</h3>
                        <p className="text-gray-500 text-sm">Synchronize your first transaction to view data.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((tx: any) => {
                            const isCredit = tx.type === 'FUNDING' || (tx.type === 'P2P_TRANSFER' && tx.reference?.includes('_CR'));
                            return (
                                <div key={tx.id} className="group p-4 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-transparent hover:border-indigo-500/20 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCredit ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'} group-hover:scale-110 transition-transform`}>
                                            {getTransactionIcon(tx.type, tx.description)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 dark:text-white text-base">{tx.description || tx.type.replace(/_/g, ' ')}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                {new Date(tx.createdAt).toLocaleDateString()} <span className="w-1 h-1 bg-gray-300 rounded-full"></span> {tx.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-black ${isCredit ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                                            {isCredit ? '+' : '-'}₦{parseFloat(tx.amount || 0).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">Ref: {tx.reference?.slice(0, 10)}...</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
