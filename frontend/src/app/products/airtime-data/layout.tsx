import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Buy Airtime & Data Online | MTN, Airtel, Glo, 9mobile",
    description: "Instantly top up airtime and buy cheap data for all networks in Nigeria. High-speed delivery, secure payments, and 24/7 service on PayBills.",
    keywords: ["buy airtime online", "cheap data nigeria", "mtn data bundle", "airtel airtime", "glo data subscription", "9mobile top up", "recharge mtn online"],
};

export default function AirtimeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
