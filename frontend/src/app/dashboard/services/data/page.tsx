"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DataBundlePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        network: "MTN",
        phone: "",
        planCode: "",
        amount: "0"
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const networks = ["MTN", "AIRTEL", "GLO", "9MOBILE"];

    // Mock Plans - In prod, fetch from API based on Network
    const plans = {
        "MTN": [
            { code: "MTN-1GB", name: "1GB Monthly", price: 300 },
            { code: "MTN-2GB", name: "2GB Monthly", price: 600 },
            { code: "MTN-5GB", name: "5GB Monthly", price: 1500 },
        ],
        "AIRTEL": [
            { code: "AIRTEL-1GB", name: "1GB Monthly", price: 350 },
            { code: "AIRTEL-3GB", name: "3GB Monthly", price: 900 },
        ],
        "GLO": [
            { code: "GLO-1GB", name: "1.5GB Monthly", price: 300 },
        ],
        "9MOBILE": [
            { code: "9MOBILE-1GB", name: "1GB Monthly", price: 300 },
        ]
    };

    const currentPlans = plans[formData.network as keyof typeof plans] || [];

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const plan = currentPlans.find(p => p.code === code);
        setFormData({
            ...formData,
            planCode: code,
            amount: plan ? plan.price.toString() : "0"
        });
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/auth/login");
                return;
            }

            await api.post("/services/data", {
                ...formData,
                providerCode: "VTPASS",
            }, token);

            setStatus("success");
            setMessage(`Successfully purchased ${formData.planCode} for ${formData.phone}`);
            setFormData({ ...formData, phone: "" });
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Transaction failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="mx-auto max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mt-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buy Data Bundle</h2>
                    <p className="text-gray-500 dark:text-gray-400">Cheap data plans for all networks.</p>
                </div>

                <form onSubmit={handlePurchase} className="space-y-6">
                    {/* Network Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network</label>
                        <div className="grid grid-cols-4 gap-2">
                            {networks.map((net) => (
                                <button
                                    key={net}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, network: net, planCode: "", amount: "0" })}
                                    className={`py-2 text-sm font-semibold rounded-md border ${formData.network === net
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        }`}
                                >
                                    {net}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Plan</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            value={formData.planCode}
                            onChange={handlePlanChange}
                        >
                            <option value="">Select a plan</option>
                            {currentPlans.map((plan) => (
                                <option key={plan.code} value={plan.code}>
                                    {plan.name} - ₦{plan.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            placeholder="08012345678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount to Pay</label>
                        <div className="mt-1 block w-full p-2 text-gray-900 dark:text-white font-bold text-lg">
                            ₦{formData.amount}
                        </div>
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

                    <button
                        type="submit"
                        disabled={status === "loading" || !formData.planCode}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {status === "loading" ? "Processing..." : "Purchase Data"}
                    </button>

                    <div className="text-center mt-4">
                        <a href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Dashboard</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
