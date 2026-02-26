"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plus, Upload, Edit, Trash2, Search, Menu } from "lucide-react";
import { generateSoftwareProducts } from "@/data/software";
import { useState } from "react";

const initialProducts = generateSoftwareProducts(20); // Show first 20 for admin

export default function AdminSoftware() {
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Navbar />

            {/* Header */}
            <div className="pt-24 pb-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Manager</h1>
                        <p className="text-gray-500">Manage software inventory and licenses.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50">
                            <Upload className="w-4 h-4" /> Bulk Upload CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Filters */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-lg outline-none text-sm"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        Total Stock: <span className="font-bold text-gray-900 dark:text-white">5,420</span> Keys
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                        <div className="text-xs text-gray-400">{product.brand}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 relative">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs hidden md:inline-block">{product.category}</span>

                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                            className="inline-flex md:hidden items-center justify-center p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            aria-expanded={openMenuId === product.id}
                                            aria-label="Open category"
                                        >
                                            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                        </button>

                                        {openMenuId === product.id && (
                                            <div className="absolute left-3 top-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded shadow-md z-10 p-2 text-sm">
                                                {product.category}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-sm">₦{product.price.toLocaleString()}</td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[80%]"></div>
                                            </div>
                                            <span className="text-xs text-gray-500">High</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-blue-600">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </main>
    );
}
