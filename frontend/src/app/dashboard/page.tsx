"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardMobileView } from "@/components/DashboardMobileView";
import { NewDashboardDesktopView } from "@/components/NewDashboardDesktopView";
import { FundWalletModal } from "@/components/FundWalletModal";
import GiftUserModal from "@/components/GiftUserModal";
import { useUser, useWallet } from "@/hooks/useData";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { balance, mutate: refreshBalance } = useWallet();
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
        }
    }, [router]);

    if (userLoading || !user) return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;

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
