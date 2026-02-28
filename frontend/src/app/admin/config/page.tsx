"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Settings, Server, Activity, ShieldCheck, Power, RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminConfigPage() {
    const [services, setServices] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const [servicesData, providersData] = await Promise.all([
                api.get("/admin/services", token),
                api.get("/admin/providers", token)
            ]);
            setServices(servicesData);
            setProviders(providersData);
        } catch (error) {
            console.error("Failed to fetch admin config", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleService = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            await api.put(`/admin/services/${id}`, { isActive: !currentStatus }, token);
            setServices(services.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
        } catch (error) {
            console.error("Failed to toggle service", error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing System Config...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" /> System Configuration
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Global feature flags, provider health, and operational toggles.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:rotate-180 duration-500"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Provider Health Section */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Server className="w-5 h-5 text-emerald-500" /> Provider Status
                    </h2>
                    <div className="space-y-4">
                        {providers.map((provider) => (
                            <div key={provider.id} className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="font-black text-gray-900 dark:text-white tracking-tight">{provider.name}</div>
                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${provider.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/10' : 'bg-red-100 text-red-700 dark:bg-red-500/10'}`}>
                                        {provider.isActive ? 'Online' : 'Degraded'}
                                    </div>
                                </div>
                                <div className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                    ₦{Number(provider.balance || 0).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">API Float Balance</div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm mb-2">
                            <AlertTriangle className="w-4 h-4" /> Operations Alert
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                            Low balance on providers will automatically trigger transaction routing to secondary failovers.
                        </p>
                    </div>
                </div>

                {/* Service Controls Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Service Availability
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <div key={service.id} className="group p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-indigo-500/50 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${service.isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10' : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'}`}>
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{service.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{service.type} • {service.provider?.code}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleService(service.id, service.isActive)}
                                        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${service.isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 border-dashed">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-2xl text-purple-600">
                                <Power className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Maintenance Mode</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Temporarily disable all outward transactions for scheduled system maintenance.</p>
                                <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all">
                                    Initiate Lockout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
