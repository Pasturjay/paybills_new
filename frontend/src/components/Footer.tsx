import Link from 'next/link';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { PaybillsLogo } from "@/components/PaybillsLogo";

export function Footer() {
    return (
        <footer className="hidden md:block relative overflow-hidden pt-20 pb-10 mt-10 bg-[#0a0a14] border-t border-white/10"
        >
            {/* Top gloss divider */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-14">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 glow-blue btn-premium"
                            >
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                                <PaybillsLogo className="w-5 h-5 text-white relative z-10" variant="white" />
                            </div>
                            <span className="text-white font-black text-xl tracking-tight">
                                Pay<span className="text-gradient-blue">bills</span>
                            </span>
                        </Link>
                        <p className="text-[15px] font-bold text-gray-300 mb-3 max-w-xs leading-relaxed">
                            The most reliable platform for digital services in Nigeria. Secure, instant, and zero fees.
                        </p>
                        <p className="text-xs font-semibold text-gray-500">
                            A product of{" "}
                            <span className="font-black text-gray-300">Fecund Integrated Technology Limited</span>
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-black text-white text-sm mb-5 uppercase tracking-widest drop-shadow-md">Product</h4>
                        <ul className="space-y-3 text-[15px] font-bold text-gray-400">
                            <li><Link href="/products/airtime-data" className="hover:text-indigo-400 transition-colors duration-200">Airtime & Data</Link></li>
                            <li><Link href="/products/bill-payment" className="hover:text-indigo-400 transition-colors duration-200">Top Up & Bills</Link></li>
                            <li><Link href="/products/virtual-cards" className="hover:text-indigo-400 transition-colors duration-200">Virtual Cards</Link></li>
                            <li><Link href="/products/software" className="hover:text-indigo-400 transition-colors duration-200">Software Licenses</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-black text-white text-sm mb-5 uppercase tracking-widest drop-shadow-md">Company</h4>
                        <ul className="space-y-3 text-[15px] font-bold text-gray-400">
                            <li><Link href="/about" className="hover:text-indigo-400 transition-colors duration-200">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-indigo-400 transition-colors duration-200">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-400 transition-colors duration-200">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-black text-white text-sm mb-5 uppercase tracking-widest drop-shadow-md">Legal</h4>
                        <ul className="space-y-3 text-[15px] font-bold text-gray-400">
                            <li><Link href="/legal/privacy" className="hover:text-indigo-400 transition-colors duration-200">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-indigo-400 transition-colors duration-200">Terms of Service</Link></li>
                            <li><Link href="/legal/refund" className="hover:text-indigo-400 transition-colors duration-200">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div>
                        <h4 className="font-black text-white text-sm mb-5 uppercase tracking-widest drop-shadow-md">Get Started</h4>
                        <Link href="/auth/register"
                            className="shine btn-premium inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[15px] transition-all duration-300 hover:scale-[1.02] mb-6 glow-blue"
                        >
                            Create Free Account <ArrowRight className="w-4 h-4" />
                        </Link>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="block w-36 hover:opacity-100 opacity-90 transition-all hover:scale-[1.03] duration-300 border border-white/5 hover:border-white/20 rounded-lg overflow-hidden glass-panel">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="w-full h-auto" />
                            </a>
                            <a href="#" className="block w-36 hover:opacity-100 opacity-90 transition-all hover:scale-[1.03] duration-300 border border-white/5 hover:border-white/20 rounded-lg overflow-hidden glass-panel">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="w-full h-auto" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-gray-500 gap-4">
                    <div className="text-center md:text-left space-y-1">
                        <p>
                            © {new Date().getFullYear()}{" "}
                            <span className="font-black text-gray-300">Paybills.ng</span>{" "}
                            — operated by Fecund Integrated Technology Limited. All rights reserved.
                        </p>
                        <p className="text-gray-400">📍 36 Aka Itiam Lane, Uyo, Akwa Ibom State, Nigeria</p>
                    </div>
                    <div className="flex gap-3">
                        {[
                            { href: "https://instagram.com/usepaybills", Icon: Instagram, label: "Instagram" },
                            { href: "https://twitter.com/usepaybills", Icon: Twitter, label: "Twitter" },
                            { href: "https://facebook.com/usepaybills", Icon: Facebook, label: "Facebook" },
                        ].map(({ href, Icon, label }) => (
                            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                                className="shine w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-indigo-500 border border-white/10 hover:border-indigo-400 text-gray-400 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
