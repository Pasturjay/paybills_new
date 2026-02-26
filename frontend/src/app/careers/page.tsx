import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Briefcase, Rocket, Heart, Globe, ArrowRight } from "lucide-react";

export default function Careers() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-20 bg-blue-50/50">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Join the Revolution</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We are building the future of payments in Africa. Come build with us.
                    </p>
                </div>
            </section>

            {/* Why Join Us */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Join Paybills?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <Rocket className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation First</h3>
                            <p className="text-gray-500">
                                Work on cutting-edge digital platforms. We are not just following trends; we are setting them.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Impactful Work</h3>
                            <p className="text-gray-500">
                                Your code will be used by millions of people to manage their daily digital lives.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Remote-Friendly</h3>
                            <p className="text-gray-500">
                                We believe talent is universal. Work from anywhere in the world with our remote-first culture.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Open Positions</h2>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {[
                            { title: "Senior Frontend Engineer", dept: "Engineering", loc: "Remote" },
                            { title: "Product Designer", dept: "Design", loc: "Lagos, Nigeria" },
                            { title: "Customer Success Lead", dept: "Operations", loc: "Remote" },
                            { title: "Backend Developer (Node.js)", dept: "Engineering", loc: "Remote" }
                        ].map((job, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        <span>{job.dept}</span>
                                        <span>•</span>
                                        <span>{job.loc}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600" />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">Don&apos;t see your role?</p>
                        <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Submit General Application
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
