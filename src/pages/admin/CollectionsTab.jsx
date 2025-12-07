import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, X, FolderOpen, Package } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_ADMIN || 'http://localhost:8787/admin';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

const getAuthToken = () => localStorage.getItem('adminToken');

const collectionAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/collections`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
  create: async (data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  update: async (slug, data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/collections/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  delete: async (slug) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/collections/${slug}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const productAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

export default function CollectionsTab() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    productIds: [],
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collectionsData, productsData] = await Promise.all([
        collectionAPI.getAll(),
        productAPI.getAll(),
      ]);
      setCollections(collectionsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };
/* ---------- update ---------- */
const handleSubmit = async () => {
  if (!formData.name || !formData.slug) return;
  try {
    if (editingCollection) {
      await collectionAPI.update(editingCollection.slug, formData); // ← slug
    } else {
      await collectionAPI.create(formData);
    }
    fetchData();
    handleCloseModal();
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
};

/* ---------- delete ---------- */
const handleDelete = async () => {
  if (!editingCollection) return;
  if (!confirm('Delete this collection?')) return;
  try {
    const res = await collectionAPI.delete(editingCollection.slug); // ← slug
    console.log(res.message);          // "Collection deleted"
    fetchData();
    handleCloseModal();
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
};

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      imageUrl: collection.imageUrl || "",
      productIds: collection.productIds || [],
      sortOrder: collection.sortOrder || 0,
      isActive: collection.isActive ?? true
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCollection(null);
    setProductSearchTerm("");
    setFormData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      productIds: [],
      sortOrder: 0,
      isActive: true,
    });
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const getProductsForCollection = (productIds) => {
    return products.filter(p => productIds.includes(p.id));
  };

  return (
    <div className="h-full w-auto bg-transparent">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 sm:p-3 rounded-lg">
                <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Collections
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">Organize products into collections</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base touch-manipulation"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Add Collection</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Collections Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-purple-500" />
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="bg-slate-800 rounded-lg shadow-lg p-8 sm:p-12 text-center border border-slate-700 mx-auto max-w-md">
              <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-base sm:text-lg">No collections found</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Start by creating your first collection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredCollections.map((collection) => {
                const collectionProducts = getProductsForCollection(collection.productIds || []);
                return (
                  <div key={collection.id} className="bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-slate-700 overflow-hidden hover:border-slate-600">
                    <div className="bg-slate-700/50 p-4 sm:p-6 relative">
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleEdit(collection)}
                          className="bg-slate-800 p-2 rounded-lg shadow-sm hover:bg-purple-600 active:bg-purple-700 transition-colors border border-slate-600 touch-manipulation"
                        >
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(collection.id)}
                          className="bg-slate-800 p-2 rounded-lg shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors border border-slate-600 touch-manipulation"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center h-16 sm:h-20 lg:h-24">
                        {collection.imageUrl ? (
                          <img src={collection.imageUrl} alt={collection.name} className="h-full w-auto object-contain" />
                        ) : (
                          <FolderOpen className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-purple-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4 lg:p-5">
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white line-clamp-2 flex-1">{collection.name}</h3>
                        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          collection.isActive 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-slate-600/50 text-slate-400 border border-slate-600'
                        }`}>
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {collection.description && (
                        <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="text-slate-400">
                          <span className="font-mono text-xs bg-slate-700 text-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-600 inline-block">
                            {collection.slug}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-700">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                            <span className="text-xs text-slate-500">Products</span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-purple-400">
                            {collectionProducts.length}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs text-slate-500">Sort Order</span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-300">
                            {collection.sortOrder || 0}
                          </span>
                        </div>
                      </div>

                      {collectionProducts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-2">Sample Products:</p>
                          <div className="flex gap-1.5 overflow-x-auto">
                            {collectionProducts.slice(0, 4).map(product => (
                              <div key={product.id} className="flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border border-slate-600"
                                  />
                                ) : (
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-slate-500" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-slate-800 rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-t sm:border border-slate-700 animate-slide-up sm:animate-none">
              <div className="bg-purple-600 p-4 sm:p-6 text-white flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {editingCollection ? 'Edit Collection' : 'Add Collection'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="hover:bg-purple-700 active:bg-purple-800 p-2 rounded-lg transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-160px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingCollection ? formData.slug : generateSlug(e.target.value)
                      })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                    placeholder="Optional description for this collection"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded border border-slate-600"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center gap-2 pb-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500/20 bg-slate-700 border-slate-600"
                      />
                      <label htmlFor="isActive" className="text-xs sm:text-sm font-medium text-slate-300">Active</label>
                    </div>
                  </div>
                </div>

                {/* Products Selection */}
                <div className="border-t border-slate-700 pt-4">
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-3">
                    Select Products ({formData.productIds.length} selected)
                  </label>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto bg-slate-900/50 rounded-lg border border-slate-700 p-2">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No products found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredProducts.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.productIds.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500/20 bg-slate-700 border-slate-600"
                            />
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded border border-slate-600"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{product.name}</p>
                              <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                            </div>
                            <span className="text-xs text-slate-500">₹{product.pricing?.basePrice?.toLocaleString() || 0}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-700">
                  <button
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-slate-600 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors text-slate-300 font-medium text-sm sm:text-base touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.slug}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {editingCollection ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}