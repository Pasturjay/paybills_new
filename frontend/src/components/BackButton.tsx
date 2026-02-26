"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function BackButton({ className = "" }: { className?: string }) {
    const router = useRouter();
    const pathname = usePathname();

    // Hide on root and main dashboard page
    if (pathname === "/" || pathname === "/dashboard") {
        return null;
    }

    return (
        <button
            onClick={() => router.back()}
            className={`p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 ${className}`}
            title="Go Back"
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Back</span>
        </button>
    );
}
