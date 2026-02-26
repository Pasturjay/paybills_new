import Link from 'next/link';
import { Zap, Smartphone, Tv, Wifi, GraduationCap, Dice5 } from 'lucide-react';

export function Hero() {
    const services = [
        { name: 'Electricity', icon: <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-red-500', href: '#' },
        { name: 'Airtime', icon: <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-green-500', href: '#' },
        { name: 'Cable TV', icon: <Tv className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-slate-600', href: '#' },
        { name: 'Internet', icon: <Wifi className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-red-500', href: '#' },
        { name: 'Education', icon: <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-green-500', href: '#' },
        { name: 'Betting', icon: <Dice5 className="w-8 h-8 md:w-10 md:h-10 text-white" />, color: 'bg-blue-500', href: '#' },
    ];

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center justify-center text-center">

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                        Power Up Your <span className="text-[#FF6600]">Digital</span> <span className="text-[#00A859]">Life!</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-16 font-medium">
                        <span className="text-[#FF6600]">easy</span>
                        <span className="text-gray-400 mx-1">...</span>
                        <span className="text-[#00A859]">reliable</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">digital services</span>
                    </p>

                    {/* Service Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                        {services.map((service, index) => (
                            <Link key={index} href={service.href} className={`
                group relative overflow-hidden rounded-2xl p-6 md:p-8 
                ${service.color} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                flex items-center gap-6 md:gap-8
              `}>
                                {/* Icon Container with subtle glass effect */}
                                <div className="relative z-10">
                                    {service.icon}
                                </div>

                                {/* Text */}
                                <span className="relative z-10 text-xl md:text-2xl font-bold text-white tracking-wide">
                                    {service.name}
                                </span>

                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
