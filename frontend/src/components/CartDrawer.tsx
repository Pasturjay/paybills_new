import { X, Minus, Plus, ShoppingCart, Trash2, CreditCard, Wallet, Shield } from "lucide-react";
import { SoftwareProduct } from "@/data/software";

interface CartItem {
    product: SoftwareProduct;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
    onCheckout: (method: 'WALLET' | 'PAYSTACK') => void;
    isRedirecting?: boolean;
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove, onCheckout, isRedirecting }: CartDrawerProps) {
    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400">
                                    <ShoppingCart className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</h3>
                                    <p className="text-gray-500">Looks like you haven&apos;t added any software yet.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.product.id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-xl flex-shrink-0 flex items-center justify-center">
                                        <span className="font-bold text-gray-400 text-xs">{item.product.brand}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{item.product.licenseType}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-blue-600 dark:text-blue-400">
                                                ₦{item.product.price.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-all disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.product.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors self-start"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Checkout */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500">Total Amount</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ₦{totalAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => onCheckout('PAYSTACK')}
                                    disabled={isRedirecting}
                                    className="w-full py-4 bg-[#3BB75E] hover:bg-[#2E8F4A] disabled:opacity-70 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-green-600/20"
                                >
                                    {isRedirecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Redirecting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            <span>Pay ₦{totalAmount.toLocaleString()}</span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                                    <span className="text-xs text-gray-400 font-medium uppercase min-w-fit">Or Pay With</span>
                                    <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1"></div>
                                </div>

                                <button
                                    onClick={() => onCheckout('WALLET')}
                                    className="w-full py-3.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Wallet Balance
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
