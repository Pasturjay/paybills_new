"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

            <div className="mt-8">
                <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Activity</h2>
                <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <div className="p-4 bg-white dark:bg-gray-800 text-center text-gray-500">
                        Transaction table will be implemented in the Transactions tab.
                    </div>
                </div>
            </div>
        </div>
    );
}
