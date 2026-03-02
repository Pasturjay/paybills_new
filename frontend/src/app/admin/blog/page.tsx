"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plus, Edit, Trash2, Search, Check, FileText, Image as ImageIcon, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminBlog() {
    const [posts, setPosts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit/Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "", title: "", excerpt: "", content: "",
        category: "General", status: "DRAFT",
        coverImage: "", authorName: "Paybills Team", tags: ""
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/blog?admin=true&limit=100');
            setPosts(res.posts || []);
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
            toast.error("Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/blog/${id}`);
            toast.success(`Post deleted`);
            fetchPosts();
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({
            id: "", title: "", excerpt: "", content: "",
            category: "General", status: "PUBLISHED",
            coverImage: "", authorName: "Paybills Team", tags: ""
        });
        setIsModalOpen(true);
    };

    const openEditModal = (post: any) => {
        setIsEditing(true);
        setFormData({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content || "",
            category: post.category,
            status: post.status,
            coverImage: post.coverImage || "",
            authorName: post.authorName,
            tags: post.tags?.join(", ") || ""
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
            };

            if (isEditing) {
                // Fetch full content first if it's missing (since the list API might only return excerpt)
                if (!payload.content) {
                    const fullPost = await api.get(`/blog/${posts.find(p => p.id === payload.id)?.slug}`);
                    payload.content = fullPost.post.content;
                }
                await api.put(`/admin/blog/${payload.id}`, payload);
                toast.success("Post updated");
            } else {
                await api.post(`/admin/blog`, payload);
                toast.success("Post created");
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (error) {
            toast.error("Failed to save post");
        }
    };

    // We need to fetch full content when editing a post if we don't have it
    useEffect(() => {
        if (isEditing && isModalOpen && !formData.content && formData.id) {
            const slug = posts.find(p => p.id === formData.id)?.slug;
            if (slug) {
                api.get(`/blog/${slug}`).then(res => {
                    if (res.post?.content) {
                        setFormData(prev => ({ ...prev, content: res.post.content }));
                    }
                });
            }
        }
    }, [isEditing, isModalOpen, formData.id]);


    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            <Navbar />

            {/* Header */}
            <div className="pt-24 pb-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Blog Management</h1>
                        <p className="text-gray-500 font-medium tracking-wide">Create and manage marketing content.</p>
                    </div>
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 transition-all">
                        <Plus className="w-5 h-5" /> New Post
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Search */}
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-6 flex items-center">
                    <div className="relative w-full flex items-center">
                        <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white font-medium"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 font-bold">Loading posts...</p>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-gray-900 dark:text-white">No posts found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="p-5 w-[40%]">Post Title</th>
                                        <th className="p-5">Category</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 text-center">Views</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                                    {filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-indigo-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                            <td className="p-5">
                                                <div className="font-bold text-gray-900 dark:text-white tracking-tight">{post.title}</div>
                                                <div className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold rounded-lg text-xs">
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${post.status === 'PUBLISHED' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center font-bold text-gray-500 font-mono">
                                                {post.views}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex gap-2 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(post)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-xl text-indigo-600 transition-all">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(post.id, post.title)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-xl text-red-600 transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">{isEditing ? "Edit Post" : "Create New Post"}</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Post Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-bold transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Short Excerpt</label>
                                        <textarea
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            rows={3}
                                            className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors resize-none"
                                            required
                                            placeholder="Brief summary for the preview card..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-bold transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-bold transition-colors"
                                            >
                                                <option value="PUBLISHED">Published</option>
                                                <option value="DRAFT">Draft</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cover Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                value={formData.coverImage}
                                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tags (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-bold transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="h-full flex flex-col">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Markdown Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full flex-1 min-h-[400px] p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 font-mono text-sm transition-colors resize-none"
                                        placeholder="# Start writing..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 shrink-0">
                                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                                    <Check className="w-5 h-5" /> Save Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
