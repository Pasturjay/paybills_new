"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardMobileView } from "@/components/DashboardMobileView";
import { NewDashboardDesktopView } from "@/components/NewDashboardDesktopView";
import { FundWalletModal } from "@/components/FundWalletModal";
import GiftUserModal from "@/components/GiftUserModal";
import { useUser, useWallet } from "@/hooks/useData";
import { useIsMobile } from "@/hooks/useIsMobile";

import { SkeletonLoader } from "@/components/ui/Skeleton";

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

    if (userLoading) return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <SkeletonLoader type="card" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} type="card" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SkeletonLoader type="list" />
                </div>
                <div className="lg:col-span-1">
                    <SkeletonLoader type="card" />
                </div>
            </div>
        </div>
    );

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
