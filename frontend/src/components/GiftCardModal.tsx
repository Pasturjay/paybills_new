"use client";

import { useState } from 'react';
import { X, Gift, ArrowDownLeft, ArrowUpRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface GiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CARDS = [
    { id: 'amazon', name: 'Amazon', rate: 1271 },
    { id: 'apple', name: 'Apple / iTunes', rate: 1230 },
    { id: 'steam', name: 'Steam', rate: 1214 },
    { id: 'google', name: 'Google Play', rate: 1246 },
    { id: 'vanilla', name: 'Vanilla Visa', rate: 1205 },
];

export default function GiftCardModal({ isOpen, onClose }: GiftCardModalProps) {
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');

    // Buy state
    const [buyData, setBuyData] = useState({ cardId: 'amazon', amount: '' });

    // Sell state
    const [sellData, setSellData] = useState({ cardId: 'amazon', cardValue: '', cardCode: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [ngnCredited, setNgnCredited] = useState<number | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const selectedSellCard = CARDS.find(c => c.id === sellData.cardId) || CARDS[0];
    const ngnPreview = sellData.cardValue
        ? Math.floor(Number(sellData.cardValue) * selectedSellCard.rate)
        : 0;

    const handleSubmit = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            if (mode === 'buy') {
                await api.post('/products/gift-card/buy', { ...buyData, pin }, token);
                setSuccessMsg('Purchase successful! Your gift card code will be delivered shortly.');
            } else {
                const res: any = await api.post('/products/gift-card/sell', {
                    cardId: sellData.cardId,
                    cardValue: sellData.cardValue,
                    cardCode: sellData.cardCode,
                    pin
                }, token);
                setNgnCredited(res.ngnPayout ?? ngnPreview);
                setSuccessMsg(res.message || 'Trade submitted! Funds credited to your wallet.');
            }
        } catch (err: any) {
            setError(err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccessMsg('');
        setNgnCredited(null);
        setError('');
        setBuyData({ cardId: 'amazon', amount: '' });
        setSellData({ cardId: 'amazon', cardValue: '', cardCode: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Gift className="w-5 h-5 text-pink-600" /> Gift Cards
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                {successMsg ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">
                            {mode === 'sell' ? 'Trade Submitted!' : 'Purchase Successful!'}
                        </h4>
                        {mode === 'sell' && ngnCredited !== null && (
                            <div className="mb-3 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl font-bold text-lg">
                                <TrendingUp className="w-5 h-5" />
                                ₦{ngnCredited.toLocaleString()} credited
                            </div>
                        )}
                        <p className="text-gray-500 text-sm mb-6">{successMsg}</p>
                        <button onClick={handleClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                            <button
                                onClick={() => { setMode('buy'); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'buy' ? 'bg-white shadow text-gray-900 dark:bg-zinc-700 dark:text-white' : 'text-gray-500'}`}
                            >
                                <ArrowDownLeft className="w-4 h-4" /> Buy Card
                            </button>
                            <button
                                onClick={() => { setMode('sell'); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'sell' ? 'bg-white shadow text-gray-900 dark:bg-zinc-700 dark:text-white' : 'text-gray-500'}`}
                            >
                                <ArrowUpRight className="w-4 h-4" /> Sell for NGN
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                            </div>
                        )}

                        {mode === 'buy' ? (
                            /* ── BUY FORM ── */
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Card</label>
                                    <select
                                        value={buyData.cardId}
                                        onChange={(e) => setBuyData({ ...buyData, cardId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    >
                                        {CARDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount ($ USD)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={buyData.amount}
                                        onChange={(e) => setBuyData({ ...buyData, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsPinModalOpen(true)}
                                    className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-colors"
                                >
                                    {loading ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>
                        ) : (
                            /* ── SELL FORM ── */
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Card</label>
                                    <select
                                        value={sellData.cardId}
                                        onChange={(e) => setSellData({ ...sellData, cardId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        {CARDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {/* Rate badge */}
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1.5 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Rate: ₦{selectedSellCard.rate.toLocaleString()} per $1
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Value ($ USD)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 50"
                                        value={sellData.cardValue}
                                        onChange={(e) => setSellData({ ...sellData, cardValue: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                {/* Live NGN Payout Preview */}
                                {ngnPreview > 0 && (
                                    <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">You'll receive</span>
                                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                            ₦{ngnPreview.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-Code / Redemption Code</label>
                                    <textarea
                                        placeholder="Paste your card code here..."
                                        rows={3}
                                        value={sellData.cardCode}
                                        onChange={(e) => setSellData({ ...sellData, cardCode: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    />
                                </div>

                                <p className="text-xs text-gray-400 text-center">
                                    Funds are credited instantly and subject to verification.
                                </p>

                                <button
                                    onClick={() => setIsPinModalOpen(true)}
                                    disabled={!sellData.cardValue || !sellData.cardCode || loading}
                                    className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : `Sell for ₦${ngnPreview > 0 ? ngnPreview.toLocaleString() : '---'}`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSubmit}
                title={mode === 'buy' ? 'Confirm Purchase' : 'Confirm Gift Card Sale'}
                description={
                    mode === 'buy'
                        ? `Enter PIN to buy card worth $${buyData.amount}`
                        : `Enter PIN to sell $${sellData.cardValue} ${selectedSellCard.name} for ₦${ngnPreview.toLocaleString()}`
                }
            />
        </div>
    );
}
