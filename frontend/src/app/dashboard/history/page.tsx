"use client";

import { Clock, Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function History() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await api.get("/wallet/transactions", token);
                    setTransactions(Array.isArray(res) ? res : []);
                } catch (error) {
                    console.error("Failed to fetch history", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUCCESS": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "PENDING": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "FAILED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600" /> Transaction History
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Track all your payments and deposits.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl text-sm border-none focus:ring-0" />
                    </div>
                    <button className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No transactions found.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "FUNDING" ? "bg-green-100 text-green-600 dark:bg-green-900/20" : "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
                                                    }`}>
                                                    {tx.type === "FUNDING" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{tx.type}</div>
                                                    <div className="text-xs text-gray-500">{tx.serviceId || "Wallet"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{tx.reference}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.type === "FUNDING" ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                                            {tx.type === "FUNDING" ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
