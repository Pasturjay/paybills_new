import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Game Top-Up Nigeria | PUBG, Free Fire, Mobile Legends",
    description: "Instantly top up your favorite games. Buy UC for PUBG, Diamonds for Free Fire, and CP for COD Mobile. Secure gaming payments on PayBills.",
    keywords: ["pubg mobile uc buy nigeria", "free fire diamonds cheap", "game top up online", "mobile legends diamonds", "cod mobile cp nigeria", "gaming credits buy"],
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
