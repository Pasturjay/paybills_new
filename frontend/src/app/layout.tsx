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
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
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
        google: 'google-site-verification-id', // User should replace this
    },
};

export const viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import dynamic from "next/dynamic";
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
        "logo": "https://paybills.ng/logo.png",
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
