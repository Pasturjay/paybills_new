"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Zap, Tv, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PinVerificationModal } from "@/components/PinVerificationModal";

const electricityProviders = [
    { id: "IKEJA", name: "Ikeja Electric", short: "IKEDC", color: "bg-orange-600 text-white border-orange-600" },
    { id: "EKO", name: "Eko Electric", short: "EKEDC", color: "bg-blue-600 text-white border-blue-600" },
    { id: "ABUJA", name: "Abuja Electric", short: "AEDC", color: "bg-green-600 text-white border-green-600" },
    { id: "IBADAN", name: "Ibadan Electric", short: "IBEDC", color: "bg-yellow-600 text-white border-yellow-600" },
    { id: "KANO", name: "Kano Electric", short: "KEDCO", color: "bg-purple-600 text-white border-purple-600" },
    { id: "JOS", name: "Jos Electric", short: "JED", color: "bg-red-600 text-white border-red-600" },
    { id: "KADUNA", name: "Kaduna Electric", short: "KAEDCO", color: "bg-teal-600 text-white border-teal-600" },
    { id: "ENUGU", name: "Enugu Electric", short: "EEDC", color: "bg-indigo-600 text-white border-indigo-600" },
    { id: "PORT_HARCOURT", name: "PH Electric", short: "PHED", color: "bg-cyan-600 text-white border-cyan-600" },
    { id: "BENIN", name: "Benin Electric", short: "BEDC", color: "bg-gray-600 text-white border-gray-600" },
    { id: "YOLA", name: "Yola Electric", short: "YEDC", color: "bg-emerald-600 text-white border-emerald-600" },
];

const cableProviders = [
    { id: "DSTV", name: "DSTV", color: "bg-blue-500 text-white border-blue-500" },
    { id: "GOTV", name: "GOTV", color: "bg-green-500 text-white border-green-500" },
    { id: "STARTIMES", name: "Startimes", color: "bg-purple-500 text-white border-purple-500" },
    { id: "SHOWMAX", name: "Showmax", color: "bg-pink-500 text-white border-pink-500" },
];

import { useSearchParams } from "next/navigation";

function BillPaymentContent() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type");

    const [activeTab, setActiveTab] = useState<"electricity" | "cable">(
        typeParam === "cable" ? "cable" : "electricity"
    );
    const [provider, setProvider] = useState("");
    const [identifier, setIdentifier] = useState(""); // Meter or IUC
    const [amount, setAmount] = useState("");

    // Validation State
    const [validating, setValidating] = useState(false);
    const [validatedName, setValidatedName] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);
    const [error, setError] = useState("");

    const [checkoutData, setCheckoutData] = useState<any>(null);
    const [pinModalOpen, setPinModalOpen] = useState(false);

    const handleValidate = async () => {
        if (!provider || !identifier) return;
        setValidating(true);
        setError("");

        try {
            const res = await api.post("/products/bills/validate", {
                category: activeTab === "electricity" ? "ELECTRICITY" : "CABLE",
                provider,
                identifier
            });

            if (res.success && res.data) {
                setValidatedName(res.data.name);
            } else {
                setValidatedName("");
                setError("Invalid Number");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setValidating(false);
        }
    };

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutData({
            category: activeTab === "electricity" ? "ELECTRICITY" : "CABLE",
            provider,
            identifier,
            amount: Number(amount)
        });
    };

    const handlePinSubmit = async (pin: string) => {
        setLoading(true);
        setError("");
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            const res = await api.post("/products/bills/purchase", {
                category: activeTab === "electricity" ? "ELECTRICITY" : "CABLE",
                provider,
                identifier,
                amount: Number(amount),
                pin
            }, token);

            setSuccess(res);
            setPinModalOpen(false);
            setCheckoutData(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        {activeTab === "electricity" ? <Zap className="w-8 h-8 text-yellow-400" /> : <Tv className="w-8 h-8 text-blue-400" />}
                        Bill Payment
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Pay your electricity bills and cable TV subscriptions instantly. Zero stress.
                    </p>
                </div>
            </section>

            {/* Purchase Form */}
            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-lg">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
                        {/* Tabs */}
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl mb-8">
                            <button
                                onClick={() => { setActiveTab("electricity"); setProvider(""); setIdentifier(""); setValidatedName(""); }}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "electricity" ? "bg-white dark:bg-zinc-700 text-yellow-600 dark:text-yellow-400 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                            >
                                <Zap className="w-4 h-4" /> Electricity
                            </button>
                            <button
                                onClick={() => { setActiveTab("cable"); setProvider(""); setIdentifier(""); setValidatedName(""); }}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "cable" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                            >
                                <Tv className="w-4 h-4" /> Cable TV
                            </button>
                        </div>

                        {success ? (
                            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === "electricity" ? "Token generated successfully." : "Subscription activated."}
                                    {success.result?.data?.token && (
                                        <span className="block mt-2 font-mono bg-gray-100 dark:bg-zinc-800 p-2 rounded text-lg tracking-widest text-black dark:text-white">
                                            {success.result.data.token}
                                        </span>
                                    )}
                                </p>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
                                >
                                    Pay Another Bill
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePurchase} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3 text-left">Select Provider</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(activeTab === "electricity" ? electricityProviders : cableProviders).map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setProvider(p.id)}
                                                className={`py-3 px-4 rounded-xl flex items-center justify-center font-bold text-[10px] md:text-md text-center transition-all border-2 min-h-[60px] ${provider === p.id
                                                    ? `${p.color} ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900`
                                                    : "bg-gray-50 dark:bg-zinc-800 text-gray-500 border-transparent grayscale hover:grayscale-0"
                                                    }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-left">
                                        {activeTab === "electricity" ? "Meter Number" : "Smart Card / IUC Number"}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            onBlur={handleValidate}
                                            placeholder={activeTab === "electricity" ? "1234 5678 9012" : "1234567890"}
                                            className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {validating && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                                            {!validating && !validatedName && identifier.length > 5 && (
                                                <button type="button" onClick={handleValidate} className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    VERIFY
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {validatedName && (
                                        <div className="mt-2 text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {validatedName}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-left">Amount (₦)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="5000"
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg text-gray-900 dark:text-white"
                                            required
                                            min="100"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !validatedName}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                    {loading ? "Processing..." : "Pay Bill"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

import { Suspense } from 'react';
export default function BillPayment() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BillPaymentContent />
        </Suspense>
    );
}
