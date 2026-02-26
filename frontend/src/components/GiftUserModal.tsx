"use client";

import { useState } from 'react';
import { X, Gift, AtSign, ChevronRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface GiftUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GiftUserModal({ isOpen, onClose, onSuccess }: GiftUserModalProps) {
    const [step, setStep] = useState<'details' | 'confirm'>('details');
    const [formData, setFormData] = useState({
        recipient: '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleSend = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload: any = {
                amount: Number(formData.amount),
                pin,
                description: formData.description
            };

            // Enhanced Recipient Logic
            const rawRecipient = formData.recipient.trim();
            if (rawRecipient.startsWith('@')) {
                payload.recipientTag = rawRecipient;
            } else if (rawRecipient.includes('@') && rawRecipient.includes('.')) {
                payload.recipientEmail = rawRecipient;
            } else {
                payload.recipientPhone = rawRecipient;
            }

            await api.post('/wallet/transfer', payload, token);
            setStep('details');
            setFormData({ recipient: '', amount: '', description: '' });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Transfer failed');
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
                            <Gift className="w-5 h-5 text-purple-600" /> Gift User
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gift money instantly via Tag, Email or Phone</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient</label>
                        <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="@Tag, Email or Phone"
                                value={formData.recipient}
                                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1 ml-1">Use @tag for instant identification</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg font-bold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note (Optional)</label>
                        <input
                            type="text"
                            placeholder="Best wishes!"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (!formData.recipient || !formData.amount) {
                                setError('Please fill in all required fields');
                                return;
                            }
                            setIsPinModalOpen(true);
                        }}
                        disabled={loading}
                        className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-500/20"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Send Gift <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSend}
                title="Confirm Gift"
                description={`Enter PIN to gift ₦${Number(formData.amount).toLocaleString()}`}
            />
        </div>
    );
}
