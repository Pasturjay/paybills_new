import { Smartphone, Zap, Download, Gamepad2, BookOpen, CreditCard } from "lucide-react";

/**
 * Shared transaction helpers — single source of truth for all dashboard views.
 */

export function getTransactionIcon(type: string, description: string) {
    const descLower = description?.toLowerCase() || "";
    if (descLower.includes("airtime") || descLower.includes("data")) return <Smartphone className="w-5 h-5" />;
    if (descLower.includes("electricity")) return <Zap className="w-5 h-5" />;
    if (descLower.includes("software") || descLower.includes("windows") || descLower.includes("office")) return <Download className="w-5 h-5" />;
    if (descLower.includes("bet") || descLower.includes("sport") || descLower.includes("game")) return <Gamepad2 className="w-5 h-5" />;
    if (descLower.includes("education") || descLower.includes("waec") || descLower.includes("jamb") || descLower.includes("neco")) return <BookOpen className="w-5 h-5" />;
    return <CreditCard className="w-5 h-5" />;
}

export function getTransactionStyle(type: string, description: string, isCredit: boolean): string {
    if (isCredit) return "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/20 border-green-500/30";

    const descLower = description?.toLowerCase() || "";
    if (descLower.includes("airtime") || descLower.includes("data")) return "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-blue-500/30";
    if (descLower.includes("electricity")) return "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 border-amber-500/30";
    if (descLower.includes("software") || descLower.includes("windows") || descLower.includes("office")) return "bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white shadow-lg shadow-purple-500/20 border-purple-500/30";
    if (descLower.includes("bet") || descLower.includes("sport")) return "bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-rose-500/20 border-rose-500/30";
    if (descLower.includes("education") || descLower.includes("waec") || descLower.includes("jamb")) return "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20 border-cyan-500/30";
    return "bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/20 border-gray-500/30";
}

export function isTransactionCredit(tx: { type: string; reference?: string }): boolean {
    return tx.type === "FUNDING" || (tx.type === "P2P_TRANSFER" && (tx.reference?.includes("_CR") ?? false));
}
