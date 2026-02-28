import { useState, useEffect } from 'react';
import { X, Gift, AtSign, ChevronRight, AlertCircle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';
import PinModal from './PinModal';
import { SUCCESS_MESSAGES, FAILURE_MESSAGES, getRandomMessage } from '@/lib/humorousMessages';

interface GiftUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GiftUserModal({ isOpen, onClose, onSuccess }: GiftUserModalProps) {
    const [step, setStep] = useState<'details' | 'confirm' | 'status'>('details');
    const [statusType, setStatusType] = useState<'success' | 'failure'>('success');
    const [humorousMessage, setHumorousMessage] = useState('');

    const [formData, setFormData] = useState({
        recipient: '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Recipient Resolution
    const [resolvedRecipient, setResolvedRecipient] = useState<{ name: string, tag?: string } | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const query = formData.recipient.trim();
        if (query.length < 3) {
            setResolvedRecipient(null);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsResolving(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const { name, userTag } = await api.post('/wallet/transfer/lookup', { query }, token);
                setResolvedRecipient({ name, tag: userTag });
                setError('');
            } catch (err: any) {
                setResolvedRecipient(null);
            } finally {
                setIsResolving(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.recipient]);

    const handleSend = async (pin: string) => {
        setIsPinModalOpen(false);
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const payload: any = {
                amount: Number(formData.amount),
                pin,
                description: formData.description,
                idempotencyKey
            };

            const rawRecipient = formData.recipient.trim();
            if (resolvedRecipient?.tag) {
                payload.recipientTag = resolvedRecipient.tag;
            } else if (rawRecipient.startsWith('@')) {
                payload.recipientTag = rawRecipient;
            } else if (rawRecipient.includes('@')) {
                payload.recipientEmail = rawRecipient;
            } else {
                payload.recipientPhone = rawRecipient;
            }

            await api.post('/wallet/transfer', payload, token);

            setStatusType('success');
            setHumorousMessage(getRandomMessage(SUCCESS_MESSAGES));
            setStep('status');
            setIdempotencyKey(uuidv4());
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Gifting failed');
            setStatusType('failure');
            setHumorousMessage(getRandomMessage(FAILURE_MESSAGES));
            setStep('status');
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep('details');
        setFormData({ recipient: '', amount: '', description: '' });
        setResolvedRecipient(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[100]">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 overflow-hidden">

                {step === 'status' ? (
                    <div className="py-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${statusType === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                            {statusType === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                        </div>

                        <h3 className="text-2xl font-black mb-2 dark:text-white">
                            {statusType === 'success' ? 'Gift Delivered!' : 'Transfer Failed'}
                        </h3>

                        {statusType === 'success' ? (
                            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl mb-8 border border-gray-100 dark:border-white/5 italic text-gray-600 dark:text-gray-400 font-medium">
                                "{humorousMessage}"
                            </div>
                        ) : (
                            <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 rounded-2xl mb-8 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-medium text-sm flex flex-col gap-1 items-center">
                                <span className="uppercase text-[10px] tracking-widest font-black opacity-70">Reason</span>
                                <span>{error || 'An unexpected error occurred.'}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {statusType === 'failure' && (
                                <button
                                    onClick={resetAndClose}
                                    className="w-1/3 py-4 rounded-xl font-bold bg-transparent border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (statusType === 'success') {
                                        resetAndClose();
                                    } else {
                                        setStep('details');
                                        setIdempotencyKey(uuidv4());
                                    }
                                }}
                                className={`py-4 rounded-xl font-bold transition-all shadow-lg ${statusType === 'success'
                                    ? 'w-full bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'
                                    : 'w-2/3 bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                                    }`}
                            >
                                {statusType === 'success' ? 'Great! Back Home' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-purple-600" /> Gift User
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gift money instantly via Tag, Email or Phone</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="@Tag, Email or Phone"
                                        value={formData.recipient}
                                        onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                                        className={`w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-zinc-800 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${resolvedRecipient ? 'border-green-500 dark:border-green-500/50' : 'border-gray-200 dark:border-zinc-700'}`}
                                    />
                                    {isResolving && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 animate-spin" />
                                    )}
                                    {!isResolving && resolvedRecipient && (
                                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                {resolvedRecipient ? (
                                    <div className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 ml-1 flex items-center gap-1 group">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified: {resolvedRecipient.name} {resolvedRecipient.tag && `(${resolvedRecipient.tag})`}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 mt-1 ml-1 flex items-center gap-1">
                                        <AtSign className="w-3 h-3" /> Use @tag for instant identification
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg font-bold"
                                    />
                                </div>
                                {formData.amount && Number(formData.amount) > 0 && (
                                    <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-1 ml-1 uppercase tracking-widest">
                                        Estimated Fee: ₦0.00 (Free Gifting)
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase/Transfer Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lunch from yesterday, Support..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={() => {
                                    if (!formData.recipient || !formData.amount) {
                                        setError('Please fill in all required fields');
                                        return;
                                    }
                                    if (!resolvedRecipient) {
                                        setError('Please enter a valid recipient identifier');
                                        return;
                                    }
                                    setIsPinModalOpen(true);
                                }}
                                disabled={loading || isResolving}
                                className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-purple-500/20 active:scale-95"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Uplifting bits...
                                    </div>
                                ) : (
                                    <>
                                        Send Gift <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSend}
                title="Confirm Gift"
                description={`Gift ₦${Number(formData.amount).toLocaleString()} to ${resolvedRecipient?.name || 'User'}?`}
            />
        </div>
    );
}
