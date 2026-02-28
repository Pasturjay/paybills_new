"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plus, Upload, Edit, Trash2, Search, Menu, X, Check, Activity, BarChart3, Clock, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { SoftwareProduct } from "@/types/software";

export default function AdminSoftware() {
    const [products, setProducts] = useState<SoftwareProduct[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [totalStock, setTotalStock] = useState(0);

    // Editing State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<SoftwareProduct | null>(null);

    // API Info State
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products/software?admin=true&limit=1000');
            setProducts(res.products);
            setTotalStock(res.products.length); // Simplified for now since stock = -1 by default
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load software inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

        try {
            await api.delete(`/products/software/${id}`);
            toast.success(`${name} deactivated`);
            fetchProducts();
        } catch (error) {
            toast.error("Failed to remove product");
        }
    };

    const openEditModal = (product: SoftwareProduct) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            await api.put(`/products/software/${editingProduct.id}`, {
                name: editingProduct.name,
                price: parseFloat(editingProduct.price.toString()),
                originalPrice: parseFloat(editingProduct.originalPrice.toString()),
                isActive: editingProduct.isActive,
                category: editingProduct.category,
                brand: editingProduct.brand
            });
            toast.success("Successfully updated product");
            setIsEditModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            <Navbar />

            {/* Header */}
            <div className="pt-24 pb-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Software Inventory</h1>
                        <p className="text-gray-500 font-medium tracking-wide">Manage global software licenses and API integrations.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setIsApiModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 border-2 border-dashed border-gray-300 dark:border-zinc-700 font-bold text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-blue-500 transition-all"
                        >
                            <Upload className="w-4 h-4" /> API Import
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all">
                            <Plus className="w-5 h-5" /> Add Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Catalog</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalStock.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Licenses</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{products.filter(p => p.isActive).length.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">System Health</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span> Online
                            </h3>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-2xl flex items-center justify-center shadow-inner">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-6 flex items-center">
                    <div className="relative w-full flex items-center">
                        <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Find a product (e.g. Windows 11)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white font-medium"
                        />
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 font-bold">Synchronizing Database...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-gray-900 dark:text-white">No software products found.</p>
                            <p className="text-sm">Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="p-5 w-[35%]">Product Name</th>
                                        <th className="p-5">Category</th>
                                        <th className="p-5">Price (NGN)</th>
                                        <th className="p-5 text-center">Sales</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-blue-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                            <td className="p-5">
                                                <div className="font-bold text-gray-900 dark:text-white tracking-tight">{product.name}</div>
                                                <div className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">{product.brand}</div>
                                            </td>
                                            <td className="p-5">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold rounded-lg text-xs">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="p-5 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                ₦{Number(product.price).toLocaleString()}
                                            </td>
                                            <td className="p-5 text-center font-bold text-gray-500">
                                                {product.sales}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${product.isActive ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                                                    {product.isActive ? (
                                                        <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active</>
                                                    ) : (
                                                        <><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex gap-2 justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(product)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-xl text-blue-600 transition-all flex items-center justify-center">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id, product.name)} className="p-2 hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-xl text-red-600 transition-all flex items-center justify-center">
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

            {/* Edit Modal */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Product</h2>
                                <p className="text-sm font-medium text-gray-500">{editingProduct.id.split('-')[0]}...</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 font-bold transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sale Price (₦)</label>
                                    <input
                                        type="number"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 font-bold font-mono transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Original Price</label>
                                    <input
                                        type="number"
                                        value={editingProduct.originalPrice}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 font-bold font-mono transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={editingProduct.brand}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 font-bold transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status</label>
                                    <select
                                        value={editingProduct.isActive.toString()}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.value === 'true' })}
                                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-blue-500 font-bold transition-colors appearance-none"
                                    >
                                        <option value="true">Active & Visible</option>
                                        <option value="false">Hidden (Inactive)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                                <Check className="w-5 h-5" /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* API Docs Modal */}
            {isApiModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-2xl border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-500" /> API Bulk Upload Specs
                                </h2>
                                <p className="text-sm font-medium text-gray-500">Automate your inventory directly from your suppliers.</p>
                            </div>
                            <button onClick={() => setIsApiModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-[#09090b]">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 font-mono text-sm tracking-tight border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 w-fit rounded-lg shadow-sm">
                                        <span className="text-blue-600 font-black mr-2">POST</span>/api/products/software/bulk-upload
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        To programmatically push new software products into the live database, send a POST request to this endpoint with your Admin Bearer Token and a JSON payload containing an array of <code className="bg-gray-200 dark:bg-zinc-800 px-1 rounded text-xs">products</code>.
                                    </p>
                                </div>

                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-gray-800">
                                    <pre className="text-sm text-green-400 font-mono leading-relaxed">
                                        {`{
  "products": [
    {
      "name": "Adobe Photoshop 2024",
      "description": "Full perpetual license.",
      "category": "Creative",
      "brand": "Adobe",
      "price": 35000,
      "originalPrice": 80000,
      "platform": ["Windows", "Mac"],
      "licenseType": "Lifetime",
      "image": "/images/adobe.png"
    }
  ]
}`}
                                    </pre>
                                </div>

                                <div className="flex bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl items-start gap-4 border border-blue-100 dark:border-blue-900/50">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shrink-0">
                                        <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100 tracking-tight">Requires Admin Authentication</h4>
                                        <p className="text-sm text-blue-800/80 dark:text-blue-200/80 font-medium. mt-1 leading-relaxed">Ensure your request includes an <code className="font-bold">Authorization: Bearer {'<your_admin_token>'}</code> header. The system will automatically skip creating exact duplicate names to prevent clutter.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </main>
    );
}
