"use client";

import { useState } from 'react';
import { X, BookOpen, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface EducationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EducationModal({ isOpen, onClose }: EducationModalProps) {
    const [step, setStep] = useState<'details' | 'confirm'>('details');
    const [formData, setFormData] = useState({
        type: 'WAEC',
        quantity: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [successData, setSuccessData] = useState<any>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const prices: Record<string, number> = { 'WAEC': 3500, 'NECO': 1200, 'JAMB': 4700, 'NABTEB': 1000 };
    const totalCost = (prices[formData.type] || 0) * formData.quantity;

    const handlePurchase = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await api.post('/products/education', { ...formData, pin, idempotencyKey }, token);
            setSuccessData(res);
            setIdempotencyKey(uuidv4());
            setStep('confirm'); // Reuse confirm step for success view
        } catch (err: any) {
            setError(err.message || 'Purchase failed');
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
                            <BookOpen className="w-5 h-5 text-purple-600" /> Education PINs
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                {successData ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">Purchase Successful!</h4>
                        <p className="text-gray-500 mb-6">Your tokens have been generated.</p>
                        {/* Display tokens if available in response, simplified for now */}
                        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl mb-6 font-mono text-lg tracking-widest break-all">
                            {/* Assuming backend returns meaningful token/serial info in message or data */}
                            {JSON.stringify(successData.tokens || "Check Transaction History")}
                        </div>

                        <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exam Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(prices).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`p-3 rounded-xl border font-bold text-sm transition-all ${formData.type === type
                                            ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        {type}
                                        <div className="text-xs font-normal opacity-70 mt-1">₦{prices[type].toLocaleString()}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200"
                                >-</button>
                                <span className="text-xl font-bold w-8 text-center">{formData.quantity}</span>
                                <button
                                    onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200"
                                >+</button>
                            </div>
                        </div>

                        <div className="py-4 border-t border-b border-gray-100 dark:border-zinc-800 my-4">
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                                <span>Unit Price</span>
                                <span>₦{prices[formData.type].toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Cost</span>
                                <span>₦{totalCost.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPinModalOpen(true)}
                            className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Purchase PINs'}
                        </button>
                    </div>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePurchase}
                title="Confirm Purchase"
                description={`Enter PIN to pay ₦${totalCost.toLocaleString()}`}
            />
        </div>
    );
}
