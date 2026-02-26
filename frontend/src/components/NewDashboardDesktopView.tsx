import Link from "next/link";
import { Home, CreditCard, Clock, User, LogOut, Search, Bell, ChevronDown, Wallet, ArrowUpRight, ArrowDownLeft, Tv, Zap, Send, Gift, Smartphone, Gamepad2, BookOpen, Download } from "lucide-react";
import { useTransactions } from "@/hooks/useData";

export function NewDashboardDesktopView({ user, balance, onAddMoney, onSendMoney }: { user: any, balance: any, onAddMoney: () => void, onSendMoney: () => void }) {
    const { transactions, isLoading: txLoading } = useTransactions();

    // Calculate Monthly Usage (sum of successful non-funding transactions in current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyUsage = transactions?.reduce((sum: number, tx: any) => {
        const txDate = new Date(tx.createdAt);
        if (
            tx.status === 'SUCCESS' &&
            tx.type !== 'FUNDING' &&
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
        ) {
            return sum + parseFloat(tx.amount || 0);
        }
        return sum;
    }, 0) || 0;

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
        <div className="hidden md:block p-8">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8">
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search transactions..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-6">
                    <button className="relative">
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-50 dark:border-zinc-900"></span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden lg:block">
                            <div className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold uppercase">
                            {user.firstName?.[0]}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
                {/* Main Balance */}
                <div className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl min-h-[200px]">
                    {balance === null ? (
                        // Skeleton Loader
                        <div className="animate-pulse relative z-10 w-full">
                            <div className="h-4 bg-white/20 rounded w-32 mb-4"></div>
                            <div className="h-10 bg-white/20 rounded w-64 mb-8"></div>
                            <div className="flex gap-4">
                                <div className="h-10 bg-white/20 rounded-xl w-40"></div>
                                <div className="h-10 bg-white/20 rounded-xl w-32"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="text-blue-100 mb-2 font-medium">Utility Credits Balance</div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="text-4xl font-bold">
                                    ₦{Number(balance?.balance || 0).toLocaleString()}
                                    <span className="text-xs opacity-50 block mt-1 font-normal">Available for Bill Payments</span>
                                </div>
                                <button onClick={onAddMoney} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors" title="Add Money">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={onAddMoney} className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Top-up
                                </button>
                                <button onClick={onSendMoney} className="bg-purple-500/30 text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-500/40 transition-colors flex items-center gap-2">
                                    <Gift className="w-4 h-4" /> Gift User
                                </button>
                                <Link href="/dashboard/services" className="bg-indigo-500/30 text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500/40 transition-colors flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Pay Bills
                                </Link>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Stats Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Monthly Usage</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₦{monthlyUsage.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-blue-500 font-medium mb-1">
                            <CreditCard className="w-4 h-4" /> Active Current Month
                        </div>
                        <div className="text-xs text-gray-400">Total spending footprint</div>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                    <Link href="/dashboard/history" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
                </div>

                {txLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : transactions?.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Your recent activity will appear here once you start using the platform.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="pb-4">Service / Detail</th>
                                    <th className="pb-4">Date</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {transactions.slice(0, 5).map((tx: any) => {
                                    const isCredit = tx.type === 'FUNDING' || (tx.type === 'P2P_TRANSFER' && tx.reference?.includes('_CR'));
                                    return (
                                        <tr key={tx.id}>
                                            <td className="py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                        {getTransactionIcon(tx.type, tx.description)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-[250px]">{tx.description || tx.type.replace(/_/g, ' ')}</div>
                                                        <div className="text-xs text-gray-500 uppercase">{tx.type.replace(/_/g, ' ')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-500">
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`py-4 text-right font-bold ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                                {isCredit ? '+' : '-'}₦{parseFloat(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
