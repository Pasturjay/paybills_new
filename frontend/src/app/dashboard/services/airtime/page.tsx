"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api";
import { Wallet, Phone, RotateCcw, AlertTriangle } from "lucide-react";
import { SkeletonLoader } from "@/components/ui/Skeleton";
import { SuccessState } from "@/components/SuccessState";

export default function AirtimePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        network: "MTN",
        phone: "",
        amount: "",
        pin: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [context, setContext] = useState<any>(null);

    const networks = ["MTN", "AIRTEL", "GLO", "9MOBILE"];

    useEffect(() => {
        const init = async () => {
            await fetchContext();
            setPageLoading(false);
        };
        init();
    }, []);

    const fetchContext = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const data = await api.getPurchaseContext("AIRTIME", token);
            setContext(data);
        } catch (err) {
            console.error("Failed to fetch context", err);
        }
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();

        if (status === "loading") return;

        if (!formData.pin || formData.pin.length !== 4) {
            setStatus("error");
            setMessage("Please enter your 4-digit transaction PIN");
            return;
        }

        if (context && Number(formData.amount) > context.dailyLimit) {
            setStatus("error");
            setMessage(`Transaction exceeds your daily limit of ₦${context.dailyLimit.toLocaleString()}. Please upgrade your KYC.`);
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            await api.post("/services/airtime", {
                ...formData,
                providerCode: "VTPASS",
                idempotencyKey
            }, token);

            setStatus("success");
            // Refresh key for NEXT purchase
            setIdempotencyKey(uuidv4());
            // Reset amount and pin but keep phone
            setFormData({ ...formData, amount: "", pin: "" });
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-24">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 mt-10 border border-gray-100 dark:border-white/5">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Buy Airtime</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Instant top-up for all networks.</p>
                </div>

                {pageLoading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <SkeletonLoader type="input" />
                            <SkeletonLoader type="input" />
                        </div>
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="input" />
                        <SkeletonLoader type="input" />
                    </div>
                ) : (
                    <form onSubmit={handlePurchase} className="space-y-6">
                        {/* Wallet & Limit Visibility */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                                    <Wallet className="w-3 h-3 mr-1" /> Balance
                                </div>
                                <div className="text-xl font-black text-gray-900 dark:text-white">
                                    ₦{context?.balance?.toLocaleString() || "0.00"}
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                                <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Daily Limit
                                </div>
                                <div className="text-xl font-black text-gray-900 dark:text-white">
                                    ₦{context?.dailyLimit?.toLocaleString() || "50,000"}
                                </div>
                            </div>
                        </div>

                        {/* Network Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Select Network</label>
                            <div className="grid grid-cols-4 gap-3">
                                {networks.map((net) => (
                                    <button
                                        key={net}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, network: net })}
                                        className={`py-4 text-xs font-black rounded-2xl transition-all border-2 ${formData.network === net
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none"
                                            : "bg-white text-gray-600 border-gray-100 hover:border-indigo-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                            }`}
                                    >
                                        {net}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Beneficiaries */}
                        {context?.beneficiaries?.length > 0 && (
                            <div>
                                <label className="flex items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Recent Top-ups
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {context.beneficiaries.map((b: any, i: number) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, phone: b.recipient, network: b.network || formData.network })}
                                            className="px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-white/5 dark:text-gray-300 rounded-full transition-all border border-transparent hover:border-indigo-200"
                                        >
                                            {b.recipient}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                    <Phone className="w-4 h-4 mr-1 text-gray-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                    placeholder="08012345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Amount (₦)</label>
                                <input
                                    type="number"
                                    required
                                    min="50"
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all font-black text-lg"
                                    placeholder="Min. 50"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                    <div className="w-4 h-4 mr-1 text-gray-400 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    Transaction PIN
                                </label>
                                <input
                                    type="password"
                                    required
                                    maxLength={4}
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                    placeholder="••••"
                                    value={formData.pin}
                                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-100 dark:border-red-800/50 flex items-start animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full flex justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 active:scale-[0.98]"
                        >
                            {status === "loading" ? "Processing..." : "Pay Now"}
                        </button>

                        <div className="text-center">
                            <a href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Back to Dashboard</a>
                        </div>
                    </form>
                )}
            </div>

            <SuccessState
                isOpen={status === "success"}
                onClose={() => setStatus("idle")}
                title="Purchase Successful!"
                message={`Your ₦${formData.amount} top-up was processed instantly. Keep shining!`}
                amount={formData.amount}
                recipient={formData.phone}
            />
        </div>
    );
}
