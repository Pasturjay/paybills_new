"use client";

import { useState, useEffect } from 'react';
import { X, Phone, RefreshCw, Calendar, MessageSquare, Copy, AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface VirtualNumber {
    id: string;
    phoneNumber: string;
    status: string;
    subscription?: { nextBillingDate: string; autoRenew: boolean };
}

interface SmsMessage {
    id: string;
    sender: string;
    message: string;
    receivedAt: string;
}

interface VirtualNumberDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    virtualNumber: VirtualNumber | null;
    onUpdate: () => void;
}

export default function VirtualNumberDashboard({ isOpen, onClose, virtualNumber, onUpdate }: VirtualNumberDashboardProps) {
    const [messages, setMessages] = useState<SmsMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [tab, setTab] = useState<'inbox' | 'settings'>('inbox');

    const fetchMessages = async () => {
        if (!virtualNumber) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const res = await api.get(`/virtual-numbers/${virtualNumber.id}/messages`, token);
                setMessages(res);
            }
        } catch (error) {
            console.error('Failed messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!virtualNumber || !confirm('Are you sure you want to cancel this number? You will lose access immediately.')) return;
        setCancelling(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await api.post('/virtual-numbers/cancel', { id: virtualNumber.id }, token);
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error('Cancel failed', error);
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (isOpen && virtualNumber) {
            fetchMessages();
            // Poll for messages every 10s if open
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen, virtualNumber]);

    if (!isOpen || !virtualNumber) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[600px] rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{virtualNumber.phoneNumber}</h2>
                                <button onClick={() => navigator.clipboard.writeText(virtualNumber.phoneNumber)} className="text-gray-400 hover:text-blue-500">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${virtualNumber.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {virtualNumber.status}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Renews: {new Date(virtualNumber.subscription?.nextBillingDate || '').toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-zinc-800">
                    <button
                        onClick={() => setTab('inbox')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${tab === 'inbox' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Inbox
                    </button>
                    <button
                        onClick={() => setTab('settings')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${tab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                        <RefreshCw className="w-4 h-4" /> Subscription
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 p-6">
                    {tab === 'inbox' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Received SMS (OTPs)</h3>
                                <button onClick={fetchMessages} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
                                </button>
                            </div>

                            {messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No messages received yet.</p>
                                    <p className="text-xs mt-1">Send an SMS to this number to test.</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs">{msg.sender}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(msg.receivedAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                        {/* OTP Highlight Heuristic */}
                                        {msg.message.match(/\b\d{4,6}\b/) && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Possible Code:</span>
                                                <code className="bg-gray-200 dark:bg-black px-2 py-1 rounded font-bold text-lg select-all cursor-pointer hover:text-blue-500" onClick={(e) => navigator.clipboard.writeText(e.currentTarget.innerText)}>
                                                    {msg.message.match(/\b\d{4,6}\b/)?.[0]}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Subscription Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{virtualNumber.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Next Billing Date</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{new Date(virtualNumber.subscription?.nextBillingDate || '').toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Auto-Renew</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{virtualNumber.subscription?.autoRenew ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Price</span>
                                        <span className="font-bold text-gray-900 dark:text-white">₦5,000/month</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-red-100 dark:border-red-900/30 rounded-2xl p-6 bg-red-50/50 dark:bg-red-900/5">
                                <h3 className="font-bold text-red-600 flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Cancelling will immediately release this number. You will not be able to receive any more messages.
                                </p>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full py-3 bg-white dark:bg-zinc-800 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    {cancelling ? 'Cancelling...' : <><Trash2 className="w-4 h-4" /> Cancel Number</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
