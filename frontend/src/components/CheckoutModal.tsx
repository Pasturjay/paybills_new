import { X, ShieldCheck, Loader2, CreditCard, Wallet, Bitcoin } from "lucide-react";
import { useState } from "react";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'WALLET' | 'CARD' | 'CRYPTO') => void;
    amount: number;
    fee?: number;
    title: string;
    details: { label: string; value: string }[];
    loading?: boolean;
    paymentMethods?: ('WALLET' | 'CARD' | 'CRYPTO')[];
}

export function CheckoutModal({ isOpen, onClose, onConfirm, amount, fee = 0, title, details, loading, paymentMethods = ['WALLET'] }: CheckoutModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<'WALLET' | 'CARD' | 'CRYPTO'>('WALLET');

    if (!isOpen) return null;

    const total = amount + fee;

    const handleConfirm = () => {
        onConfirm(selectedMethod);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Confirm Transaction</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="text-center mb-8">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</div>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            ₦{total.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {details.map((detail, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-right">{detail.value}</span>
                            </div>
                        ))}
                        <div className="border-t border-dashed border-gray-200 dark:border-zinc-700 my-4"></div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Transaction Fee</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₦{fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                            <span className="text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-blue-600">₦{total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    {paymentMethods.length > 1 && (
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-3 text-left">Select Payment Method</label>
                            <div className="space-y-3">
                                {paymentMethods.includes('WALLET') && (
                                    <div
                                        onClick={() => setSelectedMethod('WALLET')}
                                        className={`p-4 border-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedMethod === 'WALLET' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedMethod === 'WALLET' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Pay from Wallet</div>
                                            <div className="text-xs text-gray-500">Balance: ₦50,000</div>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'WALLET' ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {selectedMethod === 'WALLET' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                        </div>
                                    </div>
                                )}

                                {paymentMethods.includes('CARD') && (
                                    <div
                                        onClick={() => setSelectedMethod('CARD')}
                                        className={`p-4 border-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedMethod === 'CARD' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedMethod === 'CARD' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Pay with Card</div>
                                            <div className="text-xs text-gray-500">Secure (Paystack/Flutterwave)</div>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'CARD' ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {selectedMethod === 'CARD' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                        </div>
                                    </div>
                                )}

                                {paymentMethods.includes('CRYPTO') && (
                                    <div
                                        onClick={() => setSelectedMethod('CRYPTO')}
                                        className={`p-4 border-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${selectedMethod === 'CRYPTO' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedMethod === 'CRYPTO' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                            <Bitcoin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">Pay with Crypto</div>
                                            <div className="text-xs text-gray-500">USDT, BTC, ETH</div>
                                        </div>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'CRYPTO' ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {selectedMethod === 'CRYPTO' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg mb-6">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Secured by 256-bit Encryption</span>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Proceed to Pay"}
                    </button>
                </div>
            </div>
        </div>
    );
}
