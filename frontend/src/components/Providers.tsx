"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                shouldRetryOnError: false,
                onError: (error: any, key: string) => {
                    // Suppress noisy 401/403 errors (handled by auth flow)
                    if (error?.status !== 401 && error?.status !== 403) {
                        console.error(`[SWR] Failed to fetch "${key}":`, error?.message || error);
                    }
                },
            }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </SWRConfig>
    );
}
