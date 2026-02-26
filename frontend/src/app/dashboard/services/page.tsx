"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Wifi, Tv, GraduationCap, Phone, CreditCard, Gift, Shield, Zap, Trophy, Download, Search, X } from 'lucide-react';
import { ServiceModal } from '@/components/ServiceModal';
import VirtualNumberModal from '@/components/VirtualNumberModal';
import GiftCardModal from '@/components/GiftCardModal';

// Enhanced Service Definitions with Categories and Deep Link Support
const ALL_SERVICES = [
    // Utilities
    { id: 'airtime', name: 'Airtime', category: 'Utilities', icon: Smartphone, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', isAvailable: true },
    { id: 'data', name: 'Data Bundles', category: 'Utilities', icon: Wifi, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', isAvailable: true },
    { id: 'cable', name: 'Cable TV', category: 'Utilities', icon: Tv, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', isAvailable: true },
    { id: 'electricity', name: 'Electricity', category: 'Utilities', icon: Zap, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', isAvailable: true },

    // Education (Direct Links)
    { id: 'education_waec', name: 'WAEC Result', category: 'Education', icon: GraduationCap, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', isAvailable: true, parentId: 'education', initialState: { provider: 'WAEC' } },
    { id: 'education_neco', name: 'NECO Token', category: 'Education', icon: GraduationCap, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', isAvailable: true, parentId: 'education', initialState: { provider: 'NECO' } },
    { id: 'education_jamb', name: 'JAMB PIN', category: 'Education', icon: GraduationCap, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', isAvailable: true, parentId: 'education', initialState: { provider: 'JAMB' } },
    { id: 'education_nabteb', name: 'NABTEB Result', category: 'Education', icon: GraduationCap, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', isAvailable: true, parentId: 'education', initialState: { provider: 'NABTEB' } },

    // Fintech & Lifestyle
    { id: 'betting', name: 'Betting', category: 'Lifestyle', icon: Trophy, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', isAvailable: true },
    { id: 'software', name: 'Software', category: 'Lifestyle', icon: Download, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', isAvailable: true },
    { id: 'virtual_number', name: 'Virtual Lines', category: 'Fintech', icon: Phone, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', isAvailable: false },
    { id: 'gift_cards', name: 'Gift Cards', category: 'Fintech', icon: Gift, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400', isAvailable: true },
    { id: 'virtual_cards', name: 'USD Cards', category: 'Fintech', icon: CreditCard, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400', isAvailable: false },
    { id: 'insurance', name: 'Insurance', category: 'Fintech', icon: Shield, color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', isAvailable: false },
];

const CATEGORIES = ['All', 'Utilities', 'Education', 'Fintech', 'Lifestyle'];

export default function ServicesPage() {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [modalInitialState, setModalInitialState] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Filter Logic
    const filteredServices = ALL_SERVICES.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleServiceClick = (service: any) => {
        if (!service.isAvailable) return;

        if (service.category === 'Education') {
            const provider = service.initialState?.provider;
            router.push(provider ? `/products/education?provider=${provider}` : '/products/education');
            return;
        }

        if (service.id === 'software') {
            router.push('/products/software');
            return;
        }

        if (service.id === 'betting') {
            router.push('/products/betting');
            return;
        }

        if (service.id === 'airtime' || service.id === 'data') {
            router.push('/products/airtime-data');
            return;
        }

        if (service.id === 'electricity') {
            router.push('/products/bill-payment?type=electricity');
            return;
        }

        if (service.id === 'cable') {
            router.push('/products/bill-payment?type=cable');
            return;
        }

        // If it's a direct link (like WAEC), open the parent modal (Education) with initial state
        if (service.parentId) {
            setActiveModal(service.parentId);
            setModalInitialState(service.initialState);
        } else {
            setActiveModal(service.id);
            setModalInitialState(null);
        }
    };

    // Helper to get logic-driving service object (resolves parent if needed)
    const getActiveServiceDefinition = () => {
        const service = ALL_SERVICES.find(s => s.id === activeModal);
        // If we opened a parent modal directly (e.g. from a previous impl), handled here.
        // But mostly we use 'activeModal' which is now either 'airtime' etc or 'education'
        // We need to return a bare-bones object compliant with ServiceModal expectations
        if (!service) {
            // Fallback for parent IDs that might not be in the list directly nicely, 
            // though 'education' itself isn't in the list above as a standalone generic item 
            // but 'education_waec' points to 'education'. 
            // We need to support the generic 'education' case if linked from elsewhere?
            // For this page, we only click items in list.

            // Special handling: The ServiceModal expects a 'title' to decide logic.
            // ID: 'education' -> Title: 'Education'
            const titleMap: Record<string, string> = {
                'education': 'Education',
                'airtime': 'Airtime',
                'data': 'Data Bundles',
                'cable': 'Cable TV',
                'electricity': 'Electricity',
                'betting': 'Betting',
                'software': 'Software'
            };
            return { title: titleMap[activeModal!] || activeModal };
        }
        return { title: service.name };
    };

    const UNIFIED_SERVICES = ['airtime', 'data', 'cable', 'electricity', 'betting', 'software', 'education'];

    return (
        <div className="pb-24 pt-4 px-4 md:p-8 md:pb-8 max-w-7xl mx-auto">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredServices.map((service) => (
                        <button
                            key={service.id}
                            disabled={!service.isAvailable}
                            onClick={() => handleServiceClick(service)}
                            className={`group p-4 md:p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 text-left flex flex-col items-start ${!service.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${service.color}`}>
                                <service.icon className="w-6 h-6 md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1 leading-tight">{service.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{service.isAvailable ? service.category : 'Coming Soon'}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No services found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter</p>
                </div>
            )}

            {/* Unified Modal */}
            {activeModal && UNIFIED_SERVICES.includes(activeModal) && (
                <ServiceModal
                    service={getActiveServiceDefinition()}
                    initialState={modalInitialState}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {/* Specialized Modals */}
            <VirtualNumberModal isOpen={activeModal === 'virtual_number'} onClose={() => setActiveModal(null)} />
            <GiftCardModal isOpen={activeModal === 'gift_cards'} onClose={() => setActiveModal(null)} />
        </div>
    );
}
