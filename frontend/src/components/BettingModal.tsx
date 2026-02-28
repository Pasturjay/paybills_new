"use client";

import { useState } from 'react';
import { X, Trophy, ChevronRight, Loader2, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface BettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BOOKIES = [
    { id: 'BET9JA', name: 'Bet9ja', color: 'bg-green-600 text-white' },
    { id: 'SPORTY', name: 'SportyBet', color: 'bg-red-600 text-white' },
    { id: '1XBET', name: '1xBet', color: 'bg-blue-600 text-white' },
    { id: 'BETKING', name: 'BetKing', color: 'bg-yellow-400 text-black' },
];

export default function BettingModal({ isOpen, onClose }: BettingModalProps) {
    const [bookie, setBookie] = useState('BET9JA');
    const [userId, setUserId] = useState('');
    const [verifiedName, setVerifiedName] = useState('');
    const [validating, setValidating] = useState(false);
    const [amount, setAmount] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const validateUser = async () => {
        if (!userId || userId.length < 5) return;
        setValidating(true);
        setError('');
        try {
            await new Promise(r => setTimeout(r, 800));
            setVerifiedName('MOCK BETTOR');
        } catch (err) {
            setError('Validation failed');
            setVerifiedName('');
        } finally {
            setValidating(false);
        }
    };

    const handleTopUp = async (pin: string) => {
        setIsPinOpen(false);
        setLoading(true);
        setError('');

        try {
            // Mock API call
            await new Promise(r => setTimeout(r, 1500));
            // await api.post('/products/betting', { provider: bookie, userId, amount, pin });

            setSuccess('Top-up successful!');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Top-up failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-green-500" /> Betting Top-up
                        </h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Bookmaker</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BOOKIES.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => { setBookie(b.id); setVerifiedName(''); }}
                                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${bookie === b.id ? 'ring-2 ring-offset-2 ring-green-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'} ${b.color}`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">User ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Enter User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                onBlur={validateUser}
                            />
                            {validating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-gray-400" />}
                            {verifiedName && <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                        </div>
                        {verifiedName && <div className="text-xs text-green-600 mt-1 font-bold">{verifiedName}</div>}
                    </div>

                    {verifiedName && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-green-500 mb-2 font-bold text-lg"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <div className="flex gap-2">
                                {[1000, 2000, 5000].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(amt.toString())}
                                        className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-medium hover:bg-gray-200"
                                    >
                                        ₦{amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            if (!userId || !amount) { setError('Fill all fields'); return; }
                            setIsPinOpen(true);
                        }}
                        disabled={loading || !verifiedName}
                        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl mt-4 hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Top up Wallet'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handleTopUp} title="Confirm Top up" description={`Top up ${bookie} account with ₦${Number(amount).toLocaleString()}`} />
        </div>
    );
}
