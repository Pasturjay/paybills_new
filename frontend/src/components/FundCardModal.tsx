"use client";

import { useState } from 'react';
import { X, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface FundCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    cardId: string;
    cardName: string;
}

export default function FundCardModal({ isOpen, onClose, onSuccess, cardId, cardName }: FundCardModalProps) {
    const [amount, setAmount] = useState('10');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const EXCHANGE_RATE = 1650; // Mock rate
    const amountUSD = Number(amount) || 0;
    const totalNGN = amountUSD * EXCHANGE_RATE;

    const handleFund = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        try {
            await api.post('/cards/fund', { cardId, amount: amountUSD, pin });
            setSuccessMsg('Card topped up successfully!');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Top up failed');
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
                            <DollarSign className="w-5 h-5 text-indigo-600" /> Top up Card
                        </h3>
                        <p className="text-sm text-gray-500">Topping up <strong>{cardName}</strong></p>
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
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount to Add ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                                placeholder="Enter amount"
                            />
                            <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
                                <span>Rate: ₦{EXCHANGE_RATE.toLocaleString()}/$</span>
                                <span>Cost: ₦{totalNGN.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            disabled={!amount || Number(amount) < 1}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Top up Card'}
                        </button>
                    </div>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleFund}
                title="Confirm Top up"
                description={`Enter PIN to authorize ₦${totalNGN.toLocaleString()}`}
            />
        </div>
    );
}
