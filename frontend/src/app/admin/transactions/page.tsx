"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const data = await api.get("/admin/transactions", token);
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) return <div>Loading Transactions...</div>;

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Transactions</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        A detailed list of all transactions performed on the platform.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6">
                <div className="max-w-md">
                    <input
                        type="text"
                        placeholder="Search by reference, email, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">User</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Reference</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {transactions
                                        .filter(tx =>
                                            (tx.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (tx.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (tx.type || "").toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((tx) => (
                                            <tr key={tx.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                    {tx.user?.firstName} {tx.user?.lastName} <br />
                                                    <span className="text-xs text-gray-500 font-normal">{tx.user?.email}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{tx.type}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500 dark:text-gray-300">{tx.reference}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {tx.currency} {Number(tx.amount).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                            'bg-red-50 text-red-700 ring-red-600/10'
                                                        }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                                                </td>
                                            </tr>
                                        ))}
                                    {transactions.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-300">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
