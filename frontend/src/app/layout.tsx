import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: {
        template: '%s | PayBills',
        default: 'PayBills - Seamless Utility Payments & Virtual Cards',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://paybills.ng'),
    description: "PayBills is your all-in-one platform for airtime, data, electricity, cable TV, and virtual dollar cards. Secure, fast, and reliable.",
    keywords: ["paybills", "airtime nigeria", "data subscription", "electricity bills", "virtual dollar card", "cable tv renewal", "software licenses", "gift cards nigeria"],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: "/manifest.json",
    openGraph: {
        title: 'PayBills - Seamless Utility Payments & Virtual Cards',
        description: 'Pay bills, buy data, and create virtual dollar cards instantly.',
        url: 'https://paybills.ng',
        siteName: 'PayBills',
        images: [{ url: 'https://paybills.ng/og-image.png', width: 1200, height: 630 }],
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PayBills - Seamless Utility Top Ups',
        description: 'Instant top-ups, bills, and virtual dollar cards.',
        creator: '@paybills_ng',
        images: ['https://paybills.ng/og-image.png'],
    },
    alternates: {
        canonical: 'https://paybills.ng',
    },
    itunes: {
        appId: '6444000000',
        appArgument: 'https://paybills.ng'
    },
    appLinks: {
        ios: {
            url: 'https://paybills.ng',
            app_store_id: '6444000000',
        },
        android: {
            package: 'com.paybills.app',
            url: 'https://paybills.ng',
        },
        web: {
            url: 'https://paybills.ng',
            should_fallback: true,
        },
    },
    other: {
        'msapplication-TileColor': '#0f172a',
        'microsoft-partner': 'https://marketplace.microsoft.com/en-us/partners/086ea8f8-72d6-44a6-8e33-32630eab33c5/overview',
    },
    verification: {
        google: 'google-site-verification-id', // User should replace this with actual verification ID
    },
};

export const viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    // NOTE: maximumScale and userScalable intentionally omitted to allow
    // pinch-to-zoom for accessibility compliance.
};

import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav").then(mod => mod.MobileBottomNav), { ssr: false });
const CommandCenter = dynamic(() => import("@/components/CommandCenter").then(mod => mod.CommandCenter), { ssr: false });
import { Providers } from "@/components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PayBills",
        "url": "https://paybills.ng",
        "sameAs": [
            "https://twitter.com/paybills_ng",
            "https://facebook.com/paybillsng",
            "https://instagram.com/paybillsng"
        ],
        "description": "Seamless utility payments, virtual cards, and digital lifestyle management."
    };

    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-background font-sans antialiased selection:bg-indigo-100 dark:selection:bg-indigo-900/40", inter.variable)}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {/* Global toast notifications — positioned top-right */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            padding: '12px 16px',
                        },
                        success: {
                            iconTheme: { primary: '#22c55e', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#ef4444', secondary: '#fff' },
                        },
                    }}
                />
                <Providers>
                    <main>
                        {children}
                    </main>
                </Providers>
                <CommandCenter />
                <MobileBottomNav />
            </body>
        </html>
    );
}
