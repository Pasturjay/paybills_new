"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, User, Eye, BookOpen, Clock, Tag, ArrowLeft, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPost({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/blog/${params.slug}`).then(res => {
            setPost(res.post);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [params.slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] pb-20 overflow-x-hidden">
                <Navbar />
                <div className="pt-32 pb-16 px-6 container mx-auto max-w-4xl flex justify-center items-center min-h-[50vh]">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] pb-20 overflow-x-hidden">
                <Navbar />
                <div className="pt-32 pb-16 px-6 container mx-auto max-w-4xl min-h-[50vh] flex flex-col items-center justify-center text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Post Not Found</h1>
                    <p className="text-gray-500 mb-6">This article may have been moved or deleted.</p>
                    <Link href="/blog" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                        Back to Blog
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a14] pb-20 overflow-x-hidden">
            <Navbar />

            {/* Content Container */}
            <article className="pt-32 pb-16 px-6 container mx-auto max-w-4xl">

                {/* Back Link */}
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to all articles
                </Link>

                {/* Header Section */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs tracking-widest rounded-xl">
                            {post.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.max(1, Math.ceil((post.content?.length || 0) / 1000))} min read
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <Eye className="w-3.5 h-3.5" />
                            {post.views} views
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white tracking-tight">{post.authorName}</h4>
                                <div className="text-sm font-medium text-gray-500 tracking-wide mt-0.5">
                                    <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <button className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-xl transition-colors hidden sm:flex items-center gap-2 font-bold text-sm">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </div>
                </header>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="mb-12 rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 aspect-[2/1] relative">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-[2rem]"></div>
                    </div>
                )}

                {/* Markdown Content */}
                <div className="prose prose-lg dark:prose-invert prose-indigo max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight
                    prose-h2:text-3xl prose-h3:text-2xl 
                    prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-medium
                    prose-a:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-700
                    prose-strong:font-black prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-ul:font-medium prose-ol:font-medium
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 dark:prose-blockquote:bg-indigo-900/10 prose-blockquote:py-2 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400
                    prose-img:rounded-2xl prose-img:shadow-xl
                    prose-pre:bg-gray-900 prose-pre:rounded-2xl prose-pre:shadow-xl prose-pre:border prose-pre:border-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Tags Footer */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-zinc-800">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest text-xs">
                            <Tag className="w-4 h-4 text-indigo-500" /> Topic Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="px-4 py-2 bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer border border-gray-100 dark:border-zinc-800 shadow-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            <Footer />
        </main>
    );
}
