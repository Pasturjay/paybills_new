"use client";

import { useState } from 'react';
import { X, Tv, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';
import PinModal from './PinModal';

interface CableModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDERS = [
    { id: 'dstv', name: 'DSTV', color: 'bg-blue-600 text-white' },
    { id: 'gotv', name: 'GOTV', color: 'bg-green-600 text-white' },
    { id: 'startimes', name: 'StarTimes', color: 'bg-purple-600 text-white' }
];

export default function CableModal({ isOpen, onClose }: CableModalProps) {
    const [provider, setProvider] = useState('');
    const [smartcard, setSmartcard] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [validating, setValidating] = useState(false);
    const [packageId, setPackageId] = useState('');

    // Mock Packages - In real app, fetch packages after selecting provider or validation
    const PACKAGES = [
        { id: 'basic', name: 'Compact', price: 12500 },
        { id: 'premium', name: 'Premium', price: 29500 },
        { id: 'jolli', name: 'Jolli', price: 3500 },
    ];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const validateSmartcard = async () => {
        if (!provider || !smartcard) return;
        setValidating(true);
        setError('');
        try {
            const res = await api.post('/products/cable/validate', { providerId: provider, smartcardNumber: smartcard });
            if (res.isValid) {
                setCustomerName(res.customerName);
            } else {
                setError('Invalid Smartcard Number');
                setCustomerName('');
            }
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

        const selectedPack = PACKAGES.find(p => p.id === packageId);

        try {
            await api.post('/products/cable', {
                providerId: provider,
                packageId,
                smartcardNumber: smartcard,
                amount: selectedPack?.price,
                pin,
                idempotencyKey
            });
            setSuccess('Subscription successful!');
            setIdempotencyKey(uuidv4());
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
    const selectedPack = PACKAGES.find(p => p.id === packageId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Tv className="w-5 h-5 text-orange-600" /> Pay Cable TV
                        </h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Provider</label>
                        <div className="grid grid-cols-3 gap-3">
                            {PROVIDERS.map((prov) => (
                                <button
                                    key={prov.id}
                                    onClick={() => { setProvider(prov.id); setCustomerName(''); }}
                                    className={`py-3 rounded-xl font-bold text-sm transition-all ${provider === prov.id ? 'ring-2 ring-offset-2 ring-orange-500 scale-105 shadow-md' : 'opacity-60 hover:opacity-100'} ${prov.color}`}
                                >
                                    {prov.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Smartcard Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter Number"
                                value={smartcard}
                                onChange={(e) => setSmartcard(e.target.value)}
                                onBlur={validateSmartcard}
                            />
                            {validating && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-gray-400" />}
                            {customerName && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                        </div>
                        {customerName && <div className="text-xs text-green-600 mt-1 font-bold">{customerName}</div>}
                    </div>

                    {customerName && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Package</label>
                            <select
                                onChange={(e) => setPackageId(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Select Package</option>
                                {PACKAGES.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₦{p.price.toLocaleString()}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            if (!provider || !smartcard || !packageId) { setError('Fill all fields'); return; }
                            setIsPinOpen(true);
                        }}
                        disabled={loading || !customerName}
                        className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl mt-4 hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Subscribe'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handlePurchase} title="Confirm Subscription" description={`Pay ₦${selectedPack?.price} for ${selectedPack?.name}`} />
        </div>
    );
}
