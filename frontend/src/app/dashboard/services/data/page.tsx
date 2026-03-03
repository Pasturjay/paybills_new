"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api";
import { Wallet, Phone, RotateCcw, AlertTriangle, Layers } from "lucide-react";
import { SkeletonLoader } from "@/components/ui/Skeleton";
import { SuccessState } from "@/components/SuccessState";

export default function DataBundlePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        network: "MTN",
        phone: "",
        planCode: "",
        amount: "0"
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [context, setContext] = useState<any>(null);
    const isSubmitting = useRef(false);

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
            const data = await api.getPurchaseContext("DATA", token);
            setContext(data);
        } catch (err) {
            console.error("Failed to fetch context", err);
        }
    };

    const plans = {
        "MTN": [
            { code: "MTN-1GB", name: "1GB Monthly", price: 300 },
            { code: "MTN-2GB", name: "2GB Monthly", price: 600 },
            { code: "MTN-5GB", name: "5GB Monthly", price: 1500 },
        ],
        "AIRTEL": [
            { code: "AIRTEL-1GB", name: "1GB Monthly", price: 350 },
            { code: "AIRTEL-3GB", name: "3GB Monthly", price: 900 },
        ],
        "GLO": [
            { code: "GLO-1GB", name: "1.5GB Monthly", price: 300 },
        ],
        "9MOBILE": [
            { code: "9MOBILE-1GB", name: "1GB Monthly", price: 300 },
        ]
    };

    const currentPlans = plans[formData.network as keyof typeof plans] || [];

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const plan = currentPlans.find(p => p.code === code);
        setFormData({
            ...formData,
            planCode: code,
            amount: plan ? plan.price.toString() : "0"
        });
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting.current) return;
        isSubmitting.current = true;

        if (context && Number(formData.amount) > context.dailyLimit) {
            setStatus("error");
            setMessage(`Transaction exceeds your daily limit of ₦${context.dailyLimit.toLocaleString()}.`);
            isSubmitting.current = false;
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                isSubmitting.current = false;
                return;
            }

            await api.post("/services/data", {
                ...formData,
                providerCode: "VTPASS",
                idempotencyKey
            }, token);

            setStatus("success");
            setIdempotencyKey(uuidv4());
            setFormData({ ...formData, planCode: "", amount: "0" });
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        } finally {
            isSubmitting.current = false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-24">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 mt-10 border border-gray-100 dark:border-white/5">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Buy Data Bundle</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Premium high-speed connectivity.</p>
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
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="flex items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">
                                    <Wallet className="w-3 h-3 mr-1" /> Balance
                                </div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">
                                    ₦{context?.balance?.toLocaleString() || "0.00"}
                                </div>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Daily Limit
                                </div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">
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
                                        onClick={() => setFormData({ ...formData, network: net, planCode: "", amount: "0" })}
                                        className={`py-4 text-xs font-black rounded-xl transition-all border-2 ${formData.network === net
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none"
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
                                    <RotateCcw className="w-3 h-3 mr-1" /> Recent Data Recipients
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
                                    <Layers className="w-4 h-4 mr-1 text-gray-400" /> Choose Data Plan
                                </label>
                                <select
                                    required
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                    value={formData.planCode}
                                    onChange={handlePlanChange}
                                >
                                    <option value="">Select a bundle</option>
                                    {currentPlans.map((plan) => (
                                        <option key={plan.code} value={plan.code}>
                                            {plan.name} - ₦{plan.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                                    <Phone className="w-4 h-4 mr-1 text-gray-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full rounded-2xl border-gray-100 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                    placeholder="08012345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 flex justify-between items-center transition-all hover:bg-indigo-50/30">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Amount</span>
                                <span className="text-slate-900 dark:text-white font-black text-2xl">₦{formData.amount}</span>
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading" || !formData.planCode}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {status === "loading" ? "Processing..." : "Purchase Data"}
                        </button>

                        <div className="text-center">
                            <a href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Back to Dashboard</a>
                        </div>
                    </form>
                )}
            </div>

            <SuccessState
                isOpen={status === "success"}
                onClose={() => setStatus("idle")}
                title="Data Bundle Active!"
                message={`Successfully purchased ${formData.planCode} for ${formData.phone}. Connect now!`}
                amount={formData.amount}
                recipient={formData.phone}
            />
        </div>
    );
}
