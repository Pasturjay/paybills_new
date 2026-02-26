"use client";

import { useEffect, useState } from 'react';
import {
    Phone, Search, Copy, RefreshCw, Plus, Globe,
    CheckCircle, ShieldCheck, CreditCard, Mail,
    ChevronRight, Loader2, MessageSquare, Inbox,
    ArrowUpRight, LayoutGrid, List, Wifi
} from 'lucide-react';
import { api } from '@/lib/api';
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
    const [
        isRentModalOpen, setIsRentModalOpen
    ] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchNumbers();
    }, []);

    const fetchNumbers = async () => {
        try {
            // In a real app, this would be an API call
            // const res = await api.get('/products/virtual-number/my-numbers');
            // setNumbers(res);

            // Mock Data for now
            setTimeout(() => {
                setNumbers([
                    {
                        id: '1', phoneNumber: '+1 (555) 123-4567', countryCode: 'US', countryName: 'United States', status: 'ACTIVE', createdAt: '2024-01-01',
                        messages: [
                            { id: 'm1', sender: 'Google', message: 'Your verification code is 123456.', receivedAt: '2024-02-09T10:00:00', read: false },
                            { id: 'm2', sender: 'WhatsApp', message: 'WhatsApp code: 998-221.', receivedAt: '2024-02-08T15:30:00', read: true },
                        ]
                    },
                    {
                        id: '2', phoneNumber: '+44 7700 900077', countryCode: 'GB', countryName: 'United Kingdom', status: 'ACTIVE', createdAt: '2024-01-15',
                        messages: []
                    }
                ]);
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error("Failed to fetch numbers", error);
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 pb-32">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Virtual Numbers
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your secure private numbers.</p>
                </div>

                {/* Balance & Actions Card */}
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 pr-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="pl-4">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Balance</div>
                        <div className="font-mono font-bold text-lg">₦0.00</div>
                    </div>
                    <button
                        onClick={() => setIsDepositModalOpen(true)}
                        className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-2xl w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('my-numbers')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'my-numbers'
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <List className="w-4 h-4" /> My Numbers
                </button>
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'marketplace'
                            ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Globe className="w-4 h-4" /> Marketplace
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-50" />
                        <p>Loading your secure numbers...</p>
                    </div>
                ) : (
                    <>
                        {/* MY NUMBERS TAB */}
                        {activeTab === 'my-numbers' && (
                            <MyNumbersView numbers={numbers} onRentNew={() => setActiveTab('marketplace')} />
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
 * Sub-components (could be in separate files, keeping here for simplicity as per request)
 */

function MyNumbersView({ numbers, onRentNew }: { numbers: VirtualNumber[]; onRentNew: () => void }) {
    const [selectedId, setSelectedId] = useState<string | null>(numbers.length > 0 ? numbers[0].id : null);
    const activeNumber = numbers.find(n => n.id === selectedId);

    if (numbers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-zinc-800">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 text-indigo-500">
                    <Phone className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Numbers</h3>
                <p className="text-gray-500 max-w-sm text-center mb-8">
                    Get a dedicated phone number for receiving SMS verification codes securely.
                </p>
                <button
                    onClick={onRentNew}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Get a Number
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* List Column - Clean & functional */}
            <div className="md:col-span-4 space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Active Targets</label>
                {numbers.map(num => (
                    <button
                        key={num.id}
                        onClick={() => setSelectedId(num.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all border group relative overflow-hidden font-mono text-sm ${selectedId === num.id
                                ? 'bg-zinc-900 text-green-400 border-zinc-800 shadow-lg'
                                : 'bg-white dark:bg-zinc-900/50 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <div className="flex justify-between items-center relative z-10 w-full">
                            <div className="flex items-center gap-3">
                                <span className={selectedId === num.id ? 'opacity-100' : 'opacity-50 grayscale'}>
                                    {COUNTRIES.find(c => c.code === num.countryCode)?.flag}
                                </span>
                                <span className="font-bold tracking-tight">{num.phoneNumber}</span>
                            </div>
                            {selectedId === num.id && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>}
                        </div>
                    </button>
                ))}

                <button
                    onClick={onRentNew}
                    className="w-full py-3 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl text-gray-400 text-xs font-bold hover:border-gray-400 hover:text-gray-600 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    <Plus className="w-4 h-4" /> Deploy New Number
                </button>
            </div>

            {/* Detail Column: The Techie Console */}
            <div className="md:col-span-8">
                {activeNumber ? (
                    <div className="bg-[#0c0c0c] rounded-lg border border-zinc-800 shadow-2xl overflow-hidden font-mono text-xs md:text-sm relative">
                        {/* CRT Scanline Effect Overlay (Optional, simple CSS gradient) */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20"></div>

                        {/* Console Header */}
                        <div className="bg-zinc-900/80 border-b border-zinc-800 p-3 flex justify-between items-center text-zinc-400 select-none">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    </div>
                                </div>
                                <div className="h-4 w-[1px] bg-zinc-700"></div>
                                <span className="font-bold text-green-500 flex items-center gap-2">
                                    <Wifi className="w-3 h-3" /> ONLINE
                                </span>
                                <span className="hidden md:inline text-zinc-600">ID: {activeNumber.id.padStart(4, '0')}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-500">{activeNumber.countryName.toUpperCase()} Node</span>
                                <span className="text-zinc-500">UPTIME: 99.9%</span>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="bg-[#050505] p-4 border-b border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] md:text-xs">
                            <div>
                                <div className="text-zinc-600 mb-1">TARGET NUMBER</div>
                                <div className="text-green-400 text-sm md:text-base font-bold tracking-wider flex items-center gap-2">
                                    {activeNumber.phoneNumber}
                                    <button onClick={() => navigator.clipboard.writeText(activeNumber.phoneNumber)} className="hover:text-white transition-colors">
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="text-zinc-600 mb-1">REGION</div>
                                <div className="text-zinc-300 font-bold">{activeNumber.countryCode}-SERVER-1</div>
                            </div>
                            <div>
                                <div className="text-zinc-600 mb-1">ENCRYPTION</div>
                                <div className="text-zinc-300 font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-green-500" /> AES-256
                                </div>
                            </div>
                            <div>
                                <div className="text-zinc-600 mb-1">STATUS</div>
                                <div className="text-green-500 font-bold animate-pulse">ACTIVE / LISTENING</div>
                            </div>
                        </div>

                        {/* Terminal / Log Output */}
                        <div className="p-4 min-h-[400px] bg-black text-gray-300 font-mono text-xs md:text-sm overflow-y-auto">
                            <div className="mb-4 text-zinc-600">
                                <span>$ init_secure_connection --target={activeNumber.phoneNumber}...</span><br />
                                <span>$ connection_established: {new Date().toISOString()}</span><br />
                                <span>$ listening_for_packets...</span>
                            </div>

                            {activeNumber.messages.length === 0 ? (
                                <div className="text-zinc-700 italic ml-4">
                                    -- No transmission data received yet --
                                    <br />
                                    -- Waiting for incoming SMS packets --
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeNumber.messages.map((msg, idx) => (
                                        <div key={msg.id} className="group relative pl-4 border-l-2 border-zinc-800 hover:border-green-500 transition-colors">
                                            <div className="flex items-baseline gap-2 mb-1 text-[10px] uppercase tracking-wider">
                                                <span className="text-blue-500 font-bold">[{new Date(msg.receivedAt).toLocaleTimeString()}]</span>
                                                <span className="text-yellow-500">INCOMING_FROM: {msg.sender}</span>
                                            </div>
                                            <div className="text-green-400 font-bold bg-zinc-900/50 p-2 rounded-sm inline-block max-w-full break-all border border-zinc-800/50">
                                                {'>'} {msg.message}
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(msg.message)}
                                                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded hover:bg-zinc-700 transition"
                                            >
                                                COPY_DATA
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 flex items-center gap-2 text-zinc-600 animate-pulse">
                                <span className="text-green-500">➜</span>
                                <span className='w-2 h-4 bg-green-500 block'></span>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="bg-zinc-900 border-t border-zinc-800 p-2 flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500">
                            <div>TERMINAL_VER_2.4.1</div>
                            <div className="flex gap-4">
                                <button className="hover:text-white flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> REFRESH_STREAM
                                </button>
                                <button className="hover:text-red-500 flex items-center gap-1">
                                    CLEAR_LOGS
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[400px] bg-black rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-zinc-600 font-mono">
                        <div className="w-12 h-12 border border-zinc-800 rounded flex items-center justify-center mb-4">
                            <span className="animate-pulse">_</span>
                        </div>
                        <p>SELECT_TARGET_TO_INITIALIZE</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MarketplaceView({ onRentClick }: { onRentClick: () => void }) {
    // Marketplace logic could be expanded here to include inline searching effectively
    // For now, we present a clean entry point to the "Universe" of numbers.
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                        Global access, <br />
                        <span className="text-indigo-300">Privacy ensured.</span>
                    </h2>
                    <p className="text-indigo-100 text-lg mb-8 leading-relaxed opacity-90">
                        Rent temporary or permanent phone numbers from over 20+ countries.
                        Perfect for verification codes, OTPs, and maintaining privacy online.
                    </p>
                    <button
                        onClick={onRentClick}
                        className="px-8 py-4 bg-white text-indigo-900 font-bold text-lg rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" /> Find a Number
                    </button>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                <div className="absolute right-10 top-10 opacity-30 rotate-12">
                    <Globe className="w-64 h-64" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COUNTRIES.map(country => (
                    <button
                        key={country.code}
                        onClick={onRentClick}
                        className="group bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all hover:shadow-lg text-left relative overflow-hidden"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                            {country.flag}
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white mb-1">{country.name}</div>
                        <div className="text-xs text-gray-500 font-medium">Starting at ₦{country.price.toLocaleString()}</div>

                        <div className="absolute bottom-4 right-4 text-indigo-200 dark:text-gray-800 group-hover:text-indigo-500 transition-colors">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <FeatureCard
                    icon={ShieldCheck}
                    title="Private & Secure"
                    desc="Numbers are exclusively yours. No shared pools."
                    color="text-green-500"
                    bg="bg-green-50 dark:bg-green-900/10"
                />
                <FeatureCard
                    icon={CreditCard}
                    title="Flexible Billing"
                    desc="Pay monthly. Cancel anytime. No hidden fees."
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-900/10"
                />
                <FeatureCard
                    icon={MessageSquare}
                    title="Instant Delivery"
                    desc="Receive SMS codes instantly within the dashboard."
                    color="text-purple-500"
                    bg="bg-purple-50 dark:bg-purple-900/10"
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color, bg }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
