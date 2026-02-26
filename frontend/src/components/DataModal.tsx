"use client";

import { useState } from 'react';
import { X, Wifi, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface DataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NETWORKS = [
    {
        id: '01', name: 'MTN', color: 'bg-yellow-400 text-yellow-900', plans: [
            { id: '100', name: '1GB SME', price: 250, validity: '30 Days' },
            { id: '101', name: '2GB SME', price: 500, validity: '30 Days' },
            { id: '102', name: '5GB SME', price: 1250, validity: '30 Days' },
        ]
    },
    {
        id: '02', name: 'GLO', color: 'bg-green-600 text-white', plans: [
            { id: '200', name: '1.05GB', price: 450, validity: '14 Days' },
            { id: '201', name: '2.5GB', price: 950, validity: '30 Days' },
        ]
    },
    {
        id: '03', name: '9MOBILE', color: 'bg-green-800 text-white', plans: [
            { id: '300', name: '1GB', price: 900, validity: '30 Days' },
        ]
    },
    {
        id: '04', name: 'AIRTEL', color: 'bg-red-600 text-white', plans: [
            { id: '400', name: '750MB', price: 500, validity: '14 Days' },
            { id: '401', name: '1.5GB', price: 1000, validity: '30 Days' },
        ]
    }
];

export default function DataModal({ isOpen, onClose }: DataModalProps) {
    const [network, setNetwork] = useState('');
    const [plan, setPlan] = useState<any>(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const handlePurchase = async (pin: string) => {
        setIsPinOpen(false);
        setLoading(true);
        setError('');

        try {
            await api.post('/products/data', {
                networkId: network,
                planId: plan.id,
                phoneNumber: phone,
                amount: plan.price,
                pin
            });
            setSuccess('Data purchase successful!');
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

    const selectedNetwork = NETWORKS.find(n => n.id === network);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 lg:max-w-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-green-600" /> Buy Data
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
                                    onClick={() => { setNetwork(net.id); setPlan(null); }}
                                    className={`py-3 rounded-xl font-bold text-xs transition-all ${network === net.id ? 'ring-2 ring-offset-2 ring-green-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'} ${net.color}`}
                                >
                                    {net.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedNetwork && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Plan</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {selectedNetwork.plans.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlan(p)}
                                        className={`p-3 rounded-xl border text-left transition-all ${plan?.id === p.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}`}
                                    >
                                        <div className="font-bold text-gray-900 dark:text-white">{p.name}</div>
                                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                                            <span>₦{p.price}</span>
                                            <span>{p.validity}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="080..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (!network || !phone || !plan) { setError('Fill all fields'); return; }
                            setIsPinOpen(true);
                        }}
                        disabled={loading}
                        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl mt-4 hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Purchase Data'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handlePurchase} title="Confirm Data Bundle" description={`Buy ${plan?.name} for ${phone} at ₦${plan?.price}`} />
        </div>
    );
}
