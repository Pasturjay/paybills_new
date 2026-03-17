"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Gift, Search, Loader2, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownLeft, AlertCircle, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/CheckoutModal";
import PinModal from "@/components/PinModal";

interface GiftCard {
    id: string;
    name: string;
    category: string;
    regions: string[];
    color: string;
    low: number; // NGN per $1 for $20-$49
    high: number; // NGN per $1 for $50+
}

// Per-card NGN sell rates (must match backend tiers)
const SELL_RATE_TIERS: Record<string, { low: number; high: number }> = {
    amazon: { low: 794, high: 1100 },
    apple: { low: 794, high: 1080 },
    steam: { low: 794, high: 1050 },
    google: { low: 794, high: 1070 },
    vanilla: { low: 794, high: 1050 },
};

function getTieredRate(card: GiftCard | undefined, usdValue: number | ''): number {
    if (!card) return 0;
    const val = Number(usdValue);
    if (!val || val < 20) return 0;
    return val >= 50 ? card.high : card.low;
}

export default function GiftCards() {
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [pageMode, setPageMode] = useState<'buy' | 'sell'>('buy');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    // Buy state
    const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [quantity, setQuantity] = useState(1);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Sell state
    const [sellCardId, setSellCardId] = useState('amazon');
    const [sellValue, setSellValue] = useState<number>(0);
    const [sellCode, setSellCode] = useState('');
    const [sellImages, setSellImages] = useState<string[]>([]);
    const [sellSuccess, setSellSuccess] = useState<{ message: string; ngnPayout: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const catalog: GiftCard[] = [
            { id: 'amazon', name: 'Amazon', category: 'Shopping', regions: ['US', 'GLOBAL'], color: 'bg-orange-600', low: SELL_RATE_TIERS.amazon.low, high: SELL_RATE_TIERS.amazon.high },
            { id: 'apple', name: 'Apple / iTunes', category: 'Streaming', regions: ['US', 'GLOBAL'], color: 'bg-slate-800', low: SELL_RATE_TIERS.apple.low, high: SELL_RATE_TIERS.apple.high },
            { id: 'steam', name: 'Steam', category: 'Gaming', regions: ['GLOBAL'], color: 'bg-blue-800', low: SELL_RATE_TIERS.steam.low, high: SELL_RATE_TIERS.steam.high },
            { id: 'google', name: 'Google Play', category: 'Gaming', regions: ['US', 'UK'], color: 'bg-teal-600', low: SELL_RATE_TIERS.google.low, high: SELL_RATE_TIERS.google.high },
            { id: 'vanilla', name: 'Vanilla Visa', category: 'Shopping', regions: ['US'], color: 'bg-indigo-600', low: SELL_RATE_TIERS.vanilla.low, high: SELL_RATE_TIERS.vanilla.high },
        ];
        setCards(catalog);
        setLoading(false);
    }, []);

    const filteredCards = cards.filter(card => {
        const matchesCategory = filter === "All" || card.category === filter;
        const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ["All", "Gaming", "Shopping", "Streaming"];

    // ── Buy Flow ──
    const handleCheckout = () => {
        if (!selectedCard || amount <= 0) { alert("Please select a card and enter an amount."); return; }
        setCheckoutOpen(true);
    };

    const confirmCheckout = () => { setCheckoutOpen(false); setIsPinModalOpen(true); };

    const confirmPayment = async (pin: string) => {
        setIsPinModalOpen(false);
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");
            const res = await api.post("/products/gift-card/buy", {
                cardId: selectedCard?.id, amount, quantity, pin
            }, token);
            setSuccessData({ message: res.message || "Gift card purchase successful. Code will be sent shortly." });
            setSelectedCard(null); setAmount(0); setQuantity(1);
        } catch (e: any) {
            alert(e.message || "Failed to purchase Gift Card");
        } finally {
            setProcessing(false);
        }
    };

    // ── Sell Flow ──
    const selectedSellCard = cards.find(c => c.id === sellCardId) || cards[0];
    const activeRate = getTieredRate(selectedSellCard, sellValue);
    const ngnPreview = activeRate > 0 ? Math.floor(sellValue * activeRate) : 0;
    const currentTier = sellValue >= 50 ? 'high' : sellValue >= 20 ? 'low' : null;

    const handleSellSubmit = async (pin: string) => {
        setIsPinModalOpen(false);
        setProcessing(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");
            const res: any = await api.post("/products/gift-card/sell", {
                cardId: sellCardId, cardValue: sellValue, cardCode: sellCode, images: sellImages, pin
            }, token);
            setSellSuccess({
                message: res.message || "Trade submitted successfully.",
                ngnPayout: res.ngnPayout ?? ngnPreview
            });
            setSellValue(0); setSellCode(''); setSellImages([]);
        } catch (e: any) {
            alert(e.message || "Failed to submit gift card trade");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
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
                        Buy gift cards instantly or sell yours for NGN — credited directly to your wallet.
                    </p>

                    {/* Buy / Sell mode toggle */}
                    <div className="inline-flex mt-6 p-1 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <button
                            onClick={() => setPageMode('buy')}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${pageMode === 'buy' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-white/70 hover:text-white'}`}
                        >
                            <ArrowDownLeft className="w-4 h-4" /> Buy Cards
                        </button>
                        <button
                            onClick={() => setPageMode('sell')}
                            className={`px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${pageMode === 'sell' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-white/70 hover:text-white'}`}
                        >
                            <ArrowUpRight className="w-4 h-4" /> Sell for NGN
                        </button>
                    </div>
                </div>
            </section>

            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-7xl">

                    {/* Controls */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
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

                        {/* Card Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                            {loading ? (
                                <div className="col-span-full h-64 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                                </div>
                            ) : filteredCards.map(card => (
                                <div
                                    key={card.id}
                                    onClick={() => {
                                        if (pageMode === 'buy') { setSelectedCard(card); setAmount(0); }
                                        else { setSellCardId(card.id); }
                                    }}
                                    className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 transition-all hover:scale-[1.03]
                                        ${pageMode === 'buy'
                                            ? (selectedCard?.id === card.id ? "ring-4 ring-purple-500 shadow-2xl z-10 scale-[1.03]" : "hover:shadow-xl shadow-md")
                                            : (sellCardId === card.id ? "ring-4 ring-green-500 shadow-2xl z-10 scale-[1.03]" : "hover:shadow-xl shadow-md")
                                        }`}
                                >
                                    <div className={`aspect-[1.586/1] ${card.color} relative p-4 flex flex-col justify-between`}>
                                        <div className="flex justify-between items-start">
                                            <div className="text-white/80 font-mono text-xs font-bold tracking-widest">{card.regions[0] || "GLOBAL"}</div>
                                            {((pageMode === 'buy' && selectedCard?.id === card.id) || (pageMode === 'sell' && sellCardId === card.id)) && (
                                                <CheckCircle2 className="text-white w-6 h-6 drop-shadow-md" />
                                            )}
                                        </div>
                                        <div className="text-white font-bold text-xl drop-shadow-md leading-tight">{card.name}</div>
                                    </div>
                                    <div className="p-3 text-xs font-medium bg-gray-50 dark:bg-zinc-800/50">
                                        <div className="text-center text-gray-500 dark:text-gray-400">{card.category}</div>
                                        {pageMode === 'sell' && (
                                            <div className="text-center text-green-600 dark:text-green-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Up to ₦{card.high.toLocaleString()}/$
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-80 w-full shrink-0 sticky top-24">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">

                                {pageMode === 'buy' ? (
                                    /* ── BUY SIDEBAR ── */
                                    <>
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
                                                            type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))}
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
                                                        <button onClick={handleCheckout} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2">
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
                                    </>
                                ) : (
                                    /* ── SELL SIDEBAR ── */
                                    <>
                                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                                            <ArrowUpRight className="w-5 h-5 text-green-500" /> Sell Your Card
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-5">Get instant NGN into your wallet</p>

                                        {sellSuccess ? (
                                            /* Sell Success */
                                            <div className="text-center py-6">
                                                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <CheckCircle2 className="w-7 h-7" />
                                                </div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Trade Submitted!</h4>
                                                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl font-bold text-lg mb-3">
                                                    <TrendingUp className="w-5 h-5" />
                                                    ₦{sellSuccess.ngnPayout.toLocaleString()} credited
                                                </div>
                                                <p className="text-xs text-gray-400 mb-5">{sellSuccess.message}</p>
                                                <button onClick={() => setSellSuccess(null)} className="w-full py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-bold rounded-xl text-sm transition-colors">
                                                    Sell Another Card
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Selected card indicator */}
                                                {selectedSellCard && (
                                                    <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`w-10 h-10 rounded-lg ${selectedSellCard.color} shadow`}></div>
                                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{selectedSellCard.name}</div>
                                                        </div>
                                                        {sellValue > 0 && (
                                                            <div className="space-y-1 mt-2">
                                                                <div className={`flex justify-between text-xs rounded-lg px-2 py-1 font-medium transition-colors ${currentTier === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-400'}`}>
                                                                    <span>$20 – $49</span>
                                                                    <span>₦{selectedSellCard.low.toLocaleString()} / $1</span>
                                                                </div>
                                                                <div className={`flex justify-between text-xs rounded-lg px-2 py-1 font-medium transition-colors ${currentTier === 'high' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-gray-400'}`}>
                                                                    <span>$50+</span>
                                                                    <span>₦{selectedSellCard.high.toLocaleString()} / $1</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Card Value (USD)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 50"
                                                        value={sellValue || ''}
                                                        onChange={(e) => setSellValue(Number(e.target.value))}
                                                        className="w-full text-lg font-bold p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </div>

                                                {sellValue > 0 && sellValue < 20 && (
                                                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-3 text-sm font-medium">
                                                        ⚠️ Minimum card value is $20
                                                    </div>
                                                )}

                                                {ngnPreview > 0 && (
                                                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                                                        <div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">You'll receive</span>
                                                            <div className="text-xs text-gray-400">Rate: ₦{activeRate.toLocaleString()}/$1</div>
                                                        </div>
                                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                            ₦{ngnPreview.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Redemption Code</label>
                                                    <textarea
                                                        placeholder="Paste your e-code here..."
                                                        rows={3}
                                                        value={sellCode}
                                                        onChange={(e) => setSellCode(e.target.value)}
                                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                                                    />
                                                </div>

                                                <div className="pt-2">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || []);
                                                            const fileReaders: Promise<string>[] = [];
                                                            for (let i = 0; i < files.length; i++) {
                                                                fileReaders.push(new Promise((resolve) => {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => resolve(reader.result as string);
                                                                    reader.readAsDataURL(files[i]);
                                                                }));
                                                            }
                                                            Promise.all(fileReaders).then(results => {
                                                                setSellImages(prev => [...prev, ...results]);
                                                            });
                                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors rounded-xl flex items-center justify-between group"
                                                    >
                                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                                            <div className="p-1 border border-current rounded border-dashed">
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle><line x1="12" y1="9" x2="12" y2="17"></line><line x1="8" y1="13" x2="16" y2="13"></line></svg>
                                                            </div>
                                                            <span className="text-sm font-medium">Upload your images</span>
                                                        </div>
                                                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white rotate-45 transform" />
                                                    </button>

                                                    {sellImages.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {sellImages.map((img, idx) => (
                                                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
                                                                    <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => setSellImages(s => s.filter((_, i) => i !== idx))}
                                                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-center text-[10px] text-gray-400 mt-2">multiple card images can be uploaded</p>
                                                </div>

                                                <p className="text-xs text-gray-400 text-center mt-2">
                                                    Funds credited instantly and subject to verification.
                                                </p>

                                                <button
                                                    onClick={() => setIsPinModalOpen(true)}
                                                    disabled={!sellValue || sellValue < 20 || (!sellCode && sellImages.length === 0) || processing}
                                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ArrowUpRight className="w-5 h-5" />
                                                    {processing ? 'Processing...' : `Sell for ₦${ngnPreview > 0 ? ngnPreview.toLocaleString() : '---'}`}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Buy modals */}
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={confirmCheckout}
                amount={(amount * quantity) * 1650}
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
                onSuccess={pageMode === 'buy' ? confirmPayment : handleSellSubmit}
                title={pageMode === 'buy' ? "Confirm Purchase" : "Confirm Gift Card Sale"}
                description={
                    pageMode === 'buy'
                        ? `Enter PIN to buy ${quantity}x $${amount} ${selectedCard?.name} gift card(s)`
                        : `Enter PIN to sell $${sellValue} ${selectedSellCard?.name} for ₦${ngnPreview.toLocaleString()}`
                }
            />

            {/* Buy success */}
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
                            onClick={() => setSuccessData(null)}
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
