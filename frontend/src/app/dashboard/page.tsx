"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardMobileView } from "@/components/DashboardMobileView";
import { NewDashboardDesktopView } from "@/components/NewDashboardDesktopView";
import { FundWalletModal } from "@/components/FundWalletModal";
import GiftUserModal from "@/components/GiftUserModal";
import { useUser, useWallet } from "@/hooks/useData";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: userLoading, isError: userError } = useUser();
    const { balance, mutate: refreshBalance } = useWallet();
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        }
    }, [router]);

    // Handle error or missing user after loading
    useEffect(() => {
        if (!userLoading && (!user || userError)) {
            console.error("User not found or error occurred, redirecting...", { user, userError });
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/auth/login");
        }
    }, [user, userLoading, userError, router]);

    if (userLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;

    // If we reach here and don't have a user, it's safer to just show nothing while redirecting
    if (!user) return null;

    const formattedBalance = balance ? { balance, currency: 'NGN' } : null;

    return (
        <>
            <DashboardMobileView
                user={user}
                balance={formattedBalance}
                onAddMoney={() => setIsFundModalOpen(true)}
                onSendMoney={() => setIsSendMoneyModalOpen(true)}
            />
            <NewDashboardDesktopView
                user={user}
                balance={formattedBalance}
                onAddMoney={() => setIsFundModalOpen(true)}
                onSendMoney={() => setIsSendMoneyModalOpen(true)}
            />

            <FundWalletModal isOpen={isFundModalOpen} onClose={() => setIsFundModalOpen(false)} />
            <GiftUserModal
                isOpen={isSendMoneyModalOpen}
                onClose={() => setIsSendMoneyModalOpen(false)}
                onSuccess={() => refreshBalance()}
            />
        </>
    );
}
