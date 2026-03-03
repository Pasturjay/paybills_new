"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileSidebar } from "@/components/MobileSidebar";
import { socketClient } from "@/lib/socket";
import { useSWRConfig } from "swr";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { mutate } = useSWRConfig();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        // Initialize Socket
        socketClient.connect(token);

        // Listen for Updates
        const handleBalanceUpdate = (data: any) => {
            console.log("Real-time Balance Update:", data);
            mutate("/wallet/balance");
        };

        const handleTransactionNew = (data: any) => {
            console.log("Real-time Transaction News:", data);
            mutate("/wallet/transactions");
            // Optional: Show a toast or notification here
        };

        socketClient.on("BALANCE_UPDATE", handleBalanceUpdate);
        socketClient.on("TRANSACTION_NEW", handleTransactionNew);

        return () => {
            socketClient.off("BALANCE_UPDATE", handleBalanceUpdate);
            socketClient.off("TRANSACTION_NEW", handleTransactionNew);
            socketClient.disconnect();
        };
    }, [router, mutate]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 font-sans">
            <DashboardSidebar />
            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area - Shifted Right on Desktop */}
            <div className="md:ml-64 min-h-screen transition-all duration-300 flex flex-col">
                <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

