"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gift, Search, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/CheckoutModal";
import PinModal from "@/components/PinModal";

interface GiftCard {
    id: string;
    name: string;
    category: string;
    regions: string[];
    color: string;
}

export default function GiftCards() {
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Selection State
    const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [quantity, setQuantity] = useState(1);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        // Mock Catalog since there is no endpoint
        setCards([
            { id: 'amazon', name: 'Amazon', category: 'Shopping', regions: ['US', 'GLOBAL'], color: 'bg-orange-600' },
            { id: 'apple', name: 'Apple / iTunes', category: 'Streaming', regions: ['US', 'GLOBAL'], color: 'bg-slate-800' },
            { id: 'steam', name: 'Steam', category: 'Gaming', regions: ['GLOBAL'], color: 'bg-blue-800' },
            { id: 'google', name: 'Google Play', category: 'Gaming', regions: ['US', 'UK'], color: 'bg-teal-600' },
            { id: 'vanilla', name: 'Vanilla Visa', category: 'Shopping', regions: ['US'], color: 'bg-indigo-600' }
        ]);
        setLoading(false);
    }, []);

    const filteredCards = cards.filter(card => {
        const matchesCategory = filter === "All" || card.category === filter;
        const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ["All", "Gaming", "Shopping", "Streaming", "Software"];

    const handleCheckout = () => {
        if (!selectedCard || amount <= 0) {
            alert("Please select a card and enter an amount.");
            return;
        }
        setCheckoutOpen(true);
    };

    const confirmCheckout = () => {
        setCheckoutOpen(false);
        setIsPinModalOpen(true);
    };

    const confirmPayment = async (pin: string) => {
        setIsPinModalOpen(false);
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            // Make request to the correct working endpoint
            const res = await api.post("/products/gift-card/buy", {
                cardId: selectedCard?.id,
                amount: amount,
                quantity: quantity,
                pin: pin
            }, token);

            // Set success with the message from the backend
            setSuccessData({ message: res.message || "Gift card purchase successful. Code will be sent shortly." });

            setSelectedCard(null);
            setAmount(0);
            setQuantity(1);
        } catch (e: any) {
            alert(e.message || "Failed to purchase Gift Card");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
            {/* Scrollable Background Pattern */}
            <div className="fixed inset-0 pattern-dots disabled opacity-5 pointer-events-none"></div>

            <Navbar />

            {/* Header */}
            <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-transparent"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Gift className="w-10 h-10 text-purple-400" />
                        Global Gift Cards
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Instant access to thousands of gift cards from top global brands.
                    </p>
                </div>
            </section>

            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-7xl">

                    {/* Controls */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search brands..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                            {loading ? (
                                <div className="col-span-full h-64 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                                </div>
                            ) : filteredCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => { setSelectedCard(card); setAmount(0); }}
                                    className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 transition-all hover:scale-[1.03] ${selectedCard?.id === card.id ? "ring-4 ring-purple-500 shadow-2xl z-10 scale-[1.03]" : "hover:shadow-xl shadow-md"}`}
                                >
                                    {/* Card Visual */}
                                    <div className={`aspect-[1.586/1] ${card.color} relative p-4 flex flex-col justify-between`}>
                                        <div className="flex justify-between items-start">
                                            <div className="text-white/80 font-mono text-xs font-bold tracking-widest">{card.regions[0] || "GLOBAL"}</div>
                                            {selectedCard?.id === card.id && <CheckCircle2 className="text-white w-6 h-6 drop-shadow-md" />}
                                        </div>
                                        <div className="text-white font-bold text-xl drop-shadow-md leading-tight">{card.name}</div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-3 text-xs text-center font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50">
                                        {card.category}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sticky Checkout Sidebar */}
                        <div className={`lg:w-80 w-full shrink-0 sticky top-24 transition-all duration-500 ${selectedCard ? "opacity-100 translate-x-0" : "opacity-50 translate-x-10 lg:translate-x-0 grayscale pointer-events-none"}`}>
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
                                <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Purchase Details</h3>

                                {selectedCard ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg ${selectedCard.color} shadow-lg`}></div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">{selectedCard.name}</div>
                                                <div className="text-xs text-gray-500">{selectedCard.regions.join(", ")}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Amount (USD/EUR)</label>
                                                <input
                                                    type="number"
                                                    value={amount || ''}
                                                    onChange={(e) => setAmount(Number(e.target.value))}
                                                    placeholder="25"
                                                    className="w-full text-lg font-bold p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quantity</label>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700">-</button>
                                                    <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700">+</button>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-gray-500 text-sm">Total Estimate</span>
                                                    <span className="text-xl font-bold text-purple-600">₦{((amount * quantity) * 1650).toLocaleString()}</span>
                                                </div>
                                                <button
                                                    onClick={handleCheckout}
                                                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" /> Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">Select a card to continue</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={confirmCheckout}
                amount={(amount * quantity) * 1650} // Mock Exchange Rate
                title={`Buy ${selectedCard?.name}`}
                loading={processing}
                details={[
                    { label: "Card", value: selectedCard?.name || "" },
                    { label: "Region", value: selectedCard?.regions[0] || "Global" },
                    { label: "Value", value: `$${amount}` },
                    { label: "Quantity", value: quantity.toString() }
                ]}
            />

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={confirmPayment}
                title="Confirm Purchase"
                description={`Enter PIN to buy ${quantity}x $${amount} ${selectedCard?.name} gift card(s)`}
            />

            {/* Success Code Display Modal */}
            {successData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Successful!</h3>
                            <p className="text-gray-500">Here are your gift card codes:</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 space-y-3 mb-6 max-h-60 overflow-y-auto w-full text-center">
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{successData.message}</p>
                        </div>

                        <button
                            onClick={() => { setSuccessData(null); }}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}


