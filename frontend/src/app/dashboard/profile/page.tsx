"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Bell, CheckCircle, AlertCircle, Save, Shield } from "lucide-react";
import { api } from "@/lib/api";
import PinModal from "@/components/PinModal";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Form States
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [nin, setNin] = useState('');

    const handleSetPin = async (pin: string) => {
        setIsPinModalOpen(false);
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.post("/user/pin", { pin }, token);
            setMessage({ type: 'success', text: 'Transaction PIN set successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to set PIN' });
        }
    };

    const handleKycSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.post("/user/kyc", { nin }, token);
            setMessage({ type: 'success', text: 'Identity verified successfully!' });
            fetchProfile(); // Refresh to update level
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Verification failed' });
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const data = await api.get("/user/profile", token);
                setUser(data);
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.put("/user/profile", formData, token);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            fetchProfile(); // Refresh data
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await api.post("/user/password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, token);
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Incorrect current password or server error' });
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-gray-500">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" /> Account Settings
            </h1>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid gap-8">
                {/* Personal Information */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-zinc-800/50 text-gray-500 border border-transparent rounded-xl cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Save className="w-5 h-5" /> Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                {/* Identity Verification (KYC) */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" /> Identity Verification
                    </h2>

                    {user?.kycLevel >= 1 ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Identity Verified</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your identity has been verified. You have full access to wallet funding.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-bold mb-1">Verify your identity to fund your wallet</p>
                                    <p>Regulatory compliance requires us to verify your National Identity Number (NIN) before you can add funds.</p>
                                </div>
                            </div>

                            <form onSubmit={handleKycSubmit}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">National Identity Number (NIN)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        maxLength={11}
                                        value={nin}
                                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter your 11-digit NIN"
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={nin.length !== 11}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        Verify Identity
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Your NIN is verified instantly against the national database.</p>
                            </form>
                        </div>
                    )}
                </section>


                {/* Security */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" /> Security
                    </h2>

                    <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Transaction PIN</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Required for transfers and payments</p>
                            </div>
                            <button
                                onClick={() => setIsPinModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Set / Change PIN
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6 border-t border-gray-100 dark:border-zinc-800 pt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Change Password</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                                Update Password
                            </button>
                        </div>
                    </form>
                </section>

                {/* Notifications (Placeholder for now) */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 opacity-75">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" /> Notifications
                    </h2>
                    <p className="text-gray-500">Notification settings coming soon.</p>
                </section>
            </div>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSetPin}
                title="Set Transaction PIN"
                description="Enter a new 4-digit PIN for your account"
            />
        </div >
    );
}
