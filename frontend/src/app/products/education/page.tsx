"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GraduationCap, CheckCircle2, Loader2, BookOpen, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PinVerificationModal } from "@/components/PinVerificationModal";
import { useSearchParams } from "next/navigation";

interface Exam {
    id: string;
    name: string;
    description: string;
    price: number;
    logo: string;
    color: string;
}

const defaultExams: Exam[] = [
    { id: "WAEC", name: "WAEC", description: "Result Checker PIN", price: 3800, logo: "W", color: "bg-orange-600 text-white border-orange-600" },
    { id: "NECO", name: "NECO", description: "Result Token", price: 1200, logo: "N", color: "bg-green-600 text-white border-green-600" },
    { id: "JAMB", name: "JAMB", description: "UTME / DE PIN", price: 7700, logo: "J", color: "bg-purple-600 text-white border-purple-600" },
    { id: "NABTEB", name: "NABTEB", description: "Result Checker", price: 1500, logo: "Nb", color: "bg-blue-600 text-white border-blue-600" },
    { id: "NBAIS", name: "NBAIS", description: "Result Checker", price: 2000, logo: "Ni", color: "bg-red-600 text-white border-red-600" },
];

function EducationContent() {
    const searchParams = useSearchParams();
    const providerParam = searchParams.get("provider");

    const [exams, setExams] = useState<Exam[]>(defaultExams);
    const [selectedExamId, setSelectedExamId] = useState<string>(providerParam || "");
    const [quantity, setQuantity] = useState(1);

    // Checkout State
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);
    const [error, setError] = useState("");

    // Load dynamic pricing if available
    useEffect(() => {
        api.get("/products/education/exams", "")
            .then(res => {
                if (Array.isArray(res)) setExams(res.map((e: any) => ({
                    ...e,
                    // Map backend data to frontend structure if needed, or just use defaults for style
                    color: e.id === 'WAEC' ? "bg-orange-600 text-white border-orange-600" :
                        e.id === 'NECO' ? "bg-green-600 text-white border-green-600" :
                            e.id === 'JAMB' ? "bg-purple-600 text-white border-purple-600" :
                                "bg-blue-600 text-white border-blue-600"
                })));
            })
            .catch(() => { }); // Fallback to defaults
    }, []);

    // Update selected exam if URL param changes
    useEffect(() => {
        if (providerParam) {
            setSelectedExamId(providerParam);
        }
    }, [providerParam]);

    const selectedExam = exams.find(e => e.id === selectedExamId);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) return;
        setCheckoutOpen(true);
        setError("");
        setSuccess(null);
    };

    const handlePinSubmit = async (pin: string) => {
        if (!selectedExam) return;
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please login to continue");

            const res = await api.post("/products/education/purchase", {
                examType: selectedExam.id,
                quantity,
                amount: selectedExam.price * quantity,
                pin
            }, token);

            if (res.result?.success) {
                setSuccess(res);
                setPinModalOpen(false);
                setCheckoutOpen(false);
            } else {
                throw new Error(res.error || "Purchase failed");
            }
        } catch (e: any) {
            setError(e.message || "Failed to purchase PIN");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
            <Navbar />

            {/* Header */}
            <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-transparent"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <GraduationCap className="w-10 h-10 text-green-400" />
                        Education PINs
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto">
                        Instant delivery of Exam Result Checkers and Registration PINs for WAEC, NECO, JAMB, and more.
                    </p>
                </div>
            </section>

            {/* Purchase Form */}
            <section className="-mt-8 pb-20 px-6 relative z-20">
                <div className="container mx-auto max-w-lg">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800">
                        {success ? (
                            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Purchase Successful!</h3>
                                <p className="text-gray-500 mb-6">
                                    Your {selectedExam?.name} PIN(s) have been generated.
                                    {success.result?.reference && (
                                        <div className="mt-2 text-xs text-gray-400">Ref: {success.result.reference}</div>
                                    )}
                                </p>
                                <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-xl mb-6 text-left max-h-60 overflow-y-auto">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">PIN(s) Sent to Email</p>
                                    <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                        Check your email or transaction history for the PIN details.
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90"
                                >
                                    Buy Another PIN
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3 text-left">Select Exam Body</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {exams.map((exam) => (
                                            <button
                                                key={exam.id}
                                                type="button"
                                                onClick={() => { setSelectedExamId(exam.id); setQuantity(1); }}
                                                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all border-2 min-h-[70px] sm:min-h-[80px] ${selectedExamId === exam.id
                                                    ? `${exam.color} ring-2 ring-offset-2 ring-green-500 dark:ring-offset-zinc-900`
                                                    : "bg-gray-50 dark:bg-zinc-800 text-gray-500 border-transparent grayscale hover:grayscale-0"
                                                    }`}
                                            >
                                                <span className="font-extrabold text-[13px] sm:text-sm">{exam.name}</span>
                                                <span className="text-[9px] sm:text-[10px] opacity-80 leading-tight font-bold">{exam.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedExam && (
                                    <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                            <div>
                                                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase mb-1 tracking-widest">Price Per PIN</div>
                                                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">₦{selectedExam.price.toLocaleString()}</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 text-blue-600 flex items-center justify-center">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-left">Quantity</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <div className="flex-1 h-12 flex items-center justify-center font-bold text-2xl border-b-2 border-gray-200 dark:border-zinc-700">
                                                    {quantity}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-500">
                                                <span>Total Amount</span>
                                                <span className="text-xl text-gray-900 dark:text-white">₦{(selectedExam.price * quantity).toLocaleString()}</span>
                                            </div>

                                            {error && (
                                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl mb-4">
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                Purchase PINs
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                onConfirm={() => { setCheckoutOpen(false); setPinModalOpen(true); }}
                amount={selectedExam ? selectedExam.price * quantity : 0}
                title={selectedExam?.name || ""}
                details={[
                    { label: "Exam Body", value: selectedExam?.name || "" },
                    { label: "Product", value: selectedExam?.description || "" },
                    { label: "Quantity", value: quantity.toString() },
                ]}
            />

            <PinVerificationModal
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onVerify={handlePinSubmit}
                loading={loading}
                error={error}
                title={`Confirm ${selectedExam?.name} Purchase`}
            />

            <Footer />
        </main>
    );
}

import { Suspense } from 'react';
export default function Education() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EducationContent />
        </Suspense>
    );
}


