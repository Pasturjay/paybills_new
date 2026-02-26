"use client";

import { X, Lock, Loader2, Delete } from "lucide-react";
import { useState, useEffect } from "react";

interface PinVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => void;
    loading?: boolean;
    title?: string;
    error?: string;
}

export function PinVerificationModal({ isOpen, onClose, onVerify, loading = false, title = "Enter Transaction PIN", error }: PinVerificationModalProps) {
    const [pin, setPin] = useState("");

    // Reset PIN when modal opens
    useEffect(() => {
        if (isOpen) {
            setPin("");
        }
    }, [isOpen]);

    // Reset PIN when an error occurs so the user can re-enter
    useEffect(() => {
        if (error) {
            setPin("");
        }
    }, [error]);

    // Handle Number Click
    const handleNumberClick = (num: number) => {
        if (pin.length < 4) {
            setPin((prev) => prev + num);
        }
    };

    // Handle Delete
    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
    };

    // Auto-submit when length is 4
    useEffect(() => {
        if (pin.length === 4) {
            onVerify(pin);
        }
    }, [pin, onVerify]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className={`relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden`}>
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Security</div>
                    <div className="w-6"></div> {/* Spacer */}
                </div>

                <div className="px-6 pb-8 text-center min-h-[400px] flex flex-col justify-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Please enter your 4-digit PIN to authorize this transaction.
                    </p>

                    {error && (
                        <div className="mb-4 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* PIN Display */}
                    <div className="flex justify-center gap-4 mb-8">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-colors duration-200 ${i < pin.length
                                    ? (error ? "bg-red-500" : "bg-blue-600")
                                    : "bg-gray-200 dark:bg-zinc-700"
                                    }`}
                            ></div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-blue-600">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="text-sm font-bold">Verifying...</p>
                        </div>
                    ) : (
                        /* Keypad */
                        <div className="grid grid-cols-3 gap-y-4 gap-x-8 max-w-[240px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num)}
                                    className="w-16 h-16 rounded-full text-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="w-16 h-16"></div>
                            <button
                                onClick={() => handleNumberClick(0)}
                                className="w-16 h-16 rounded-full text-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                            >
                                0
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-16 h-16 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
                            >
                                <Delete className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
