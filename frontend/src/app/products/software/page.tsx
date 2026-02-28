"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, Filter, Star, Download, ShieldCheck, CheckCircle2, ShoppingCart, Loader2, Plus, Minus, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { SoftwareProduct } from "@/types/software";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PinVerificationModal } from "@/components/PinVerificationModal";
import { CryptoPaymentModal } from "@/components/CryptoPaymentModal";
import { api } from "@/lib/api";
import { CartDrawer } from "@/components/CartDrawer";
import { toast } from "sonner";

const categories = ["All", "OS", "Productivity", "Security", "Creative", "Developer", "VPN", "Gaming"];

export default function SoftwareMarketplace() {
    const [allProducts, setAllProducts] = useState<SoftwareProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Cart State
    const [cart, setCart] = useState<{ product: SoftwareProduct; quantity: number }[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SoftwareProduct | null>(null);

    // Modals
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

    // Purchase State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);
    const [error, setError] = useState("");

    const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'PAYSTACK'>('WALLET');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/software?limit=500'); // Fetch active only
            setAllProducts(res.products);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load software catalog");
        } finally {
            setLoadingProducts(false);
        }
    };


    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            if (category !== "All" && p.category !== category) return false;
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [allProducts, category, search]);

    const displayedProducts = filteredProducts.slice(0, page * 12);

    // --- Cart Logic ---
    const addToCart = (product: SoftwareProduct) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setCartOpen(true);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    // --- Checkout Logic (Cart) ---
    const handleCartCheckout = (method: 'WALLET' | 'PAYSTACK') => {
        setPaymentMethod(method);
        setSelectedProduct(null);

        if (method === 'WALLET') {
            setCartOpen(false);
            setPinModalOpen(true);
        } else {
            processPaystackCheckout(cart);
        }
    };

    const processPaystackCheckout = async (itemsToBuy: { product: SoftwareProduct; quantity: number }[]) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login");

            // We NOW ONLY SEND ID AND QUANTITY. Security handles amounts.
            const itemsPayload = itemsToBuy.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));

            const res = await api.post("/products/software/purchase", {
                items: itemsPayload,
                paymentMethod: 'PAYSTACK' // backend ignores `amount` if passed
            }, token);

            if (res.authorization_url) {
                window.location.href = res.authorization_url;
            } else {
                throw new Error("Failed to get payment url");
            }
        } catch (err: any) {
            setError(err.message || "Payment initialization failed");
            setLoading(false);
        }
    };

    const handlePinSubmit = async (pin: string) => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            const itemsToBuy = cart;

            // Secure payload
            const itemsPayload = itemsToBuy.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));

            const res = await api.post("/products/software/purchase", {
                items: itemsPayload,
                paymentMethod: 'WALLET',
                pin
            }, token);

            setSuccess(res);
            setPinModalOpen(false);
            setCart([]);
            setCartOpen(false);
        } catch (err: any) {
            setError(err.message || "Purchase failed");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Navbar />

            <section className="pt-28 pb-10 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4">Genuine Software Marketplace</h1>
                    <p className="text-base text-gray-300 max-w-2xl mx-auto mb-6">
                        Instant delivery of trusted software licenses. Windows, Office, Antivirus &amp; more.
                    </p>

                    <div className="max-w-xl mx-auto relative flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search software..."
                                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setCartOpen(true)}
                            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center relative shadow-lg hover:bg-blue-700 transition flex-shrink-0"
                        >
                            <ShoppingCart className="w-5 h-5 text-white" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0f172a]">
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <span className="font-bold">Error:</span> {error}
                    <button onClick={() => setError("")} className="ml-2 hover:bg-red-200 rounded-full p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <section className="-mt-6 pb-16 px-3 sm:px-6 relative z-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">

                        {/* Mobile Category Pills */}
                        <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-2 px-2">
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${category === c ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            {/* Desktop Sidebar */}
                            <aside className="hidden lg:block lg:w-56 flex-shrink-0 space-y-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Filter className="w-4 h-4" /> Categories
                                    </h3>
                                    <div className="space-y-1">
                                        {categories.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCategory(c)}
                                                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${category === c ? 'bg-blue-600 text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trust Guarantee</h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                                            <ShieldCheck className="w-4 h-4" /> Official Keys
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                                            <Download className="w-4 h-4" /> Instant Download
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                                            <CheckCircle2 className="w-4 h-4" /> Money Back
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Grid */}
                            <div className="flex-1 min-w-0">
                                {loadingProducts ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                                        <p className="text-gray-500 font-bold">Synchronizing Global Catalog...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
                                            {displayedProducts.map(product => (
                                                <div key={product.id} className="group bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                                                    <div className="h-24 sm:h-36 bg-white dark:bg-zinc-700/50 flex items-center justify-center relative">
                                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-400 px-2 text-center leading-tight">{product.brand}</h3>
                                                        {(product as any).bestSeller && (
                                                            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                                BEST SELLER
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                                        <div className="text-[10px] sm:text-xs text-blue-600 font-bold mb-1">{product.category.toUpperCase()}</div>
                                                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="text-xs font-medium">{product.sales > 50 ? 4.8 : 4.5}</span>
                                                            <span className="text-[10px] text-gray-400 hidden sm:inline">({product.sales} sold)</span>
                                                        </div>

                                                        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between gap-1">
                                                            <div>
                                                                <div className="text-[10px] text-gray-400 line-through">₦{Number(product.originalPrice).toLocaleString()}</div>
                                                                <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">₦{Number(product.price).toLocaleString()}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 transition-transform shadow flex-shrink-0"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {displayedProducts.length < filteredProducts.length && (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => setPage(page + 1)}
                                                    className="px-8 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    Load More Products
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

            {/* Same Cart and Checkouts as before */}
            <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart as any}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={handleCartCheckout}
                isRedirecting={loading && paymentMethod === 'PAYSTACK'}
            />

            <PinVerificationModal
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onVerify={handlePinSubmit}
                loading={loading}
                error={error}
                title="Authorize Software Purchase"
            />

            {/* Success Modal */}
            {success && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl max-w-lg w-full text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Purchase Successful!</h3>
                        <p className="text-gray-500 mb-6">
                            You have successfully purchased {success.data.items?.length || 1} item(s).
                        </p>

                        <div className="max-h-60 overflow-y-auto space-y-3 mb-6">
                            {success.data.items?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 text-left">
                                    <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.softwareName}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">License Key</div>
                                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400 select-all break-all">
                                        {item.licenseKey}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSuccess(null)}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold"
                        >
                            Back to Marketplace
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </main>
    );
}
