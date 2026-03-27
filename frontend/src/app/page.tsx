import { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";

export const metadata: Metadata = {
    title: "PayBills - #1 Utility Payment & Virtual Card Platform in Nigeria",
    description: "Instantly buy airtime, data, pay electricity bills, cable TV, and fund betting wallets. Create virtual USD cards for Netflix, Apple, and international payments. Secure, fast, and zero fees.",
    keywords: [
        "paybills", "airtime nigeria", "buy data online", "electricity bill payment", 
        "ikeja electric", "eko electric", "dstv subscription", "gotv payment", 
        "virtual dollar card nigeria", "buy windows 11 license", "waec pin online", 
        "fund sportybet", "bet9ja topup", "software licenses nigeria", 
        "itunes gift card", "amazon gift card nigeria", "cheap data nigeria"
    ],
    openGraph: {
        title: "PayBills - Reliable Digital Payments for Africans",
        description: "The fastest way to pay bills and shop globally from Nigeria. Get your virtual card and top up airtime in seconds.",
        images: ["/og-image-home.png"],
    },
};

export default function Home() {
    return <HomeContent />;
}
