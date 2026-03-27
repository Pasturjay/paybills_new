import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pay Electricity Bills & Cable TV Online | IKEDC, EKEDC, DSTV, GOTV",
    description: "Pay your IKEDC, EKEDC, AEDC electricity bills and renew DSTV, GOTV, or Startimes subscriptions instantly. Secure utility payments on PayBills.",
    keywords: ["pay electricity bill online", "ikedc prepaid meter recharge", "dstv subscription nigeria", "gotv payment online", "cable tv renewal", "utility bills nigeria"],
};

export default function BillLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
