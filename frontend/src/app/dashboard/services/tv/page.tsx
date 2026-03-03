"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/api";

export default function CableTVPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        providerCode: "DSTV", // DSTV, GOTV, STARTIMES
        smartcardNumber: "",
        packageCode: "", // e.g., DSTV-PREMIUM
        amount: "",
        phone: ""
    });
    const [verification, setVerification] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const [message, setMessage] = useState("");
    const isSubmitting = useRef(false);

    const packages: Record<string, { name: string, price: number, code: string }[]> = {
        "DSTV": [
            { name: "Padi", price: 2500, code: "DSTV-PADI" },
            { name: "Yanga", price: 4200, code: "DSTV-YANGA" },
            { name: "Compact", price: 10500, code: "DSTV-COMPACT" },
            { name: "Premium", price: 24500, code: "DSTV-PREMIUM" }
        ],
        "GOTV": [
            { name: "Jolli", price: 3000, code: "GOTV-JOLLI" },
            { name: "Max", price: 5000, code: "GOTV-MAX" },
        ]
    };

    const currentPackages = packages[formData.providerCode] || [];

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            if (!token) return router.push("/auth/login");

            const res = await api.post("/services/verify", {
                serviceCode: "TV",
                customerId: formData.smartcardNumber,
                providerCode: formData.providerCode
            }, token);

            setVerification(res.data);
            setStep(2);
            setStatus("idle");
        } catch (err: any) {
            setStatus("error");
            setMessage("Verification Failed: " + err.message);
        }
    };

    const handlePurchase = async () => {
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            await api.post("/services/bill", {
                type: "TV",
                serviceCode: formData.packageCode,
                customerId: formData.smartcardNumber,
                amount: formData.amount,
                phone: formData.phone,
                providerCode: formData.providerCode,
                idempotencyKey
            }, token || "");

            setStatus("success");
            setIdempotencyKey(uuidv4());
            setMessage(`Subscription Successful for ${verification?.customerName}!`);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        } finally {
            isSubmitting.current = false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mt-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Cable TV</h2>
                    {step === 2 && <p className="text-sm text-green-600">Verifying: {verification?.customerName}</p>}
                </div>

                {step === 1 ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                            <div className="flex space-x-4 mt-2">
                                {["DSTV", "GOTV", "STARTIMES"].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, providerCode: p })}
                                        className={`px-4 py-2 rounded border ${formData.providerCode === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Smartcard / IUC Number</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.smartcardNumber}
                                onChange={(e) => setFormData({ ...formData, smartcardNumber: e.target.value })}
                                placeholder="1234567890"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {status === "loading" ? "Verifying..." : "Verify Smartcard"}
                        </button>
                        {status === "error" && (
                            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                                {message}
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Package</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                onChange={(e) => {
                                    const pkg = currentPackages.find(p => p.code === e.target.value);
                                    setFormData({
                                        ...formData,
                                        packageCode: e.target.value,
                                        amount: pkg ? pkg.price.toString() : ""
                                    });
                                }}
                            >
                                <option value="">Choose a Package</option>
                                {currentPackages.map(pkg => (
                                    <option key={pkg.code} value={pkg.code}>{pkg.name} - ₦{pkg.price}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₦)</label>
                            <div className="mt-1 block w-full p-2 text-gray-900 dark:text-white font-bold text-lg">
                                ₦{formData.amount || "0.00"}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input
                                type="tel"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {status === "error" && (
                            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                                {message}
                            </div>
                        )}
                        {status === "success" && (
                            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
                                {message}
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-2 px-4 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={status === "loading" || status === "success" || !formData.packageCode}
                                className="w-2/3 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                {status === "loading" ? "Processing..." : "Pay Subscription"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mt-4">
                    <a href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Dashboard</a>
                </div>
            </div>
        </div>
    );
}
