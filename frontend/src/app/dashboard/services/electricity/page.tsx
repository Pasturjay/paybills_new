"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Wallet, Lightbulb, RotateCcw, AlertTriangle, Zap } from "lucide-react";
import { SkeletonLoader } from "@/components/ui/Skeleton";
import { SuccessState } from "@/components/SuccessState";

export default function ElectricityPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        providerCode: "IKEDC",
        meterType: "PREPAID",
        meterNumber: "",
        amount: "",
        phone: ""
    });
    const [verification, setVerification] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [context, setContext] = useState<any>(null);

    const providers = ["IKEDC", "EKEDC", "AEDC", "IBEDC"];

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
            const data = await api.getPurchaseContext("ELECTRICITY", token);
            setContext(data);
        } catch (err) {
            console.error("Failed to fetch context", err);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            if (!token) return router.push("/auth/login");

            const res = await api.post("/services/verify", {
                serviceCode: "ELECTRICITY",
                customerId: formData.meterNumber,
                providerCode: formData.providerCode
            }, token);

            setVerification(res.data);
            setStep(2);
            setStatus("idle");
        } catch (err: any) {
            setStatus("error");
            setMessage("Verification Failed: " + err.message);
        }
    };

    const handlePurchase = async () => {
        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            await api.post("/services/bill", {
                type: "ELECTRICITY",
                serviceCode: "ELECTRICITY",
                customerId: formData.meterNumber,
                amount: formData.amount,
                phone: formData.phone,
                providerCode: formData.providerCode
            }, token || "");

            setStatus("success");
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-24">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 mt-10 border border-gray-100 dark:border-white/5">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Pay Electricity</h2>
                        {step === 2 && <p className="text-sm text-green-600 font-bold">Verifying: {verification?.customerName}</p>}
                    </div>
                    <Zap className="w-10 h-10 text-amber-500 opacity-20" />
                </div>

                {pageLoading ? (
                    <div className="space-y-6">
                        <SkeletonLoader type="card" />
                        <SkeletonLoader type="input" />
                    </div>
                ) : step === 1 ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        {/* Wallet & Limit Visibility */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Balance</div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">
                                    ₦{context?.balance?.toLocaleString() || "0.00"}
                                </div>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">Limit</div>
                                <div className="text-lg font-black text-gray-900 dark:text-white">
                                    ₦{context?.dailyLimit?.toLocaleString() || "50,000"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">DISCO Provider</label>
                            <select
                                className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                value={formData.providerCode}
                                onChange={(e) => setFormData({ ...formData, providerCode: e.target.value })}
                            >
                                {providers.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Recent Meters */}
                        {context?.beneficiaries?.length > 0 && (
                            <div>
                                <label className="flex items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Recent Meters
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {context.beneficiaries.map((b: any, i: number) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, meterNumber: b.recipient, providerCode: b.network || formData.providerCode })}
                                            className="px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 dark:bg-white/5 dark:text-gray-300 rounded-full transition-all border border-transparent hover:border-indigo-200"
                                        >
                                            {b.recipient}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            {["PREPAID", "POSTPAID"].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, meterType: t })}
                                    className={`py-4 rounded-xl border-2 transition-all font-black text-xs ${formData.meterType === t
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                                        : 'bg-white text-gray-600 border-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-left">Meter Number</label>
                            <input
                                type="text"
                                required
                                className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white sm:text-sm p-4 border transition-all"
                                value={formData.meterNumber}
                                onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                                placeholder="11 digits meter number"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                        >
                            {status === "loading" ? "Verifying..." : "Verify Meter"}
                        </button>
                        {status === "error" && (
                            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-100">
                                {message}
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Amount (₦)</label>
                                <input
                                    type="number"
                                    required
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:bg-gray-900 dark:text-white p-4 border transition-all"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Phone (Receipt/Token)</label>
                                <input
                                    type="tel"
                                    required
                                    className="block w-full rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:bg-gray-900 dark:text-white p-4 border transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {status === "error" && (
                            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-100">
                                {message}
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all text-sm"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={status === "loading"}
                                className="col-span-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {status === "loading" ? "Processing..." : "Pay Bill"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mt-6">
                    <a href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors">Back to Dashboard</a>
                </div>
            </div>

            <SuccessState
                isOpen={status === "success"}
                onClose={() => setStatus("idle")}
                title="Payment Successful!"
                message={`Electricity bill for ${formData.meterNumber} was paid. Your token/receipt will be sent to ${formData.phone}.`}
                amount={formData.amount}
                recipient={formData.meterNumber}
            />
        </div>
    );
}
