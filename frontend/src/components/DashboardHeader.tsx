import { useState, useEffect } from "react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { User, ChevronDown, LogOut, Menu, ArrowLeft, AtSign } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { BackButton } from "./BackButton";

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Dashboard";
        if (pathname.includes("/services")) return "Services";
        if (pathname.includes("/virtual-cards")) return "Virtual Cards";
        if (pathname.includes("/virtual-numbers")) return "Virtual Numbers";
        if (pathname.includes("/history")) return "Transaction History";
        if (pathname.includes("/profile")) return "Profile Settings";
        return "PayBills";
    };

    const isDashboard = pathname === "/dashboard";

    return (
        <header className="bg-white dark:bg-zinc-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">

            {/* Left: Mobile Menu / Back Button / Title */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Mobile Menu Trigger */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Back Button */}
                <BackButton className="md:hidden -ml-2" />

                {/* Page Title */}
                <h1 className={`text-lg md:text-xl font-bold text-gray-900 dark:text-white ${!isDashboard ? 'block' : 'hidden md:block'}`}>
                    {getPageTitle()}
                </h1>

                {/* Logo on Dashboard Mobile if title hidden? No, title covers it. */}
                {isDashboard && (
                    <div className="md:hidden flex items-center gap-2">
                        {/* Maybe Show Welcome here? Or just Logo? */}
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PayBills</span>
                    </div>
                )}
            </div>


            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-6">
                {/* Notifications */}
                <NotificationDropdown />

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-900 px-1.5 py-1.5 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-800"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                                {user?.firstName} {user?.lastName}
                                {user?.userTag && <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">@{user.userTag}</div>}
                            </div>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 dark:bg-blue-600 flex items-center justify-center text-blue-700 dark:text-white font-bold border-2 border-white dark:border-zinc-800 shadow-sm text-xs md:text-sm">
                            {user ? getInitials(user.firstName, user.lastName) : <User className="w-5 h-5" />}
                        </div>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-50 dark:border-zinc-800 sm:hidden bg-gray-50/50 dark:bg-zinc-800/50">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                                <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold w-fit">
                                    <AtSign className="w-3 h-3" /> {user?.userTag || 'no-tag'}
                                </div>
                            </div>
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User className="w-4 h-4" /> Profile Settings
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user");
                                    window.location.href = "/auth/login";
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
