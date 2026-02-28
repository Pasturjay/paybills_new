import { useState, useEffect } from "react";
import { X, CreditCard, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export function FundWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [dvaLoading, setDvaLoading] = useState(true);
    const [account, setAccount] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [missingInfo, setMissingInfo] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        phone: ""
    });
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchVirtualAccount();
        }
    }, [isOpen]);

    const fetchVirtualAccount = async () => {
        setDvaLoading(true);
        setMissingInfo(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            // Fetch DVA
            const res = await api.get("/wallet/virtual-account", token);
            setAccount(res);
        } catch (error: any) {
            console.error("Failed to fetch account", error);
            setFetchError(error.message || "Failed to load account details");
            if (error.code === 'MISSING_PROFILE_INFO') {
                setMissingInfo(error.missingFields);
            }
        } finally {
            setDvaLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setDvaLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await api.put("/user/profile", profileData, token);
            // After update, try fetching VA again
            await fetchVirtualAccount();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
            setDvaLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (account?.accountNumber) {
            navigator.clipboard.writeText(account.accountNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    const handleFund = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
            alert("Please enter a valid amount (minimum ₦100)");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            const res = await api.post("/wallet/fund/initialize", { amount }, token);

            if (res.authorization_url) {
                window.location.href = res.authorization_url;
            } else {
                alert("Failed to initialize payment");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top up Wallet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Refill your credit instantly</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Account Display Section */}
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Instant Top Up Account</h4>

                    {dvaLoading ? (
                        <div className="h-24 bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : account ? (
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-2xl font-bold tracking-widest font-mono text-blue-400">{account.accountNumber}</div>
                                    <div className="text-sm font-medium text-white/80 mt-1">{account.bankName}</div>
                                </div>
                                <button onClick={copyToClipboard} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors text-blue-400">
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">{account.accountName}</div>

                            {/* Decorative */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    ) : missingInfo ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                            <p className="text-xs text-blue-400 font-medium mb-1">Few more details needed to create your account:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    required
                                    placeholder="First Name"
                                    value={profileData.firstName}
                                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    required
                                    placeholder="Last Name"
                                    value={profileData.lastName}
                                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <input
                                required
                                placeholder="Phone Number"
                                value={profileData.phone}
                                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                                Generate Account
                            </button>
                        </form>
                    ) : (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400 text-center">
                            {fetchError || "Failed to load account details."}
                        </div>
                    )}
                    <p className="text-[10px] text-gray-500 mt-2 text-center">Transfer to this account number to automatically top up your wallet.</p>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-[#0f172a] px-2 text-gray-500">Or Pay via Card</span>
                    </div>
                </div>

                {/* Card Payment Section */}
                <div>
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="Amount (e.g. 5000)"
                        />
                    </div>

                    <button
                        onClick={handleFund}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        {loading ? "Processing..." : "Top up w/ Card"}
                    </button>
                </div>
            </div>
        </div>
    );
}
