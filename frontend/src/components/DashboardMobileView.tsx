"use client";

import { Eye, EyeOff, Smartphone, Zap, Wallet, Send, Download, Gamepad2, BookOpen, Clock, CreditCard, ArrowDownLeft, Star, ChevronRight, Gift } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServiceModal } from "./ServiceModal";
import GiftCardModal from "./GiftCardModal";
import { useTransactions } from "@/hooks/useData";
import { SkeletonLoader } from "./ui/Skeleton";

export function DashboardMobileView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const [showBalance, setShowBalance] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const router = useRouter();
    const { transactions, isLoading: txLoading } = useTransactions();

    const handleQuickAction = (id: string) => {
        const routes: any = {
            'airtime': '/dashboard/services/airtime',
            'data': '/dashboard/services/data',
            'electricity': '/dashboard/services/electricity',
            'software': '/dashboard/services/software',
            'education': '/dashboard/services/education',
            'betting': '/dashboard/services/betting'
        };
        if (routes[id]) {
            router.push(routes[id]);
        } else {
            setActiveModal(id);
        }
    };

    const getTransactionIcon = (type: string, description: string) => {
        const descLower = description?.toLowerCase() || '';
        if (descLower.includes('airtime') || descLower.includes('data')) return <Smartphone className="w-5 h-5" />;
        if (descLower.includes('electricity')) return <Zap className="w-5 h-5" />;
        if (descLower.includes('software')) return <Download className="w-5 h-5" />;
        if (descLower.includes('bet') || descLower.includes('sport')) return <Gamepad2 className="w-5 h-5" />;
        if (descLower.includes('education')) return <BookOpen className="w-5 h-5" />;
        return <CreditCard className="w-5 h-5" />;
    };

    const getTransactionStyle = (type: string, description: string, isCredit: boolean) => {
        if (isCredit) return "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/20 border-green-500/30";

        const descLower = description?.toLowerCase() || '';
        if (descLower.includes('airtime') || descLower.includes('data')) return "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-blue-500/30";
        if (descLower.includes('electricity')) return "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 border-amber-500/30";
        if (descLower.includes('software')) return "bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white shadow-lg shadow-purple-500/20 border-purple-500/30";
        if (descLower.includes('bet') || descLower.includes('sport')) return "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-rose-500/20 border-rose-500/30";
        if (descLower.includes('education')) return "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20 border-cyan-500/30";

        return "bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/20 border-gray-500/30";
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-white pb-24 md:hidden font-sans overflow-x-hidden">

            {/* Header / Mesh Section */}
            <div className="mesh-gradient h-[320px] rounded-b-[3.5rem] p-8 pt-12 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/30">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-white/70 text-sm font-bold tracking-tight">System Operator</h2>
                            <p className="text-white text-2xl font-black">{user.firstName}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center font-black text-white">
                            {user.firstName?.[0]}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-black uppercase tracking-widest">
                            Main Vault Balance
                            <button onClick={() => setShowBalance(!showBalance)}>
                                {showBalance ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                        </div>
                        <div className="text-5xl font-black text-white tracking-tighter transition-all">
                            {showBalance ? `₦${Number(balance?.balance || 0).toLocaleString()}` : "••••••••"}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <button onClick={onAddMoney} className="flex-1 bg-white text-indigo-600 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/20 active:scale-95 transition-all">
                        <Wallet className="w-4 h-4" /> Top up
                    </button>
                    <button onClick={onSendMoney} className="flex-1 bg-indigo-500 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/20 active:scale-95 transition-all border border-indigo-400">
                        <Gift className="w-4 h-4" /> Gift Users
                    </button>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-20 space-y-10">

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-4 gap-4 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-gray-100 dark:border-white/5">
                    {[
                        { id: 'airtime', name: "Airtime", icon: <Smartphone className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { id: 'data', name: "Data", icon: <Smartphone className="w-5 h-5" />, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                        { id: 'electricity', name: "Bills", icon: <Zap className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { id: 'gift_cards', name: "Gift", icon: <Star className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                    ].map((item) => (
                        <button key={item.id} onClick={() => handleQuickAction(item.id)} className="flex flex-col items-center gap-2">
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} active:scale-90 transition-all`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">{item.name}</span>
                        </button>
                    ))}
                </div>

                {/* More Services Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-lg tracking-tight">Ecosystem</h3>
                        <Link href="/dashboard/services" className="text-xs font-black text-indigo-500 flex items-center">
                            Explore All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {[
                            { id: 'software', name: "Digital Tools", desc: "Software & Downloads", icon: <Download />, color: "bg-emerald-500" },
                            { id: 'betting', name: "Entertainment", desc: "Betting & Games", icon: <Gamepad2 />, color: "bg-rose-500" },
                            { id: 'education', name: "Study Space", desc: "WAEC, JAMB, Exams", icon: <BookOpen />, color: "bg-blue-500" },
                        ].map(svc => (
                            <button key={svc.id} onClick={() => handleQuickAction(svc.id)} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-all">
                                <div className={`w-12 h-12 rounded-2xl ${svc.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
                                    {svc.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-black text-sm">{svc.name}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{svc.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ledger */}
                <div>
                    <h3 className="font-black text-lg mb-4 tracking-tight">Recent Ledger</h3>
                    {txLoading ? (
                        <SkeletonLoader type="list" />
                    ) : transactions?.length === 0 ? (
                        <div className="py-12 text-center bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-400 uppercase">No active records</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map((tx: any) => {
                                const isCredit = tx.type === 'FUNDING' || (tx.type === 'P2P_TRANSFER' && tx.reference?.includes('_CR'));
                                const styleClass = getTransactionStyle(tx.type, tx.description, isCredit);
                                return (
                                    <div key={tx.id} className="p-4 bg-white dark:bg-zinc-900 rounded-3xl flex items-center justify-between border border-gray-50 dark:border-white/5 relative overflow-hidden shadow-sm shadow-indigo-500/5 hover:border-indigo-500/30 transition-all">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent -translate-x-full opacity-0 hover:opacity-100 hover:animate-[shimmer_1.5s_infinite]"></div>
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styleClass} scale-100 active:scale-95 transition-transform`}>
                                                {getTransactionIcon(tx.type, tx.description)}
                                            </div>
                                            <div>
                                                <div className="font-black text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[140px]">{tx.description || tx.type.replace(/_/g, ' ')}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] ${tx.status === 'SUCCESS' ? 'text-green-600' : tx.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-black text-[15px] sm:text-base relative z-10 ${isCredit ? 'text-green-500' : 'text-zinc-900 dark:text-white'}`}>
                                            {isCredit ? '+' : '-'}₦{parseFloat(tx.amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Service & Gift Card Modals */}
            {activeModal && activeModal !== 'gift_cards' && (
                <ServiceModal
                    service={{ title: activeModal.toUpperCase(), icon: null }}
                    onClose={() => setActiveModal(null)}
                />
            )}
            <GiftCardModal isOpen={activeModal === 'gift_cards'} onClose={() => setActiveModal(null)} />
        </div>
    );
}
