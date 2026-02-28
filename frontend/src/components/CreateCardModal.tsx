"use client";

import { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface CreateCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateCardModal({ isOpen, onClose, onSuccess }: CreateCardModalProps) {
    const [formData, setFormData] = useState({
        amount: '10',
        billingName: '',
        color: 'blue'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const EXCHANGE_RATE = 1650; // Mock rate for display
    const CREATION_FEE = 2; // $2

    const amountUSD = Number(formData.amount) || 0;
    const totalUSD = amountUSD + CREATION_FEE;
    const totalNGN = totalUSD * EXCHANGE_RATE;

    const handleCreate = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        try {
            await api.post('/cards/create', { ...formData, pin });
            setSuccessMsg('Virtual Card created successfully!');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Creation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" /> Create Virtual Card
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                {successMsg ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Card Created!</h4>
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

                        {/* Card Preview */}
                        <div className={`aspect-[1.586] rounded-2xl p-6 text-white shadow-xl transition-colors duration-300 relative overflow-hidden ${formData.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-indigo-800' :
                            formData.color === 'black' ? 'bg-gradient-to-br from-gray-800 to-black' :
                                'bg-gradient-to-br from-yellow-500 to-amber-700'
                            }`}>
                            <div className="absolute top-0 right-0 p-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-lg tracking-wider">Paybills</div>
                                    <div className="font-mono text-sm opacity-80">DEBIT</div>
                                </div>
                                <div className="font-mono text-xl tracking-widest my-4 opacity-70">
                                    •••• •••• •••• ••••
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] opacity-70 uppercase mb-1">Card Holder</div>
                                        <div className="font-medium tracking-wide">{formData.billingName || 'YOUR NAME'}</div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="w-8 h-5 bg-white/20 rounded-md"></div>
                                        <div className="text-xs font-bold mt-1">VISA</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top up Amount ($)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                                placeholder="Enter amount (min $5)"
                            />
                            <div className="flex justify-between text-xs mt-2 text-gray-500 font-medium">
                                <span>Exchange Rate: ₦{EXCHANGE_RATE.toLocaleString()}/$</span>
                                <span>Fee: ${CREATION_FEE}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name on Card</label>
                            <input
                                type="text"
                                value={formData.billingName}
                                onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 uppercase"
                                placeholder="ENTER NAME"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Color</label>
                            <div className="flex gap-3">
                                {['blue', 'black', 'gold'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${formData.color === c ? 'border-indigo-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        style={{ backgroundColor: c === 'gold' ? '#D97706' : c === 'blue' ? '#2563EB' : '#111827' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total Due (NGN)</span>
                            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">₦{totalNGN.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            disabled={!formData.amount || !formData.billingName || Number(formData.amount) < 5}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Create Card'}
                        </button>
                    </div>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleCreate}
                title="Confirm Creation"
                description={`Enter PIN to authorize ₦${totalNGN.toLocaleString()}`}
            />
        </div>
    );
}
