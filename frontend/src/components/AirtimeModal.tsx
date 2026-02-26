"use client";

import { useState } from 'react';
import { X, Smartphone, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface AirtimeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NETWORKS = [
    { id: '01', name: 'MTN', color: 'bg-yellow-400 text-yellow-900' },
    { id: '02', name: 'GLO', color: 'bg-green-600 text-white' },
    { id: '03', name: '9MOBILE', color: 'bg-green-800 text-white' },
    { id: '04', name: 'AIRTEL', color: 'bg-red-600 text-white' }
];

export default function AirtimeModal({ isOpen, onClose }: AirtimeModalProps) {
    const [network, setNetwork] = useState('');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const handlePurchase = async (pin: string) => {
        setIsPinOpen(false);
        setLoading(true);
        setError('');

        try {
            await api.post('/products/airtime', {
                networkId: network,
                phoneNumber: phone,
                amount: Number(amount),
                pin
            });
            setSuccess('Airtime purchase successful!');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2000);
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
                            <Smartphone className="w-5 h-5 text-blue-600" /> Buy Airtime
                        </h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Select Network</label>
                        <div className="grid grid-cols-4 gap-2">
                            {NETWORKS.map((net) => (
                                <button
                                    key={net.id}
                                    onClick={() => setNetwork(net.id)}
                                    className={`py-3 rounded-xl font-bold text-xs transition-all ${network === net.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'} ${net.color}`}
                                >
                                    {net.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="080..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                            <input
                                type="number"
                                className="w-full pl-10 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (!network || !phone || !amount) { setError('Fill all fields'); return; }
                            setIsPinOpen(true);
                        }}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Proceed'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handlePurchase} title="Confirm Airtime" description={`Buy ₦${amount} Airtime for ${phone}`} />
        </div>
    );
}
