import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />

            <section className="pt-28 pb-16 sm:pt-32 sm:pb-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                        <p className="text-gray-600 text-base sm:text-lg">
                            Have questions or need support? We are here to help you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Contact Info */}
                        <div className="flex sm:flex-col flex-row sm:space-y-6 gap-4 sm:gap-0 sm:col-span-1">
                            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex-1">
                                <Mail className="w-6 h-6 text-blue-600 mb-3" />
                                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Email Us</h3>
                                <p className="text-gray-500">support@paybills.ng</p>
                                <p className="text-gray-500">partners@paybills.ng</p>
                            </div>
                            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex-1">
                                <Phone className="w-6 h-6 text-blue-600 mb-3" />
                                <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">Call Us</h3>
                                <p className="text-gray-500">+234 800 PAYBILLS</p>
                                <p className="text-gray-500 text-sm">Mon - Fri, 9am - 5pm</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="sm:col-span-2 bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="john@example.com" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="How can we help you?"></textarea>
                                </div>

                                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
