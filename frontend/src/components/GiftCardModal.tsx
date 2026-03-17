"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, AlertCircle, ArrowUpRight, ArrowDownLeft, CheckCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface GiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CARDS = [
    { id: 'amazon', name: 'Amazon', mini: 694, low: 794, high: 1100 },
    { id: 'apple', name: 'Apple / iTunes', mini: 694, low: 794, high: 1080 },
    { id: 'steam', name: 'Steam', mini: 694, low: 794, high: 1050 },
    { id: 'google', name: 'Google Play', mini: 694, low: 794, high: 1070 },
    { id: 'vanilla', name: 'Vanilla Visa', mini: 694, low: 794, high: 1050 },
];

function getTieredRate(card: typeof CARDS[0], usdValue: number | string): number {
    const val = Number(usdValue);
    if (!val || val < 5) return 0;
    if (val >= 50) return card.high;
    if (val >= 20) return card.low;
    return card.mini;
}

export default function GiftCardModal({ isOpen, onClose }: GiftCardModalProps) {
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');

    // Buy state
    const [buyData, setBuyData] = useState({ cardId: 'amazon', amount: '' });

    // Sell state
    const [sellData, setSellData] = useState({ cardId: 'amazon', subCategory: 'US', cardValue: '', quantity: 1, cardCode: '', images: [] as string[] });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [ngnCredited, setNgnCredited] = useState<number | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const selectedSellCard = CARDS.find(c => c.id === sellData.cardId) || CARDS[0];
    const activeRate = getTieredRate(selectedSellCard, sellData.cardValue);
    const ngnPreview = activeRate > 0 ? Math.floor(Number(sellData.cardValue) * activeRate * sellData.quantity) : 0;
    const currentTier = Number(sellData.cardValue) >= 50 ? 'high' : Number(sellData.cardValue) >= 20 ? 'low' : Number(sellData.cardValue) >= 5 ? 'mini' : null;

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages: string[] = [];
        const fileReaders: Promise<string>[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            fileReaders.push(
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                })
            );
        }

        Promise.all(fileReaders).then((results) => {
            setSellData((prev) => ({
                ...prev,
                images: [...prev.images, ...results],
            }));
        });
    };

    const removeImage = (index: number) => {
        setSellData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            if (mode === 'buy') {
                await api.post('/products/gift-card/buy', { ...buyData, pin }, token);
                setSuccessMsg('Purchase successful! Your gift card code will be delivered shortly.');
            } else {
                const response = await api.post('/products/gift-card/sell', {
                    ...sellData,
                    pin
                }, token);
                setNgnCredited(response.ngnPayout ?? ngnPreview);
                setSuccessMsg(response.message || 'Trade submitted! Funds credited to your wallet.');
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
        setSellData({ cardId: 'amazon', subCategory: 'US', cardValue: '', quantity: 1, cardCode: '', images: [] });
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
                            /* ── SOPHISTICATED SELL FORM ── */
                            <div className="space-y-5">
                                {/* Giftcard Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-200/70 mb-2">Giftcard Type</label>
                                    <select
                                        value={sellData.cardId}
                                        onChange={(e) => setSellData({ ...sellData, cardId: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#142143] text-white border-none rounded-xl focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select card type</option>
                                        {CARDS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {/* Sub category */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-200/70 mb-2">Sub category</label>
                                    <select
                                        value={sellData.subCategory}
                                        onChange={(e) => setSellData({ ...sellData, subCategory: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#142143] text-white border-none rounded-xl focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="GLOBAL">Global</option>
                                    </select>
                                </div>
                                {/* Rate tiers badge (shows only when amount is entered) */}
                                {Number(sellData.cardValue) > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <div className={`flex justify-between text-xs rounded-lg px-3 py-1.5 font-medium transition-colors ${currentTier === 'low' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'text-gray-400'}`}>
                                            <span>$20 – $49</span>
                                            <span>₦{selectedSellCard.low.toLocaleString()} / $1</span>
                                        </div>
                                        <div className={`flex justify-between text-xs rounded-lg px-3 py-1.5 font-medium transition-colors ${currentTier === 'high' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'text-gray-400'}`}>
                                            <span>$50+</span>
                                            <span>₦{selectedSellCard.high.toLocaleString()} / $1</span>
                                        </div>
                                    </div>
                                )}
                                {/* Card Value & Quantity */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-semibold text-blue-200/70">Card Value</label>
                                        <span className="text-[10px] text-blue-200/50 flex items-center gap-1">
                                            {Number(sellData.cardValue) > 0 ? (
                                                <>
                                                    <TrendingUp className="w-3 h-3" /> 1 ~ ₦{activeRate.toLocaleString()}
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> 1 ~ NGN0
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center bg-[#142143] rounded-xl overflow-hidden pr-2">
                                        <input
                                            type="number"
                                            placeholder="Enter card value"
                                            value={sellData.cardValue}
                                            onChange={(e) => setSellData({ ...sellData, cardValue: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-transparent text-white border-none focus:ring-0 outline-none"
                                        />
                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                            <button
                                                onClick={() => setSellData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))}
                                                className="w-8 h-8 rounded-full bg-[#1F2F5A] flex items-center justify-center text-white hover:bg-[#2A3E75] transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-white font-medium w-4 text-center">{sellData.quantity}</span>
                                            <button
                                                onClick={() => setSellData(d => ({ ...d, quantity: d.quantity + 1 }))}
                                                className="w-8 h-8 rounded-full bg-[#1F2F5A] flex items-center justify-center text-white hover:bg-[#2A3E75] transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    {Number(sellData.cardValue) > 0 && Number(sellData.cardValue) < 20 && (
                                        <div className="text-amber-400 text-xs mt-2 px-1">⚠️ Minimum card value is $20</div>
                                    )}
                                </div>

                                {/* You're receiving */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-200/70 mb-2">You're receiving</label>
                                    <div className="w-full px-4 py-3.5 bg-[#142143] text-white border-none rounded-xl flex items-center justify-between opacity-80">
                                        <span>{ngnPreview > 0 ? `₦${ngnPreview.toLocaleString()}` : '---'}</span>
                                        <span className="text-blue-200/50">~</span>
                                    </div>
                                </div>

                                {/* E-Code */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-200/70 mb-2">E-Code (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter E-Code"
                                        value={sellData.cardCode}
                                        onChange={(e) => setSellData({ ...sellData, cardCode: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-[#142143] text-white border-none rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {/* Upload Images */}
                                <div className="pt-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            files.forEach(file => {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    const base64 = ev.target?.result as string;
                                                    setSellData(s => ({ ...s, images: [...s.images, base64] }));
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full p-4 bg-[#142143] hover:bg-[#1A2A54] transition-colors rounded-xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3 text-blue-200/80 group-hover:text-white">
                                            <div className="p-1 border border-current rounded border-dashed">
                                                <AlertCircle className="w-5 h-5 opacity-0 absolute" /> {/* Placeholder */}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle><line x1="12" y1="9" x2="12" y2="17"></line><line x1="8" y1="13" x2="16" y2="13"></line></svg>
                                            </div>
                                            <span className="text-sm font-medium">Upload your images</span>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-blue-200/50 group-hover:text-white rotate-45 transform" />
                                    </button>

                                    {sellData.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {sellData.images.map((img, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-blue-500/30">
                                                    <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setSellData(s => ({ ...s, images: s.images.filter((_, i) => i !== idx) }))}
                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-center text-[10px] text-blue-200/50 mt-2">multiple card images can be uploaded</p>
                                </div>

                                <button
                                    onClick={() => setIsPinModalOpen(true)}
                                    disabled={!sellData.cardValue || Number(sellData.cardValue) < 5 || (!sellData.cardCode && sellData.images.length === 0) || loading}
                                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    Sell
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
