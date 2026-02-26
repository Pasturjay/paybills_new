"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Trophy, CheckCircle2, User, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PinVerificationModal } from "@/components/PinVerificationModal";
import { api } from "@/lib/api";

const bookies = [
    { id: "BET9JA", name: "Bet9ja", color: "bg-green-600 text-white border-green-600" },
    { id: "SPORTY", name: "SportyBet", color: "bg-red-600 text-white border-red-600" },
    { id: "1XBET", name: "1xBet", color: "bg-blue-600 text-white border-blue-600" },
    { id: "BETKING", name: "BetKing", color: "bg-yellow-400 text-black border-yellow-400" },
];

export default function Betting() {
    const [selectedBookie, setSelectedBookie] = useState("BET9JA");
    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState("");
    const [verifiedName, setVerifiedName] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleVerify = () => {
        if (userId.length > 5) {
            setVerifiedName("MOCK BETTOR"); // Simulating verification
        }
    };

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutOpen(true);
    };

    const confirmPayment = () => {
        setCheckoutOpen(false);
        setPinModalOpen(true);
    };

    const handlePinSubmit = async (pin: string) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            await api.post("/products/betting/purchase", {
                bookmaker: selectedBookie,
                customerId: userId,
                amount: Number(amount),
                pin
            }, token);

            alert("Betting Wallet Funded Successfully!");
            setPinModalOpen(false);
            setAmount("");
            setUserId("");
            setVerifiedName("");
        } catch (error: any) {
            alert(error.message || "Transaction failed");
        } finally {
            setProcessing(false);
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
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        Betting Top-up
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Instant deposits for your favorite bookmakers. Secure and fast.
                    </p>
                </div>
            </section>

            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-lg">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">

                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Select Bookmaker</label>
                            <div className="grid grid-cols-2 gap-3">
                                {bookies.map((b) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setSelectedBookie(b.id)}
                                        className={`py-3 px-4 rounded-xl flex items-center justify-center font-bold text-xs transition-all border-2 ${selectedBookie === b.id
                                            ? `${b.color} ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900`
                                            : "bg-gray-50 dark:bg-zinc-800 text-gray-500 border-transparent grayscale hover:grayscale-0"
                                            }`}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">User ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        onBlur={handleVerify}
                                        className="w-full px-4 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                        placeholder="Enter User ID"
                                        required
                                    />
                                    {verifiedName && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-green-500 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                            <User className="w-3 h-3" /> {verifiedName}
                                        </div>
                                    )}
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
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg text-gray-900 dark:text-white"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {[1000, 2000, 5000, 10000].map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setAmount(amt.toString())}
                                            className="py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            ₦{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                <Wallet className="w-5 h-5" />
                                Fund Wallet
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={confirmPayment}
                amount={Number(amount)}
                title={`Fund ${selectedBookie}`}
                loading={processing}
                details={[
                    { label: "Bookmaker", value: selectedBookie },
                    { label: "User ID", value: userId },
                    { label: "Account Name", value: verifiedName }
                ]}
            />

            <PinVerificationModal
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onVerify={handlePinSubmit}
                loading={processing}
                title="Authorize Betting Funding"
            />

            <Footer />
        </main>
    );
}
