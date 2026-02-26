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
    manifest: "/manifest.json",
    themeColor: "#0f172a",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "PayBills",
    },
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
    openGraph: {
        title: 'PayBills - Seamless Utility Payments',
        description: 'Pay bills, buy data, and create virtual dollar cards instantly.',
        url: 'https://paybills.ng',
        siteName: 'PayBills',
        images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PayBills - Seamless Utility Payments',
        creator: '@paybills_ng',
    },
    alternates: {
        canonical: 'https://paybills.ng',
    },
    itunes: {
        appId: '123456789', // Replace with actual App Store ID
        appArgument: 'https://paybills.ng'
    },
    appLinks: {
        ios: {
            url: 'https://paybills.ng',
            app_store_id: '123456789', // Replace with actual App Store ID
        },
        android: {
            package: 'ng.paybills.app', // Replace with actual Android package name
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
    }
};

import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
                {children}
                <MobileBottomNav />
            </body>
        </html>
    );
}
