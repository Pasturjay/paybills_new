"use client";

import { useEffect, useState } from 'react';
import {
    Phone, Search, Copy, RefreshCw, Plus, Globe,
    CheckCircle, ShieldCheck, CreditCard, MessageSquare,
    ArrowUpRight, List, Check
} from 'lucide-react';

import VirtualNumberModal from '@/components/VirtualNumberModal';
import { FundWalletModal } from '@/components/FundWalletModal';

/**
 * Types and Interfaces
 */
interface VirtualNumber {
    id: string;
    phoneNumber: string;
    countryCode: string;
    countryName: string;
    status: 'ACTIVE' | 'EXPIRED';
    createdAt: string;
    messages: Message[];
}

interface Message {
    id: string;
    sender: string;
    message: string;
    receivedAt: string;
    read: boolean;
}

interface CountryPricing {
    code: string;
    name: string;
    price: number;
    flag: string;
}

const COUNTRIES: CountryPricing[] = [
    { code: 'US', name: 'United States', price: 6000, flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', price: 6000, flag: '🇬🇧' },
    { code: 'NG', name: 'Nigeria', price: 5000, flag: '🇳🇬' },
    // Add more as needed
];

export default function VirtualNumbersDashboard() {
    const [activeTab, setActiveTab] = useState<'my-numbers' | 'marketplace'>('my-numbers');
    const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchNumbers();
    }, []);

    const fetchNumbers = async () => {
        try {
            // Mock Data for now
            setTimeout(() => {
                setNumbers([
                    {
                        id: '1', phoneNumber: '+1 (555) 123-4567', countryCode: 'US', countryName: 'United States', status: 'ACTIVE', createdAt: '2024-01-01',
                        messages: [
                            { id: 'm1', sender: 'Google', message: 'Your Google verification code is 123456.', receivedAt: '2024-02-09T10:00:00', read: false },
                            { id: 'm2', sender: 'WhatsApp', message: 'WhatsApp code: 998-221.', receivedAt: '2024-02-08T15:30:00', read: true },
                        ]
                    },
                    {
                        id: '2', phoneNumber: '+44 7700 900077', countryCode: 'GB', countryName: 'United Kingdom', status: 'ACTIVE', createdAt: '2024-01-15',
                        messages: []
                    }
                ]);
                setLoading(false);
            }, 600);

        } catch (error) {
            console.error("Failed to fetch numbers", error);
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-sm backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Phone className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Virtual Numbers
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium">Manage your private inbox and receive secure OTPs globally.</p>
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex p-1.5 bg-gray-100/50 dark:bg-black/50 backdrop-blur-md rounded-2xl w-full md:w-fit border border-gray-200/50 dark:border-zinc-800/50">
                    <button
                        onClick={() => setActiveTab('my-numbers')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 ${activeTab === 'my-numbers'
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white scale-100 border border-gray-200 dark:border-zinc-700'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 border border-transparent'
                            }`}
                    >
                        <List className="w-4 h-4" /> My Inbox
                    </button>
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 ${activeTab === 'marketplace'
                            ? 'bg-blue-600 dark:bg-blue-500 shadow-md text-white scale-100 border border-blue-500/20'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 scale-95 border border-transparent'
                            }`}
                    >
                        <Globe className="w-4 h-4" /> Get Number
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/30 rounded-full animate-pulse"></div>
                            <div className="w-16 h-16 border-4 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin absolute top-0 left-0"></div>
                        </div>
                        <p className="mt-4 text-gray-500 font-bold animate-pulse">Syncing Inbox...</p>
                    </div>
                ) : (
                    <>
                        {/* MY NUMBERS TAB */}
                        {activeTab === 'my-numbers' && (
                            <MyNumbersInbox numbers={numbers} onRentNew={() => setActiveTab('marketplace')} />
                        )}

                        {/* MARKETPLACE TAB */}
                        {activeTab === 'marketplace' && (
                            <MarketplaceView onRentClick={() => setIsRentModalOpen(true)} />
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <VirtualNumberModal
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                onSuccess={() => {
                    fetchNumbers();
                    setActiveTab('my-numbers');
                }}
            />
            <FundWalletModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
            />
        </div>
    );
}

/**
 * Modern Inbox View (Replaces the Terminal)
 */
function MyNumbersInbox({ numbers, onRentNew }: { numbers: VirtualNumber[]; onRentNew: () => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(numbers.length > 0 ? numbers[0].id : null);
    const activeNumber = numbers.find(n => n.id === selectedId);
    const [copiedNumber, setCopiedNumber] = useState(false);
    const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

    const handleCopyNumber = (num: string) => {
        navigator.clipboard.writeText(num);
        setCopiedNumber(true);
        setTimeout(() => setCopiedNumber(false), 2000);
    };

    const handleCopyMsg = (text: string, id: string) => {
        // Extract 6 digit numbers or the whole text if not found
        const codeMatch = text.match(/\b\d{4,8}\b/);
        navigator.clipboard.writeText(codeMatch ? codeMatch[0] : text);
        setCopiedMsgId(id);
        setTimeout(() => setCopiedMsgId(null), 2000);
    };


    if (numbers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-zinc-900/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-[2rem] flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 rotate-12 shadow-lg shadow-blue-500/10">
                    <MessageSquare className="w-10 h-10 -rotate-12" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Your Private Inbox is Empty</h3>
                <p className="text-gray-500 max-w-sm text-center mb-8 font-medium">
                    Get a dedicated global phone number to securely receive SMS verification codes directly in this dashboard.
                </p>
                <button
                    onClick={onRentNew}
                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Get a Number Now
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[700px]">
            {/* Sidebar: Number List */}
            <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-2 pb-10">
                {numbers.map(num => (
                    <button
                        key={num.id}
                        onClick={() => setSelectedId(num.id)}
                        className={`w-full text-left p-5 rounded-[1.5rem] transition-all border-2 relative overflow-hidden group 
                            ${selectedId === num.id
                                ? 'bg-white dark:bg-zinc-900 border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'bg-white/50 dark:bg-zinc-900/30 border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-zinc-700'
                            }`}
                    >
                        {selectedId === num.id && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        )}
                        <div className="flex justify-between items-start relative z-10 w-full mb-3">
                            <div className="text-3xl filter drop-shadow-sm">
                                {COUNTRIES.find(c => c.code === num.countryCode)?.flag}
                            </div>
                            <div className="flex bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full items-center gap-1.5 border border-green-200/50 dark:border-green-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{num.countryName}</p>
                            <h3 className={`text-xl font-black tracking-tight ${selectedId === num.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                {num.phoneNumber}
                            </h3>
                        </div>
                    </button>
                ))}

                <button
                    onClick={onRentNew}
                    className="w-full py-5 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-[1.5rem] text-gray-500 dark:text-zinc-400 font-bold hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex hidden md:flex items-center justify-center gap-2 mt-2"
                >
                    <Plus className="w-5 h-5" /> Deploy Another
                </button>
            </div>

            {/* Main Area: The Inbox */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col h-full overflow-hidden relative">
                {activeNumber ? (
                    <>
                        {/* Header Data Card */}
                        <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800 border-b border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10">
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Inbox
                                </p>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                        {activeNumber.phoneNumber}
                                    </h2>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCopyNumber(activeNumber.phoneNumber)}
                                className={`relative z-10 flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-sm ${copiedNumber ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:scale-105 hover:shadow-md'}`}
                            >
                                {copiedNumber ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copiedNumber ? 'Copied!' : 'Copy Number'}
                            </button>
                        </div>

                        {/* Messages Chat Area */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/50 dark:bg-[#09090b]">
                            {activeNumber.messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-75">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <RefreshCw className="w-8 h-8 text-gray-400 dark:text-zinc-500 animate-spin-slow" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Listening for incoming OTPs...</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">Messages sent to {activeNumber.phoneNumber} will appear here instantly.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-block px-4 py-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            Today
                                        </div>
                                    </div>

                                    {activeNumber.messages.map((msg) => (
                                        <div key={msg.id} className="flex gap-4 items-start select-text group">
                                            {/* Avatar logic based on sender */}
                                            <div className="w-12 h-12 shrink-0 rounded-[1.2rem] bg-gradient-to-br from-blue-100 to-blue-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-xl shadow-inner font-bold text-blue-800 dark:text-zinc-400 border border-white/50 dark:border-white/5 mt-2">
                                                {msg.sender.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex-1 max-w-[85%]">
                                                <div className="flex items-baseline gap-2 mb-1 pl-1">
                                                    <span className="font-bold text-gray-900 dark:text-white">{msg.sender}</span>
                                                    <span className="text-xs font-semibold text-gray-400">{new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                <div className="bg-white dark:bg-zinc-800 p-5 rounded-[1.5rem] rounded-tl-sm border border-gray-100 dark:border-zinc-700/50 shadow-sm relative group-hover:shadow-md transition-shadow">
                                                    <p className="text-gray-700 dark:text-gray-200 text-sm md:text-base leading-relaxed break-words">{msg.message}</p>

                                                    {/* Smart Copy Button Overlay */}
                                                    <button
                                                        onClick={() => handleCopyMsg(msg.message, msg.id)}
                                                        className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-16 md:opacity-0 md:group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-zinc-700 rounded-xl p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:scale-110 z-10"
                                                        title="Copy Code extracted from message"
                                                    >
                                                        {copiedMsgId === msg.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
                        <Search className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-medium">Select a target number to view inbox.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Modern Marketplace View
 */
function MarketplaceView({ onRentClick }: { onRentClick: () => void }) {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
                        <ShieldCheck className="w-4 h-4 text-green-400" /> 100% Private Ownership
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                        Global access, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Guaranteed privacy.</span>
                    </h2>
                    <p className="text-indigo-100/80 text-lg md:text-xl mb-10 leading-relaxed font-medium">
                        Rent dedicated, non-VoIP numbers from 20+ countries.
                        Perfect for circumventing geo-blocks and receiving secure OTPs from WhatsApp, Telegram, and Google.
                    </p>
                    <button
                        onClick={onRentClick}
                        className="w-full md:w-auto px-10 py-5 bg-white text-indigo-900 font-black text-lg rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex justify-center items-center gap-3"
                    >
                        <Search className="w-6 h-6" /> Explore Country Catalog
                    </button>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 pointer-events-none"></div>
                <Globe className="absolute right-10 top-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-10 blur-[2px] pointer-events-none stroke-1" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
                {COUNTRIES.map(country => (
                    <button
                        key={country.code}
                        onClick={onRentClick}
                        className="group bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10 text-left relative overflow-hidden"
                    >
                        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 origin-left drop-shadow-sm">
                            {country.flag}
                        </div>
                        <div className="font-black text-xl text-gray-900 dark:text-white mb-2 tracking-tight">{country.name}</div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400 font-bold bg-gray-100 dark:bg-zinc-800 w-fit px-3 py-1 rounded-lg">₦{country.price.toLocaleString()} / mo</div>

                        <div className="absolute top-6 right-6 w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <FeatureCard
                    icon={ShieldCheck}
                    title="Exclusive Access"
                    desc="Numbers are privately leased to you. No shared SMS pools, ensuring maximum security for your OTPs."
                    color="text-emerald-500"
                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                />
                <FeatureCard
                    icon={CreditCard}
                    title="Pay As You Go"
                    desc="Fund from your Paybills wallet. Maintain the number monthly and cancel anytime with zero hidden fees."
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-900/20"
                />
                <FeatureCard
                    icon={MessageSquare}
                    title="Push Notifications"
                    desc="Receive alerts directly on this dashboard the moment your verification codes arrive."
                    color="text-purple-500"
                    bg="bg-purple-50 dark:bg-purple-900/20"
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color, bg }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6`}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-500 dark:text-zinc-400 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
