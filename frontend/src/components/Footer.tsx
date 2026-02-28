import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
    return (
        <footer className="hidden md:block bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-1">
                        <Link href="/" className="mb-4 block">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Paybills
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 max-w-xs">
                            The most reliable way to access everyday digital services in Nigeria. Secure, fast, and easy.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            A product of <span className="font-medium text-gray-600 dark:text-gray-300">Fecund Integrated Technology Limited</span>
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/products/airtime-data" className="hover:text-blue-600">Airtime & Data</Link></li>
                            <li><Link href="/products/bill-payment" className="hover:text-blue-600">Top Up & Bills</Link></li>
                            <li><Link href="/products/virtual-cards" className="hover:text-blue-600">Virtual Cards</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-blue-600">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/legal/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="/legal/refund" className="hover:text-blue-600">Refund Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Get the App</h4>
                        <div className="space-y-3">
                            <a href="#" className="block w-36 hover:opacity-80 transition-opacity">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="w-full h-auto" />
                            </a>
                            <a href="#" className="block w-36 hover:opacity-80 transition-opacity">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="w-full h-auto" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Partners</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                <a href="https://marketplace.microsoft.com/en-us/partners/086ea8f8-72d6-44a6-8e33-32630eab33c5/overview" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-2">
                                    Microsoft Partner
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-3">
                    <div className="text-center md:text-left space-y-0.5">
                        <p>
                            &copy; {new Date().getFullYear()} <span className="font-medium text-gray-500 dark:text-gray-300">Paybills.ng</span> — operated by Fecund Integrated Technology Limited. All rights reserved.
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">📍 36 Aka Itiam Lane, Uyo, Akwa Ibom State, Nigeria</p>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://instagram.com/usepaybills" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" aria-label="Instagram">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com/usepaybills" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" aria-label="X/Twitter">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://facebook.com/usepaybills" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" aria-label="Facebook">
                            <Facebook className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
