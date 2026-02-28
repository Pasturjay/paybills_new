"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    title?: string;
    description?: string;
}

export default function PinModal({ isOpen, onClose, onSuccess, title = "Enter Transaction PIN", description = "Please enter your 4-digit PIN to continue" }: PinModalProps) {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const wasSubmitted = useRef(false);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setError('');
            setIsSubmitting(false);
            wasSubmitted.current = false;
            // Focus first input after a short delay to allow modal animation
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent multiple chars
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if complete
        if (newPin.every(digit => digit !== '') && !wasSubmitted.current) {
            wasSubmitted.current = true;
            setIsSubmitting(true);
            onSuccess(newPin.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Lock className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${isSubmitting ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className={`flex justify-center gap-4 mb-6 transition-opacity ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => {
                                inputRefs.current[index] = el;
                            }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={isSubmitting}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all caret-blue-500"
                        />
                    ))}
                </div>

                {isSubmitting && (
                    <div className="flex items-center justify-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider">Verifying Securely...</span>
                    </div>
                )}

                {error && !isSubmitting && (
                    <p className="text-center text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                        {error}
                    </p>
                )}

                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                    <p>{isSubmitting ? 'Hang tight, we are almost there.' : 'Contact support if you forgot your PIN'}</p>
                </div>
            </div>
        </div>
    );
}
