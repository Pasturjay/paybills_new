"use client";

import { useState } from 'react';
import { X, ChevronRight, Loader2, Download, Search, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';
import PinModal from './PinModal';
import { useRouter } from 'next/navigation';

interface SoftwareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const POPULAR_SOFTWARE = [
    { id: 'win11', name: 'Windows 11 Pro', price: 15000, category: 'OS' },
    { id: 'office365', name: 'Office 365 Personal', price: 25000, category: 'Productivity' },
    { id: 'kaspersky', name: 'Kaspersky Total Security', price: 8500, category: 'Security' },
    { id: 'adobe', name: 'Adobe Creative Cloud', price: 45000, category: 'Creative' },
];

export default function SoftwareModal({ isOpen, onClose }: SoftwareModalProps) {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPinOpen, setIsPinOpen] = useState(false);

    const handlePurchase = async (pin: string) => {
        setIsPinOpen(false);
        setLoading(true);
        setError('');

        try {
            await new Promise(r => setTimeout(r, 1500));
            // Mock purchase logic

            setSuccess('License Key sent to your email!');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-500" /> Software Store
                        </h3>
                        <p className="text-sm text-gray-500">Quick purchase popular licenses</p>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm">{success}</div>}

                {!selectedProduct ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                            {POPULAR_SOFTWARE.map((prod) => (
                                <button
                                    key={prod.id}
                                    onClick={() => setSelectedProduct(prod)}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group text-left"
                                >
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600">{prod.name}</div>
                                        <div className="text-xs text-gray-500">{prod.category}</div>
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white">₦{prod.price.toLocaleString()}</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push('/products/software')}
                            className="w-full py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl mt-2 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2"
                        >
                            <LayoutGrid className="w-4 h-4" /> View Full Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                            <div className="text-sm text-gray-500 mb-1">Buying</div>
                            <div className="font-bold text-lg">{selectedProduct.name}</div>
                            <div className="font-bold text-blue-600 text-xl">₦{selectedProduct.price.toLocaleString()}</div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 font-bold rounded-xl"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setIsPinOpen(true)}
                                className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                Pay Now <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <PinModal isOpen={isPinOpen} onClose={() => setIsPinOpen(false)} onSuccess={handlePurchase} title="Confirm Purchase" description={`Pay ₦${selectedProduct?.price.toLocaleString()} for ${selectedProduct?.name}`} />
        </div>
    );
}
