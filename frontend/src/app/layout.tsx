import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: {
        template: '%s | PayBills',
        default: 'PayBills - Nigeria\'s #1 Utility Payment & Virtual Card Platform',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://paybills.ng'),
    description: "PayBills is your all-in-one platform for instant airtime, cheap data, electricity bills, cable TV, and premium virtual dollar cards. Experience secure, fast, and 100% reliable digital payments with zero transaction fees.",
    keywords: [
        "paybills", "paybills nigeria", "buy airtime online", "cheap data bundles nigeria", 
        "electricity bill payment", "ikeja electric prepaid", "eko electric postpaid", 
        "dstv subscription online", "gotv payment lagos", "startimes recharge", 
        "virtual dollar card nigeria", "dollar card for netflix", "buy software licenses", 
        "windows 11 product key", "waec result checker pin", "neco token online", 
        "jamb pin purchase", "fund sportybet account", "bet9ja wallet funding", 
        "gift cards nigeria", "itunes gift card", "amazon gift card buy"
    ],
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
        description: 'Join 10,000+ Nigerians paying bills and shopping globally with PayBills. Instant delivery on all digital services.',
        url: 'https://paybills.ng',
        siteName: 'PayBills',
        images: [{ url: 'https://paybills.ng/og-image.png', width: 1200, height: 630, alt: 'PayBills Digital Services' }],
        locale: 'en_NG',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PayBills - Nigeria\'s Top Digital Payment App',
        description: 'Instant airtime, data, bills, and virtual dollar cards. Fast, secure, and zero fees.',
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
        google: 'google-site-verification-id',
    },
};

export const viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
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
        "@id": "https://paybills.ng/#organization",
        "name": "PayBills",
        "url": "https://paybills.ng",
        "logo": "https://paybills.ng/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-800-PAYBILLS",
            "contactType": "customer service",
            "areaServed": "NG",
            "availableLanguage": "en"
        },
        "sameAs": [
            "https://twitter.com/paybills_ng",
            "https://facebook.com/paybillsng",
            "https://instagram.com/paybillsng"
        ],
        "description": "Premium platform for utility payments, virtual cards, and digital lifestyle management in Nigeria.",
        "brand": {
            "@type": "Brand",
            "name": "PayBills"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "36 Aka Itiam Lane",
            "addressLocality": "Uyo",
            "addressRegion": "Akwa Ibom",
            "addressCountry": "NG"
        }
    };

    const siteLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://paybills.ng/#website",
        "url": "https://paybills.ng",
        "name": "PayBills",
        "description": "Seamless Utility Payments & Virtual Cards",
        "publisher": { "@id": "https://paybills.ng/#organization" },
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://paybills.ng/products?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };


    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-background font-sans antialiased selection:bg-indigo-100 dark:selection:bg-indigo-900/40", inter.variable)}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
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
