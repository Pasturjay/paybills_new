"use client";

import { useState } from 'react';
import { X, Gift, ArrowDownLeft, ArrowUpRight, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface GiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GiftCardModal({ isOpen, onClose }: GiftCardModalProps) {
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');
    const [formData, setFormData] = useState({
        cardId: 'amazon',
        amount: '',
        cardCode: '' // For selling
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const cards = [
        { id: 'amazon', name: 'Amazon' },
        { id: 'apple', name: 'Apple / iTunes' },
        { id: 'steam', name: 'Steam' },
        { id: 'google', name: 'Google Play' },
        { id: 'vanilla', name: 'Vanilla Visa' }
    ];

    const handleSubmit = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const endpoint = mode === 'buy' ? '/products/gift-card/buy' : '/products/gift-card/sell';
            await api.post(endpoint, { ...formData, pin }, token);
            setSuccessMsg(mode === 'buy' ? 'Purchase successful!' : 'Trade request submitted!');
        } catch (err: any) {
            setError(err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Gift className="w-5 h-5 text-pink-600" /> Gift Cards
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                {successMsg ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Success!</h4>
                        <p className="text-gray-500 mb-6">{successMsg}</p>
                        <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => setMode('buy')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'buy' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                <ArrowDownLeft className="w-4 h-4" /> Buy Card
                            </button>
                            <button
                                onClick={() => setMode('sell')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'sell' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                <ArrowUpRight className="w-4 h-4" /> Sell Card
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Card</label>
                                <select
                                    value={formData.cardId}
                                    onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                >
                                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount ($ USD)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                />
                            </div>

                            {mode === 'sell' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-Code / Card Details</label>
                                    <textarea
                                        placeholder="Paste your card code here..."
                                        rows={3}
                                        value={formData.cardCode}
                                        onChange={(e) => setFormData({ ...formData, cardCode: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-colors"
                        >
                            {loading ? 'Processing...' : (mode === 'buy' ? 'Buy Now' : 'Submit for Trade')}
                        </button>
                    </div>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSubmit}
                title={mode === 'buy' ? "Confirm Purchase" : "Confirm Trade"}
                description={`Enter PIN to ${mode} card worth $${formData.amount}`}
            />
        </div>
    );
}
