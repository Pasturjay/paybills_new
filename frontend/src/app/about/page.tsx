import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Users, Target, Shield } from "lucide-react";

export default function About() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="pt-32 pb-20 bg-gray-50/30">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">About Paybills</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        We are building the digital lifestyle platform for the modern African.
                        Seamless and instant access to utilities, gaming, software, and gift cards.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                To exclude complexity from accessing everyday digital services. We believe that paying for utilities, buying software, or topping up games should be as simple as sending a text message.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We are driven by innovation and a customer-first approach, ensuring that every transaction on our platform is secure, fast, and reliable.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-6 rounded-2xl">
                                <Target className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="font-bold text-gray-900">Simplicity</h3>
                                <p className="text-sm text-gray-500">Easy to use for everyone.</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-2xl mt-8">
                                <Shield className="w-8 h-8 text-green-600 mb-4" />
                                <h3 className="font-bold text-gray-900">Security</h3>
                                <p className="text-sm text-gray-500">Bank-grade protection.</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl">
                                <Users className="w-8 h-8 text-purple-600 mb-4" />
                                <h3 className="font-bold text-gray-900">Community</h3>
                                <p className="text-sm text-gray-500">Always here to help.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
