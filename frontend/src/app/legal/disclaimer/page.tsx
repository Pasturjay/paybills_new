import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer | PayBills Nigeria",
    description: "Read the PayBills disclaimer regarding our digital payment services, third-party providers, and transaction liability.",
    keywords: ["paybills disclaimer", "legal notice", "payment liability nigeria", "disclaimer of warranty"],
};

export default function Disclaimer() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <Navbar />
            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
                    <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                        <p className="mb-6"><strong>Last Updated:</strong> March 2026</p>
                        <p className="mb-4">
                            The information provided by PayBills (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) on paybills.ng (the &quot;Site&quot;) is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
                        </p>
                        <h2 className="text-2xl font-bold mt-8 mb-4">1. External Links Disclaimer</h2>
                        <p className="mb-4">
                            The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.
                        </p>
                        <h2 className="text-2xl font-bold mt-8 mb-4">2. Professional Disclaimer</h2>
                        <p className="mb-4">
                            The Site cannot and does not contain financial advice. The financial information is provided for general informational and educational purposes only and is not a substitute for professional advice.
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
