"use client";

import { useEffect, useState } from 'react';
import { Users, DollarSign, Copy, Share2, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function ReferralsPage() {
    const [stats, setStats] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/referrals', token)
                .then(setStats)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, []);

    const copyToClipboard = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Referrals</h1>
                <p className="text-gray-500 dark:text-gray-400">Invite friends and earn rewards</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                            <Users className="w-5 h-5" /> Total Referrals
                        </div>
                        <div className="text-5xl font-bold">{stats?.totalReferrals || 0}</div>
                        <p className="mt-2 text-sm opacity-60">People joined using your link</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="bg-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 opacity-80">
                            <DollarSign className="w-5 h-5" /> Total Earnings
                        </div>
                        <div className="text-5xl font-bold">₦{stats?.earnings?.toLocaleString() || '0.00'}</div>
                        <p className="mt-2 text-sm opacity-60">Commissions earned</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                </div>
            </div>

            {/* Link Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Referral Link</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-sm flex items-center overflow-x-auto">
                        {stats?.referralLink || 'Generating...'}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-w-[160px]"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    {/* Share Button (Native if supported, otherwise generic) */}
                    <button className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5" /> Share
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">How it works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { step: 1, title: 'Share your link', desc: 'Copy your unique referral link and send it to friends.' },
                            { step: 2, title: 'They sign up', desc: 'When they create an account using your link, they become your referral.' },
                            { step: 3, title: 'You earn', desc: 'Get commission on their first transaction (Terms apply).' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-bold flex items-center justify-center shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
