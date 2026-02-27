import { Eye, EyeOff, Smartphone, Wifi, Tv, Zap, Wallet, Send, Gamepad2, BookOpen, Download, Trophy, Gift, Clock, CreditCard, ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ServiceModal } from "./ServiceModal";
import GiftCardModal from "./GiftCardModal";
import { useTransactions } from "@/hooks/useData";

export function DashboardMobileView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const [showBalance, setShowBalance] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const router = useRouter();
    const { transactions, isLoading: txLoading } = useTransactions();

    const handleQuickAction = (id: string) => {
        if (id === 'education') {
            router.push('/products/education');
            return;
        }
        if (id === 'software') {
            router.push('/products/software');
            return;
        }
        if (id === 'betting') {
            router.push('/products/betting');
            return;
        }
        if (id === 'airtime' || id === 'data') {
            router.push('/products/airtime-data');
            return;
        }
        if (id === 'electricity') {
            router.push('/products/bill-payment?type=electricity');
            return;
        }
        setActiveModal(id);
    };

    const getServiceName = (id: string) => {
        switch (id) {
            case 'airtime': return 'Airtime';
            case 'data': return 'Data Bundles';
            case 'electricity': return 'Electricity';
            case 'software': return 'Software';
            case 'betting': return 'Betting';
            case 'education': return 'Education';
            default: return '';
        }
    };

    const getTransactionIcon = (type: string, description: string) => {
        if (type === 'FUNDING') return <ArrowDownLeft className="w-5 h-5" />;
        if (type === 'P2P_TRANSFER') return <Send className="w-5 h-5" />;

        const descLower = description?.toLowerCase() || '';
        if (descLower.includes('airtime') || descLower.includes('data')) return <Smartphone className="w-5 h-5" />;
        if (descLower.includes('electricity')) return <Zap className="w-5 h-5" />;
        if (descLower.includes('tv') || descLower.includes('cable') || descLower.includes('dstv') || descLower.includes('gotv')) return <Tv className="w-5 h-5" />;
        if (descLower.includes('bet') || descLower.includes('sport')) return <Gamepad2 className="w-5 h-5" />;
        if (descLower.includes('education') || descLower.includes('waec') || descLower.includes('jamb')) return <BookOpen className="w-5 h-5" />;
        if (descLower.includes('software')) return <Download className="w-5 h-5" />;

        return <CreditCard className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white pb-24 md:hidden font-sans pt-4">

            {/* Mobile Sidebar usage is moved to Layout, so we remove internal drawer logic */}

            <div className="px-6 space-y-6">
                {/* Welcome & Balance Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Welcome back, {user.firstName}</h2>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    {balance === null ? (
                        <div className="relative z-10 animate-pulse">
                            {/* ... (Skeleton) ... */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-4 bg-white/20 rounded w-24"></div>
                                <div className="h-4 bg-white/20 rounded w-4"></div>
                            </div>
                            <div className="h-10 bg-white/20 rounded w-48 mb-8"></div>
                            <div className="flex gap-3">
                                <div className="flex-1 h-12 bg-white/20 rounded-xl"></div>
                                <div className="flex-1 h-12 bg-white/20 rounded-xl"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-blue-100 text-sm font-medium">Available Balance</span>
                                <button onClick={() => setShowBalance(!showBalance)} className="text-blue-200">
                                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="text-3xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                {showBalance ? `₦${Number(balance?.balance || 0).toLocaleString()}` : "••••••••"}
                                <button onClick={onAddMoney} className="bg-white/20 p-1.5 rounded-full" title="Fund Wallet">
                                    <div className="w-3 h-3 flex items-center justify-center font-bold">+</div>
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={onAddMoney} className="flex-1 bg-white text-blue-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                                    <Wallet className="w-4 h-4" /> Top-up
                                </button>
                                <button onClick={onSendMoney} className="flex-1 bg-blue-500/30 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10">
                                    <Send className="w-4 h-4" /> Gift User
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Quick Actions</h2>
                        <Link href="/dashboard/services" className="text-xs text-blue-500 font-medium">See all</Link>
                    </div>
                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                        {[
                            { id: 'airtime', name: "Airtime", icon: <Smartphone className="w-6 h-6" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                            { id: 'electricity', name: "Bills", icon: <Zap className="w-6 h-6" />, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                            { id: 'software', name: "Software", icon: <Download className="w-6 h-6" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                            { id: 'betting', name: "Games", icon: <Gamepad2 className="w-6 h-6" />, color: "text-pink-500", bg: "bg-pink-500/10" },
                            { id: 'education', name: "Education", icon: <BookOpen className="w-6 h-6" />, color: "text-green-500", bg: "bg-green-500/10" },
                            { id: 'betting', name: "Betting", icon: <Trophy className="w-6 h-6" />, color: "text-orange-500", bg: "bg-orange-500/10" },
                            { id: 'gift_cards', name: "Gift Cards", icon: <Gift className="w-6 h-6" />, color: "text-red-500", bg: "bg-red-500/10" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickAction(item.id)}
                                className="flex flex-col items-center gap-3 min-w-[72px]"
                            >
                                <div className={`w-16 h-16 rounded-[1.5rem] ${item.bg} flex items-center justify-center ${item.color} shadow-sm border border-white/5`}>
                                    {item.icon}
                                </div>
                                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div>
                    <h2 className="font-bold text-lg mb-4">Recent Transactions</h2>

                    {txLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : transactions?.length === 0 ? (
                        <div className="text-center py-12 bg-[#1e293b]/50 rounded-2xl border border-gray-800">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-md font-bold text-white mb-2">No Transactions Yet</h3>
                            <p className="text-gray-500 text-xs px-4">Your recent activity will appear here once you start using the platform.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions?.slice(0, 5).map((tx: any) => {
                                const isCredit = tx.type === 'FUNDING' || (tx.type === 'P2P_TRANSFER' && tx.reference?.includes('_CR'));
                                return (
                                    <div key={tx.id} className="bg-[#1e293b]/50 p-4 rounded-2xl flex items-center justify-between border border-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {getTransactionIcon(tx.type, tx.description)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white truncate max-w-[150px]">{tx.description || tx.type.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-bold text-sm ${isCredit ? 'text-green-500' : 'text-white'}`}>
                                            {isCredit ? '+' : '-'}₦{parseFloat(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {activeModal && activeModal !== 'gift_cards' && (
                <ServiceModal
                    service={{
                        title: getServiceName(activeModal),
                        icon: null // Icon handled by mapped modal or not needed
                    }}
                    onClose={() => setActiveModal(null)}
                />
            )}
            <GiftCardModal isOpen={activeModal === 'gift_cards'} onClose={() => setActiveModal(null)} />

        </div >
    );
}
