"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface ServiceModalProps {
    service: any;
    initialState?: {
        provider?: string;
        identifier?: string;
        plan?: string;
        amount?: string;
    };
    onClose: () => void;
}

export function ServiceModal({ service, initialState, onClose }: ServiceModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        network: "",
        phone: "",
        amount: initialState?.amount || "",
        provider: initialState?.provider || "", // For Bills (DSTV, IKEJA, etc.)
        identifier: initialState?.identifier || "", // Meter No or IUC,
        plan: initialState?.plan || "",
        pin: "",
        quantity: 1
    });

    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        if (service.title.includes("Airtime") || service.title.includes("Data")) {
            // Fetch Networks
            setOptions([
                { code: "MTN", name: "MTN" },
                { code: "AIRTEL", name: "Airtel" },
                { code: "GLO", name: "Glo" },
                { code: "9MOBILE", name: "9mobile" }
            ]);
        } else if (service.title.includes("Electricity")) {
            setOptions([
                { code: "ikeja-electric", name: "Ikeja Electric (IKEDC)" },
                { code: "eko-electric", name: "Eko Electric (EKEDC)" },
                { code: "abuja-electric", name: "Abuja Electric (AEDC)" },
                { code: "ibadan-electric", name: "Ibadan Electric (IBEDC)" }
            ]);
        } else if (service.title.includes("Cable")) {
            setOptions([
                { code: "dstv", name: "DSTV" },
                { code: "gotv", name: "GOTV" },
                { code: "startimes", name: "Startimes" }
            ]);
        } else if (service.title.includes("Betting")) {
            setOptions([
                { code: "BET9JA", name: "Bet9ja" },
                { code: "SPORTY", name: "SportyBet" },
                { code: "1XBET", name: "1xBet" },
                { code: "BETKING", name: "BetKing" }
            ]);
        } else if (service.title.includes("Software")) {
            setOptions([
                { code: JSON.stringify({ id: 'win11', price: 15000 }), name: "Windows 11 Pro - ₦15,000" },
                { code: JSON.stringify({ id: 'office', price: 25000 }), name: "Office 365 - ₦25,000" },
                { code: JSON.stringify({ id: 'kaspersky', price: 8500 }), name: "Kaspersky Total Security - ₦8,500" }
            ]);
        } else if (service.title.includes("Education")) {
            setOptions([
                { code: "WAEC", name: "WAEC Result Checker", price: 3800 },
                { code: "NECO", name: "NECO Result Token", price: 1200 },
                { code: "JAMB", name: "JAMB UTME PIN", price: 7700 },
                { code: "NABTEB", name: "NABTEB Result Checker", price: 1500 },
                { code: "NBAIS", name: "NBAIS Result Checker", price: 2000 }
            ]);
        }
    }, [service]);

    const handlePurchase = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        try {
            let endpoint = "";
            let payload: any = {};

            if (service.title.includes("Airtime")) {
                endpoint = "/products/airtime/purchase";
                payload = {
                    networkId: formData.network,
                    phoneNumber: formData.phone,
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Data")) {
                endpoint = "/products/data/purchase";
                payload = {
                    networkId: formData.network,
                    phoneNumber: formData.phone,
                    planId: formData.plan,
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Cable")) {
                endpoint = "/products/cable/purchase";
                payload = {
                    providerId: formData.provider,
                    smartcardNumber: formData.identifier,
                    packageId: formData.plan,
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Electricity")) {
                endpoint = "/products/electricity/purchase";
                payload = {
                    providerId: formData.provider,
                    meterNumber: formData.identifier,
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Betting")) {
                endpoint = "/products/betting/purchase";
                payload = {
                    bookmaker: formData.provider,
                    customerId: formData.identifier,
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Software")) {
                endpoint = "/products/software/purchase";
                payload = {
                    itemCode: formData.plan, // Use plan/option code as item identifier
                    amount: Number(formData.amount)
                };
            } else if (service.title.includes("Education")) {
                endpoint = "/products/education/purchase";
                payload = {
                    type: formData.provider,
                    quantity: formData.quantity
                };
            }

            payload.pin = formData.pin;

            if (!formData.pin || formData.pin.length !== 4) {
                setError("Please enter a valid 4-digit PIN");
                setLoading(false);
                return;
            }

            const res = await api.post(endpoint, payload, token || undefined);
            setResult(res);
            setStep(2); // Success Step
        } catch (err: any) {
            setError(err.response?.data?.error || "Transaction failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {service.icon} {service.title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {/* Dynamic Fields */}
                            {(service.title.includes("Airtime") || service.title.includes("Data")) && (
                                <div>
                                    <label className="block text-sm font-medium mb-3 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">
                                        Select Network
                                    </label>
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {options.map((opt) => {
                                            const isSelected = formData.network === opt.code;
                                            return (
                                                <button
                                                    key={opt.code}
                                                    onClick={() => setFormData({ ...formData, network: opt.code })}
                                                    className={`relative py-3 px-2 rounded-xl transition-all border flex flex-col items-center justify-center gap-2 ${isSelected
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                                                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{opt.name}</span>
                                                    {isSelected && <div className="absolute inset-0 border-2 border-blue-600 rounded-xl pointer-events-none" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="08012345678"
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {(service.title.includes("Electricity") || service.title.includes("Cable") || service.title.includes("Betting")) && (
                                <div>
                                    {/* Betting - Bookmaker Grid */}
                                    {service.title.includes("Betting") ? (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-3 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">
                                                Select Bookmaker
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {options.map((opt) => {
                                                    const isSelected = formData.provider === opt.code;
                                                    return (
                                                        <button
                                                            key={opt.code}
                                                            onClick={() => setFormData({ ...formData, provider: opt.code })}
                                                            className={`relative py-3 px-4 rounded-xl transition-all border flex items-center justify-center gap-2 ${isSelected
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                                                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                                                }`}
                                                        >
                                                            <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{opt.name}</span>
                                                            {isSelected && <div className="absolute inset-0 border-2 border-blue-600 rounded-xl pointer-events-none" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Others - Dropdown */
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">
                                                Provider
                                            </label>
                                            <select
                                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                            >
                                                <option value="">Select Provider</option>
                                                {options.map(opt => <option key={opt.code} value={opt.code}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">
                                            {service.title.includes("Electricity") ? "Meter Number" :
                                                service.title.includes("Betting") ? "User ID" : "Smartcard / IUC"}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Enter ID"
                                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {service.title.includes("Education") && (
                                <div>
                                    <label className="block text-sm font-bold mb-3 text-gray-500 uppercase tracking-wider text-xs">
                                        Select Exam Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {options.map((opt) => {
                                            const isSelected = formData.provider === opt.code;
                                            return (
                                                <button
                                                    key={opt.code}
                                                    onClick={() => setFormData({ ...formData, provider: opt.code, amount: (opt.price * formData.quantity).toString() })}
                                                    className={`py-6 px-4 rounded-xl transition-all border flex flex-col items-center justify-center gap-1 shadow-sm ${isSelected
                                                        ? 'bg-violet-600 text-white border-violet-600'
                                                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{opt.code}</span>
                                                    <span className={`text-sm ${isSelected ? 'text-violet-100' : 'text-gray-500'}`}>₦{opt.price.toLocaleString()}</span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-bold mb-3 text-gray-500 uppercase tracking-wider text-xs">
                                            Quantity
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => {
                                                    const newQty = Math.max(1, formData.quantity - 1);
                                                    const price = options.find(o => o.code === formData.provider)?.price || 0;
                                                    setFormData({ ...formData, quantity: newQty, amount: (price * newQty).toString() });
                                                }}
                                                className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white flex items-center justify-center text-xl font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-3xl font-bold w-12 text-center text-gray-900 dark:text-white">{formData.quantity}</span>
                                            <button
                                                onClick={() => {
                                                    const newQty = formData.quantity + 1;
                                                    const price = options.find(o => o.code === formData.provider)?.price || 0;
                                                    setFormData({ ...formData, quantity: newQty, amount: (price * newQty).toString() });
                                                }}
                                                className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white flex items-center justify-center text-xl font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan Selection for Data & Cable & Software */}
                            {(service.title.includes("Data") || service.title.includes("Cable") || service.title.includes("Software")) && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">Select Package</label>
                                    <select
                                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => {
                                            const plan = JSON.parse(e.target.value);
                                            // For Software, we might store plan in provider or plan field. sticking to plan.
                                            setFormData({ ...formData, plan: plan.id, amount: plan.price, identifier: service.title.includes("Software") ? "LICENSE" : formData.identifier });
                                        }}
                                    >
                                        <option value="">Select a Plan</option>

                                        {/* Software Plans (Dynamic from Options) */}
                                        {service.title.includes("Software") && options.map(opt => (
                                            <option key={opt.name} value={opt.code}>{opt.name}</option>
                                        ))}

                                        {/* Mock Data Plans */}
                                        {service.title.includes("Data") && (
                                            <>
                                                <optgroup label="Daily Plans">
                                                    <option value={JSON.stringify({ id: "100MB", price: 100 })}>100MB Daily - ₦100</option>
                                                    <option value={JSON.stringify({ id: "200MB", price: 200 })}>200MB Daily - ₦200</option>
                                                </optgroup>
                                                <optgroup label="Weekly Plans">
                                                    <option value={JSON.stringify({ id: "350MB", price: 300 })}>350MB Weekly - ₦300</option>
                                                    <option value={JSON.stringify({ id: "1GB", price: 500 })}>1GB Weekly - ₦500</option>
                                                </optgroup>
                                                <optgroup label="Monthly Plans">
                                                    <option value={JSON.stringify({ id: "1.5GB", price: 1000 })}>1.5GB Monthly - ₦1,000</option>
                                                    <option value={JSON.stringify({ id: "3GB", price: 1500 })}>3GB Monthly - ₦1,500</option>
                                                    <option value={JSON.stringify({ id: "10GB", price: 5000 })}>10GB Monthly - ₦5,000</option>
                                                </optgroup>
                                            </>
                                        )}
                                        {/* Mock Cable Plans */}
                                        {service.title.includes("Cable") && formData.provider === 'dstv' && (
                                            <>
                                                <option value={JSON.stringify({ id: "padi", price: 2500 })}>DSTV Padi - ₦2,500</option>
                                                <option value={JSON.stringify({ id: "yanga", price: 4200 })}>DSTV Yanga - ₦4,200</option>
                                                <option value={JSON.stringify({ id: "confam", price: 7400 })}>DSTV Confam - ₦7,400</option>
                                                <option value={JSON.stringify({ id: "premium", price: 24000 })}>DSTV Premium - ₦24,000</option>
                                            </>
                                        )}
                                        {service.title.includes("Cable") && formData.provider === 'gotv' && (
                                            <>
                                                <option value={JSON.stringify({ id: "jinja", price: 2700 })}>GOTV Jinja - ₦2,700</option>
                                                <option value={JSON.stringify({ id: "jolli", price: 3950 })}>GOTV Jolli - ₦3,950</option>
                                                <option value={JSON.stringify({ id: "max", price: 5700 })}>GOTV Max - ₦5,700</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}

                            {/* Amount Field (ReadOnly for Plans, Editable for others) */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">Amount (₦)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</div>
                                    <input
                                        type="number"
                                        className={`w-full p-4 pl-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${service.title.includes("Data") || service.title.includes("Cable") || service.title.includes("Software") || service.title.includes("Education") ? "opacity-50 cursor-not-allowed" : ""}`}
                                        placeholder="0.00"
                                        value={formData.amount}
                                        readOnly={service.title.includes("Data") || service.title.includes("Cable") || service.title.includes("Software") || service.title.includes("Education")}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>

                                {/* Quick Amount Chips for Editable Fields (Betting, Electricity, Airtime) */}
                                {!(service.title.includes("Data") || service.title.includes("Cable") || service.title.includes("Software") || service.title.includes("Education")) && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {[1000, 2000, 5000, 10000].map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                                                className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                            >
                                                ₦{amt.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* PIN Input */}
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300 uppercase tracking-wider text-xs text-gray-500">Transaction PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black/20 dark:text-white text-center font-bold text-2xl tracking-[1em] outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:tracking-normal"
                                    placeholder="****"
                                    value={formData.pin}
                                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={loading || !formData.pin || formData.pin.length !== 4}
                                className={`w-full py-4 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${service.title.includes("Education") ? "bg-[#93c5fd] hover:bg-blue-400 text-blue-900" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment"}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaction Successful!</h4>
                            <p className="text-gray-500 mb-6">Your payment has been processed successfully.</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-900 dark:bg-white dark:text-black text-white rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
