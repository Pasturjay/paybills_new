"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Smartphone, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PinVerificationModal } from "@/components/PinVerificationModal";

const networks = [
    { id: "MTN", name: "MTN", color: "bg-yellow-400 text-black border-yellow-400" },
    { id: "AIRTEL", name: "Airtel", color: "bg-red-600 text-white border-red-600" },
    { id: "GLO", name: "Glo", color: "bg-green-600 text-white border-green-600" },
    { id: "9MOBILE", name: "T2mobile", color: "bg-green-900 text-white border-green-900" }, // Renamed to T2mobile
];

export default function AirtimeData() {
    const [activeTab, setActiveTab] = useState<"airtime" | "data">("airtime");
    const [selectedNetwork, setSelectedNetwork] = useState("MTN");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);
    const [error, setError] = useState("");

    const [checkoutData, setCheckoutData] = useState<any>(null);
    const [pinModalOpen, setPinModalOpen] = useState(false);

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutData({
            amount: Number(amount),
            network: selectedNetwork,
            phone
        });
    };

    const handlePinSubmit = async (pin: string) => {
        setLoading(true);
        setError("");
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            const endpoint = activeTab === 'airtime' ? "/products/airtime/purchase" : "/products/data/purchase";
            const payload = {
                networkId: selectedNetwork, // Unified naming if possible, check backend expectation
                network: selectedNetwork, // Send both for safety given backend types
                phone,
                phoneNumber: phone, // Send both
                amount: Number(amount),
                pin
            };

            const res = await api.post(endpoint, payload, token);

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
            <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Airtime & Data</h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Instant top-up for all major networks. Fast, secure, and reliable.
                    </p>
                </div>
            </section>

            {/* Purchase Form */}
            <section className="-mt-8 pb-20 px-6">
                <div className="container mx-auto max-w-md">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
                        {/* Tabs */}
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl mb-8">
                            <button
                                onClick={() => setActiveTab("airtime")}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all ${activeTab === "airtime" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                            >
                                Airtime
                            </button>
                            <button
                                onClick={() => setActiveTab("data")}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all ${activeTab === "data" ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                            >
                                Data
                            </button>
                        </div>

                        {success ? (
                            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Top-up Successful!</h3>
                                <p className="text-gray-500 mb-6">₦{amount} sent to {phone}</p>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
                                >
                                    New Top-up
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePurchase} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Select Network</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {networks.map((net) => (
                                            <button
                                                key={net.id}
                                                type="button"
                                                onClick={() => setSelectedNetwork(net.id)}
                                                className={`h-14 rounded-xl flex items-center justify-center font-bold text-[10px] md:text-xs transition-all border-2 ${selectedNetwork === net.id
                                                    ? `${net.color} ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900`
                                                    : "bg-gray-50 dark:bg-zinc-800 text-gray-500 border-transparent grayscale hover:grayscale-0"
                                                    }`}
                                            >
                                                {net.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="0801 234 5678"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount (₦)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="500"
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg text-gray-900 dark:text-white"
                                            required
                                            min="50"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {[100, 200, 500, 1000].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setAmount(amt.toString())}
                                                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100"
                                            >
                                                ₦{amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                    {loading ? "Processing..." : `Pay ₦${amount || "0"}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={!!checkoutData}
                onClose={() => setCheckoutData(null)}
                onConfirm={() => {
                    setCheckoutData(null);
                    setPinModalOpen(true);
                }}
                amount={Number(amount)}
                title={`Confirm ${activeTab === 'airtime' ? 'Airtime' : 'Data'} Purchase`}
                details={[
                    { label: "Network", value: networks.find(n => n.id === selectedNetwork)?.name || selectedNetwork },
                    { label: "Phone Number", value: phone },
                    { label: "Type", value: activeTab === 'airtime' ? 'Airtime Top-up' : 'Data Bundle' }
                ]}
            />

            <PinVerificationModal
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onVerify={handlePinSubmit}
                loading={loading}
                error={error}
                title="Authorize Transaction"
            />

            <Footer />
        </main>
    );
}


