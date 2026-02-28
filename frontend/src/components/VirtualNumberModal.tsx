"use client";

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Globe, CheckCircle, AlertCircle, Phone, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface VirtualNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initCountry?: string;
}

export default function VirtualNumberModal({ isOpen, onClose, onSuccess, initCountry = 'NG' }: VirtualNumberModalProps) {
    const [step, setStep] = useState<'COUNTRY' | 'SELECT' | 'SUMMARY' | 'SUCCESS'>('COUNTRY');
    const [country, setCountry] = useState(initCountry);
    const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
    const [selectedNumber, setSelectedNumber] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

    const prices: Record<string, number> = { 'NG': 5000, 'US': 6000, 'GB': 6000 };

    const searchNumbers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required");
            const res = await api.get(`/products/virtual-number/available?country=${country}`, token);
            setAvailableNumbers(res);
            setStep('SELECT');
        } catch (err: any) {
            setError(err.message || 'Failed to search numbers');
        } finally {
            setLoading(false);
        }
    };

    const handleRentClick = (num: any) => {
        setSelectedNumber(num);
        setStep('SUMMARY');
    };

    const confirmRent = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication required");
            await api.post('/products/virtual-number/purchase', {
                msisdn: selectedNumber.number,
                country,
                pin,
                idempotencyKey
            }, token);
            setIdempotencyKey(uuidv4());
            setStep('SUCCESS');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Rent failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            {step === 'COUNTRY' ? 'Select Country' :
                                step === 'SELECT' ? 'Choose Number' :
                                    step === 'SUMMARY' ? 'Checkout' : 'Success'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {error && (
                        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {step === 'COUNTRY' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {Object.keys(prices).map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCountry(c)}
                                        className={`p-4 rounded-xl border flex justify-between items-center transition-all ${country === c
                                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                {c}
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {c === 'NG' ? 'Nigeria' : c === 'US' ? 'United States' : 'United Kingdom'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-indigo-600">₦{prices[c].toLocaleString()}/mo</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={searchNumbers}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                Search Numbers
                            </button>
                        </div>
                    )}

                    {step === 'SELECT' && (
                        <div className="space-y-3 pb-2">
                            <div className="text-sm text-gray-500 mb-2">Found {availableNumbers.length} available numbers</div>
                            {availableNumbers.length === 0 && !loading && <div className="text-center p-8 text-gray-400">No numbers found</div>}

                            {availableNumbers.map((num, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 bg-gray-50 dark:bg-zinc-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="font-mono font-bold text-lg">{num.number}</div>
                                            <div className="text-xs text-gray-500 capitalize">{num.type} • SMS Enabled</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRentClick(num)}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700"
                                    >
                                        Rent
                                    </button>
                                </div>
                            ))}

                            <button onClick={() => setStep('COUNTRY')} className="w-full py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl mt-4">
                                Back to Countries
                            </button>
                        </div>
                    )}

                    {step === 'SUMMARY' && selectedNumber && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Confirm Rental</h3>
                                <p className="text-gray-500 text-sm">Review your order details below</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-zinc-700">
                                    <span className="text-gray-500 text-sm">Number</span>
                                    <span className="font-mono font-bold text-lg">{selectedNumber.number}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-zinc-700">
                                    <span className="text-gray-500 text-sm">Country</span>
                                    <span className="font-bold">{country === 'NG' ? 'Nigeria 🇳🇬' : country === 'US' ? 'United States 🇺🇸' : 'United Kingdom 🇬🇧'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-zinc-700">
                                    <span className="text-gray-500 text-sm">Duration</span>
                                    <span className="font-bold">30 Days</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 text-sm">Total Due</span>
                                    <span className="font-bold text-xl text-indigo-600">₦{(prices[country] || 5000).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsPinModalOpen(true)}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Confirm & Pay ₦{(prices[country] || 5000).toLocaleString()}
                            </button>

                            <button onClick={() => setStep('SELECT')} className="w-full py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl">
                                Back to Selection
                            </button>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold mb-2">Number Active!</h4>
                            <p className="text-gray-500 mb-6">Your new number is ready to receive SMS.</p>
                            <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={confirmRent}
                title="Confirm Rental"
                description={`Enter PIN to rent ${selectedNumber?.number} for ₦${(prices[country] || 5000).toLocaleString()}`}
            />
        </div>
    );
}
