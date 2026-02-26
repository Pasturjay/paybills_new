"use client";

import { useState } from 'react';
import { X, Zap, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface ElectricityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDERS = [
    { id: 'ikedc', name: 'Ikeja', color: 'bg-yellow-600 text-white' },
    { id: 'ekedc', name: 'Eko', color: 'bg-indigo-600 text-white' },
    { id: 'aedc', name: 'Abuja', color: 'bg-green-600 text-white' },
    { id: 'ibedc', name: 'Ibadan', color: 'bg-red-600 text-white' }
];

export default function ElectricityModal({ isOpen, onClose }: ElectricityModalProps) {
    const [provider, setProvider] = useState('');
    const [meterNumber, setMeterNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [validating, setValidating] = useState(false);
    const [amount, setAmount] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const validateMeter = async () => {
        if (!provider || !meterNumber) return;
        if (meterNumber.length < 10) return;

        setValidating(true);
        setError('');
        try {
            // Mock validation or real API
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1000));
            setCustomerName('MOCK USER NAME');
        } catch (err) {
            setError('Validation failed');
            setCustomerName('');
        } finally {
            setValidating(false);
        }
    };

    const handlePurchase = async (pin: string) => {
        setIsPinOpen(false);
        setLoading(true);
        setError('');

        try {
            await api.post('/products/electricity', {
                providerId: provider,
                meterNumber,
                amount: Number(amount),
                pin
            });
            setSuccess('Payment successful! Token sent to SMS.');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Purchase failed');
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
                            <Zap className="w-5 h-5 text-yellow-500" /> Pay Electricity
                        </h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Provider</label>
                        <div className="grid grid-cols-4 gap-2">
                            {PROVIDERS.map((prov) => (
                                <button
                                    key={prov.id}
                                    onClick={() => { setProvider(prov.id); setCustomerName(''); }}
                                    className={`py-2 px-1 rounded-xl font-bold text-xs transition-all ${provider === prov.id ? 'ring-2 ring-offset-2 ring-yellow-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'} ${prov.color}`}
                                >
                                    {prov.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Meter Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter Meter Number"
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                                onBlur={validateMeter}
                            />
                            {validating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-gray-400" />}
                            {customerName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                        </div>
                        {customerName && <div className="text-xs text-green-600 mt-1 font-bold">{customerName}</div>}
                    </div>

                    {customerName && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-yellow-500 mb-2 font-bold text-lg"
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
                            if (!provider || !meterNumber || !amount) { setError('Fill all fields'); return; }
                            setIsPinOpen(true);
                        }}
                        disabled={loading || !customerName}
                        className="w-full py-4 bg-yellow-500 text-white font-bold rounded-xl mt-4 hover:bg-yellow-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Buy Token'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handlePurchase} title="Confirm Payment" description={`Pay ₦${Number(amount).toLocaleString()} for Electricity Token`} />
        </div>
    );
}
