"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, ImageIcon, Info } from "lucide-react";

export default function AdminGiftCardsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrade, setSelectedTrade] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    const fetchTrades = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const data = await api.get("/admin/transactions", token);
                // Filter only giftcard transactions
                setTransactions(data.filter((tx: any) => tx.type === 'GIFTCARD'));
            }
        } catch (error) {
            console.error("Failed to fetch trades", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    const handleUpdateStatus = async (status: 'SUCCESS' | 'FAILED') => {
        if (!selectedTrade) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem("token");
            await api.patch(`/admin/gift-cards/${selectedTrade.reference}/status`, {
                status,
                adminNotes
            }, token!);

            await fetchTrades();
            setSelectedTrade(null);
            setAdminNotes("");
            alert(`Trade ${status === 'SUCCESS' ? 'Approved' : 'Rejected'} successfully`);
        } catch (error: any) {
            alert(error.message || "Failed to update trade status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading gift card trades...</div>;

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Gift Card Trades</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Review and manage user gift card sell requests.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">User</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Card Info</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                                {tx.user?.firstName} {tx.user?.lastName} <br />
                                                <span className="text-xs text-gray-500">{tx.user?.email}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {tx.metadata?.cardId?.toUpperCase()} ({tx.metadata?.subCategory})
                                                </div>
                                                <div className="text-xs">{tx.metadata?.cardCode || "No E-Code"}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="font-bold text-green-600">₦{Number(tx.amount).toLocaleString()}</div>
                                                <div className="text-xs">${tx.metadata?.cardValue} x {tx.metadata?.quantity || 1}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                            'bg-red-50 text-red-700 ring-red-600/10'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => setSelectedTrade(tx)}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 ml-auto"
                                                >
                                                    <Eye className="w-4 h-4" /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {selectedTrade && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedTrade(null)}></div>
                        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                            <div className="px-6 py-6 sm:px-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">Review Gift Card Trade</h3>
                                    <button onClick={() => setSelectedTrade(null)} className="text-gray-400 hover:text-gray-500">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Card Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Card Type</label>
                                            <div className="font-bold text-gray-900 dark:text-white">{selectedTrade.metadata?.cardId?.toUpperCase()}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Country/Sub-category</label>
                                            <div className="font-bold text-gray-900 dark:text-white">{selectedTrade.metadata?.subCategory}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Inputted E-Code</label>
                                            <div className="font-mono text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                                                {selectedTrade.metadata?.cardCode || "N/A"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity x Value</label>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {selectedTrade.metadata?.quantity || 1} x ${selectedTrade.metadata?.cardValue}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payout Info */}
                                    <div className="p-4 border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 rounded-xl flex justify-between items-center">
                                        <div>
                                            <div className="text-xs text-green-700 dark:text-green-400 font-bold uppercase">NGN Payout</div>
                                            <div className="text-2xl font-bold text-green-600">₦{Number(selectedTrade.amount).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right text-xs text-gray-500">
                                            Rate: ₦{selectedTrade.metadata?.rate}/$
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Uploaded Images</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {selectedTrade.metadata?.images?.map((img: string, i: number) => (
                                                <a
                                                    key={i}
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="aspect-square rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:opacity-80 transition-opacity"
                                                >
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`}
                                                        alt="Giftcard"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </a>
                                            ))}
                                            {(!selectedTrade.metadata?.images || selectedTrade.metadata?.images.length === 0) && (
                                                <div className="col-span-3 py-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-8 h-8 mb-2" />
                                                    <span className="text-sm">No images uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {selectedTrade.status === 'PENDING' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Admin Notes (Optional)</label>
                                            <textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Enter reason for rejection or approval notes..."
                                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                                                rows={2}
                                            />
                                        </div>
                                    )}

                                    {selectedTrade.status !== 'PENDING' && selectedTrade.metadata?.adminNotes && (
                                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Admin Notes</label>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedTrade.metadata.adminNotes}"</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {selectedTrade.status === 'PENDING' && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                disabled={updating}
                                                onClick={() => handleUpdateStatus('FAILED')}
                                                className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-5 h-5" /> Reject & Reverse
                                            </button>
                                            <button
                                                disabled={updating}
                                                onClick={() => handleUpdateStatus('SUCCESS')}
                                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                            >
                                                <CheckCircle className="w-5 h-5" /> Approve Trade
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
