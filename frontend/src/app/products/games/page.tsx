"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gamepad2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const games = [
    { id: "FF", name: "Free Fire", currency: "Diamonds", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
    { id: "PUBG", name: "PUBG Mobile", currency: "UC", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    { id: "COD", name: "Call of Duty", currency: "CP", color: "text-slate-200 bg-slate-700/50 border-slate-500/20" },
    { id: "STEAM", name: "Steam Wallet", currency: "USD", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
];

export default function Games() {
    const [selectedGame, setSelectedGame] = useState(games[0]);
    const [playerId, setPlayerId] = useState("");
    const [amount, setAmount] = useState("");
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutOpen(true);
    };

    const confirmPayment = async () => {
        setProcessing(true);
        await new Promise(r => setTimeout(r, 2000));
        alert("Game Credit Top-up Successful!");
        setCheckoutOpen(false);
        setProcessing(false);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
            <Navbar />

            {/* Header */}
            <section className="pt-32 pb-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-transparent"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Gamepad2 className="w-8 h-8 text-purple-400" />
                        Game Top-up
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Instant credits for your favorite games. Level up instantly.
                    </p>
                </div>
            </section>

            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Game Selector */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Select Game</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {games.map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => setSelectedGame(g)}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedGame.id === g.id
                                                ? `border-purple-500 bg-purple-50 dark:bg-purple-900/10 ring-1 ring-purple-500`
                                                : "border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 hover:border-purple-200 dark:hover:border-purple-900"
                                                }`}
                                        >
                                            <Gamepad2 className={`w-6 h-6 mb-3 ${g.id === selectedGame.id ? "text-purple-600 dark:text-purple-400" : "text-gray-400"}`} />
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{g.name}</div>
                                            <div className="text-[10px] font-bold text-gray-500">{g.currency}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                <form onSubmit={handleCheckout} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Gamepad2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900 dark:text-white">{selectedGame.name}</h2>
                                            <p className="text-xs text-gray-500">Top-up {selectedGame.currency}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Player ID</label>
                                        <input
                                            type="text"
                                            value={playerId}
                                            onChange={(e) => setPlayerId(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="Enter Player ID"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Package</label>
                                        <select
                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-900 dark:text-white"
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Package</option>
                                            <option value="1000">100 {selectedGame.currency} - ₦1,000</option>
                                            <option value="2500">300 {selectedGame.currency} - ₦2,500</option>
                                            <option value="5000">600 {selectedGame.currency} - ₦5,000</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-600/20 hover:scale-[1.02] transition-all"
                                    >
                                        Purchase Credits
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={confirmPayment}
                amount={Number(amount)}
                title={selectedGame.name}
                loading={processing}
                details={[
                    { label: "Game", value: selectedGame.name },
                    { label: "Player ID", value: playerId }
                ]}
            />

            <Footer />
        </main>
    );
}
