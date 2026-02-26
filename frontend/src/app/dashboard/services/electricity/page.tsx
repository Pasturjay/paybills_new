"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ElectricityPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        providerCode: "IKEDC",
        meterType: "PREPAID",
        meterNumber: "",
        amount: "",
        phone: ""
    });
    const [verification, setVerification] = useState<any>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const providers = ["IKEDC", "EKEDC", "AEDC", "IBEDC"];

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            if (!token) return router.push("/auth/login");

            const res = await api.post("/services/verify", {
                serviceCode: "ELECTRICITY",
                customerId: formData.meterNumber,
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
        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const res = await api.post("/services/bill", {
                type: "ELECTRICITY",
                serviceCode: "ELECTRICITY", // In real app, includes provider
                customerId: formData.meterNumber,
                amount: formData.amount,
                phone: formData.phone,
                providerCode: formData.providerCode
            }, token || "");

            setStatus("success");
            setMessage(`Payment Successful! Token: ${res.token}`);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mt-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Electricity Bill</h2>
                    {step === 2 && <p className="text-sm text-green-600">Verifying: {verification?.customerName}</p>}
                </div>

                {step === 1 ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">DISCO Provider</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.providerCode}
                                onChange={(e) => setFormData({ ...formData, providerCode: e.target.value })}
                            >
                                {providers.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meter Type</label>
                            <div className="flex space-x-4 mt-2">
                                {["PREPAID", "POSTPAID"].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, meterType: t })}
                                        className={`px-4 py-2 rounded border ${formData.meterType === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meter Number</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.meterNumber}
                                onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                                placeholder="1234567890"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {status === "loading" ? "Verifying..." : "Verify Meter"}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₦)</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (For Token)</label>
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
                                disabled={status === "loading" || status === "success"}
                                className="w-2/3 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                {status === "loading" ? "Processing..." : "Pay Bill"}
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
