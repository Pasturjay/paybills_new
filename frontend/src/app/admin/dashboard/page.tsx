"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Wallet, ArrowUpRight, Plus } from "lucide-react";
import { FundWalletModal } from "@/components/FundWalletModal";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const data = await api.get("/admin/stats", token);
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading Admin Dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Overview</h1>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Card 1 */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{stats?.totalUsers || 0}</dd>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{stats?.totalTransactions || 0}</dd>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Volume</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">₦{Number(stats?.totalVolume || 0).toLocaleString()}</dd>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h2>
                <button
                    onClick={() => setIsFundModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    Top up Private Wallet
                </button>
            </div>

            {/* Feature Management Section */}
            <div className="mt-8">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Feature Management</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'User Management', desc: 'Verify & Manage Users', icon: '👤', link: '/admin/users', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' },
                        { title: 'Transactions', desc: 'Audit & Track Ledger', icon: '📊', link: '/admin/transactions', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' },
                        { title: 'System Config', desc: 'Fees, Limits & Toggle', icon: '⚙️', link: '/admin/config', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600' },
                        { title: 'Service Health', desc: 'Provider Status', icon: '⚡', link: '/admin/config', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' },
                    ].map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            className="group p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                        </a>
                    ))}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Activity</h2>
                <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl bg-white dark:bg-gray-800">
                    <div className="p-8 text-center text-gray-500">
                        <ArrowUpRight className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="font-medium text-sm">Detailed transaction ledger and real-time logs are available in the dedicated <a href="/admin/transactions" className="text-indigo-600 font-bold">Transactions</a> tab.</p>
                    </div>
                </div>
            </div>

            <FundWalletModal isOpen={isFundModalOpen} onClose={() => setIsFundModalOpen(false)} />
        </div>
    );
}
