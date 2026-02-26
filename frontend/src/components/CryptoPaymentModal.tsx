import { X, Copy, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { useState, useEffect } from "react";

interface CryptoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    title: string;
}

export function CryptoPaymentModal({ isOpen, onClose, onSuccess, amount, title }: CryptoPaymentModalProps) {
    const [step, setStep] = useState<'ADDRESS' | 'VERIFYING' | 'SUCCESS'>('ADDRESS');
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

    useEffect(() => {
        if (!isOpen) {
            setStep('ADDRESS');
            setTimeLeft(3600);
        }
    }, [isOpen]);

    // Timer
    useEffect(() => {
        if (step !== 'ADDRESS') return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [step]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Address copied!");
    };

    const handlePaid = () => {
        setStep('VERIFYING');
        // Simulate network verification
        setTimeout(() => {
            setStep('SUCCESS');
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Crypto Payment</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 'ADDRESS' && (
                        <>
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-500 mb-1">Send exact amount</div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">{(amount / 1600).toFixed(2)} USDT</div>
                                <div className="text-xs text-blue-500 font-bold mt-1">1 USDT ≈ ₦1,600</div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center mb-6">
                                <div className="bg-white p-2 rounded-xl shadow-sm mb-4">
                                    <QrCode className="w-32 h-32 text-gray-900" />
                                </div>
                                <div className="text-xs text-gray-500 mb-2">Network: TRC20</div>
                                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 w-full">
                                    <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate flex-1">
                                        TE2R6J7K8L9M0N1P2Q3R4S5T6U7V8W9X0Y
                                    </span>
                                    <button onClick={() => handleCopy("TE2R6J7K8L9M0N1P2Q3R4S5T6U7V8W9X0Y")} className="text-blue-600">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-center text-xs text-red-500 font-bold mb-6">
                                Expires in {formatTime(timeLeft)}
                            </div>

                            <button
                                onClick={handlePaid}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                I Have Sent The Payment
                            </button>
                        </>
                    )}

                    {step === 'VERIFYING' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Verifying Payment</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Please wait while we confirm your transaction on the blockchain...
                            </p>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Confirmed!</h3>
                            <p className="text-gray-500">Redirecting...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
