"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, User, ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { SkeletonLoader } from "@/components/ui/Skeleton";

export default function BlogListing() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/blog').then(res => {
            setPosts(res.posts || []);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    // Helper: fake reading time based on excerpt/title length
    const getReadingTime = (post: any) => Math.max(1, Math.ceil(((post.content || post.excerpt || "").length) / 1000));

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] pb-20 overflow-x-hidden">
            <Navbar />

            {/* ── Hero ── */}
            <div className="pt-32 pb-16 px-6 container mx-auto">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                        <BookOpen className="w-3.5 h-3.5" /> Official Blog
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                        Insights, Updates & <br /> <span className="text-gradient-blue">Digital Growth.</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl font-medium">
                        Latest news, product updates, and comprehensive guides to navigate the digital services landscape in Nigeria.
                    </p>
                </div>
            </div>

            {/* ── Posts Grid ── */}
            <div className="container mx-auto px-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="space-y-4">
                                <SkeletonLoader type="card" />
                                <SkeletonLoader type="input" />
                                <SkeletonLoader type="input" />
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-gray-100 dark:border-white/5">
                        <BookOpen className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Articles Yet</h2>
                        <p className="text-gray-500">We are brewing up some great content. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, idx) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group shine flex flex-col bg-white dark:bg-zinc-900/80 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
                                {/* Cover Image */}
                                <div className="relative h-56 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                                    {post.coverImage ? (
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-zinc-700 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-zinc-800 dark:to-zinc-900">
                                            <BookOpen className="w-12 h-12 mb-2" />
                                            <span className="font-bold uppercase tracking-widest text-xs">Paybills</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm">
                                        {post.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {getReadingTime(post)}m read</div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-gray-400">
                                            <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
