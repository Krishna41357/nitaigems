import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2,Upload, Search, Loader2, X, Package, Tag, Image as ImageIcon } from "lucide-react";
import ExcelBulkUpload from "./ExcelBulkUpload";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_ADMIN || 'http://localhost:8787/admin';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

const getAuthToken = () => localStorage.getItem('adminToken');

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
  create: async (data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  update: async (id, data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const categoryAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const subcategoryAPI = {
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return handleResponse(response);
  },
};

const initialFormData = {
  name: "",
  slug: "",
  categorySlug: "",
  subCategorySlug: "",
  sku: "",
  pricing: {
    basePrice: 0,
    discountedPrice: 0,
    couponApplicable: false,
    couponList: [],
  },
  necklaceLayers: [],
  details: {
    metal: "",
    metalPurity: "",
    stone: "",
    stoneType: "",
    weight: 0,
    stoneWeight: 0,
    metalWeight: 0,
    size: "",
    color: "",
    clarity: "",
    certification: "",
  },
  images: [],
  tags: [],
  inventory: {
    stock: 0,
    inStock: true,
  },
  isActive: true,
};

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [newLayerNumber, setNewLayerNumber] = useState("");

  const [formData, setFormData] = useState(initialFormData);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.categorySlug) {
      const filtered = subcategories.filter(
        (sub) => sub.categorySlug === formData.categorySlug
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categorySlug, subcategories]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsData, catsData, subcatsData] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        subcategoryAPI.getAll(),
      ]);
      setProducts(productsData);
      setCategories(catsData);
      setSubcategories(subcatsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.categorySlug || !formData.sku) {
      setError("Please fill in all required fields");
      return;
    }

    //validate layers price
      if (formData.necklaceLayers.length > 0) {
    const invalidLayers = formData.necklaceLayers.filter(l => !l.price || l.price <= 0);
    if (invalidLayers.length > 0) {
      setError("All necklace layers must have a price greater than 0");
      return;
    }
  }
    
    setError("");
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, formData);
      } else {
        await productAPI.create(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setError("");
    try {
      await productAPI.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      categorySlug: product.categorySlug || "",
      subCategorySlug: product.subCategorySlug || "",
      sku: product.sku || "",
      pricing: {
        basePrice: product.pricing?.basePrice || 0,
        discountedPrice: product.pricing?.discountedPrice || 0,
        couponApplicable: product.pricing?.couponApplicable ?? false,
        couponList: product.pricing?.couponList || [],
      },
      necklaceLayers: product.necklaceLayers || [],
      details: {
        metal: product.details?.metal || "",
        metalPurity: product.details?.metalPurity || "",
        stone: product.details?.stone || "",
        stoneType: product.details?.stoneType || "",
        weight: product.details?.weight || 0,
        stoneWeight: product.details?.stoneWeight || 0,
        metalWeight: product.details?.metalWeight || 0,
        size: product.details?.size || "",
        color: product.details?.color || "",
        clarity: product.details?.clarity || "",
        certification: product.details?.certification || "",
      },
      images: product.images || [],
      tags: product.tags || [],
      inventory: {
        stock: product.inventory?.stock || 0,
        inStock: product.inventory?.inStock ?? true,
      },
      isActive: product.isActive ?? true
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setError("");
    setCurrentImageUrl("");
    setCurrentTag("");
    setNewLayerNumber("");
  };

  const addImage = () => {
    if (currentImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, currentImageUrl.trim()]
      });
      setCurrentImageUrl("");
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (slug) => {
    return categories.find(c => c.slug === slug)?.name || slug;
  };

  const getSubcategoryName = (slug) => {
    return subcategories.find(s => s.slug === slug)?.name || slug;
  };

  return (
    <div className="h-full w-auto bg-transparent">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 sm:p-3 rounded-lg">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  Products
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">Manage your product inventory</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base touch-manipulation"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Add Product</span>
              <span className="xs:hidden">Add</span>
            </button>
            <button
  onClick={() => setShowBulkUpload(true)}
  className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base touch-manipulation"
>
  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
  <span className="hidden xs:inline">Bulk Upload</span>
  <span className="xs:hidden">Upload</span>
</button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Products Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-slate-800 rounded-lg shadow-lg p-8 sm:p-12 text-center border border-slate-700 mx-auto max-w-md">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-base sm:text-lg">No products found</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">Start by adding your first product</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-slate-700 overflow-hidden hover:border-slate-600">
                  <div className="bg-slate-700/50 p-4 sm:p-6 relative">
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-slate-800 p-2 rounded-lg shadow-sm hover:bg-blue-600 active:bg-blue-700 transition-colors border border-slate-600 touch-manipulation"
                      >
                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-slate-800 p-2 rounded-lg shadow-sm hover:bg-red-600 active:bg-red-700 transition-colors border border-slate-600 touch-manipulation"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center h-16 sm:h-20 lg:h-24">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="h-full w-auto object-contain" />
                      ) : (
                        <Package className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-blue-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 lg:p-5">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white line-clamp-2 flex-1">{product.name}</h3>
                      <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        product.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-slate-600/50 text-slate-400 border border-slate-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="text-slate-400">
                        <span className="font-mono text-xs bg-slate-700 text-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-600 inline-block">SKU: {product.sku}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400">
                        <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-medium truncate">{getCategoryName(product.categorySlug)}</span>
                      </div>

                      {product.subCategorySlug && (
                        <div className="text-slate-500 text-xs pl-6">
                          → {getSubcategoryName(product.subCategorySlug)}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-700">
                        <span className="text-xs text-slate-500">Price</span>
                        <span className="text-xs sm:text-sm font-semibold text-green-400">₹{product.pricing?.basePrice?.toLocaleString() || 0}</span>
                      </div>

                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs text-slate-500">Stock</span>
                        <span className={`text-xs sm:text-sm font-semibold ${product.inventory?.stock > 0 ? 'text-slate-300' : 'text-red-400'}`}>
                          {product.inventory?.stock || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-slate-800 rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-t sm:border border-slate-700 animate-slide-up sm:animate-none">
              <div className="bg-blue-600 p-4 sm:p-6 text-white flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="hover:bg-blue-700 active:bg-blue-800 p-2 rounded-lg transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-160px)]">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Basic Information</h3>
                  
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
                          slug: editingProduct ? formData.slug : generateSlug(e.target.value)
                        })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">SKU *</label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Category *</label>
                      <select
                        required
                        value={formData.categorySlug}
                        onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value, subCategorySlug: "" })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Subcategory</label>
                      <select
                        value={formData.subCategorySlug}
                        onChange={(e) => setFormData({ ...formData, subCategorySlug: e.target.value })}
                        disabled={!formData.categorySlug}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-50"
                      >
                        <option value="">Select subcategory</option>
                        {filteredSubcategories.map((sub) => (
                          <option key={sub.id} value={sub.slug}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Pricing</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Selling Price (Final) *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        placeholder="Enter selling price"
                        value={formData.pricing.discountedPrice || ""}
                        onChange={(e) => {
                          const sellingPrice = parseFloat(e.target.value) || 0;
                          const discountPercent = formData.pricing.discountPercent || 0;
                          const basePrice = discountPercent > 0 
                            ? sellingPrice / (1 - discountPercent / 100)
                            : sellingPrice;
                          
                          setFormData({ 
                            ...formData, 
                            pricing: { 
                              ...formData.pricing, 
                              discountedPrice: sellingPrice,
                              basePrice: Math.round(basePrice * 100) / 100
                            } 
                          });
                        }}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        step="0.1"
                        placeholder="e.g., 20 for 20% off"
                        value={formData.pricing.discountPercent || ""}
                        onChange={(e) => {
                          const discountPercent = parseFloat(e.target.value) || 0;
                          const sellingPrice = formData.pricing.discountedPrice || 0;
                          const basePrice = discountPercent > 0 && sellingPrice > 0
                            ? sellingPrice / (1 - discountPercent / 100)
                            : sellingPrice;
                          
                          setFormData({ 
                            ...formData, 
                            pricing: { 
                              ...formData.pricing, 
                              discountPercent,
                              basePrice: Math.round(basePrice * 100) / 100
                            } 
                          });
                        }}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {formData.pricing.discountPercent > 0 && formData.pricing.discountedPrice > 0 && (
                    <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
                      <p className="text-sm text-slate-300">
                        <span className="text-slate-400">Original Price:</span> 
                        <span className="font-semibold text-white ml-2">₹{formData.pricing.basePrice.toFixed(2)}</span>
                        <span className="text-green-400 ml-3">({formData.pricing.discountPercent}% off)</span>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="couponApplicable"
                      checked={formData.pricing.couponApplicable}
                      onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, couponApplicable: e.target.checked } })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20 bg-slate-700 border-slate-600"
                    />
                    <label htmlFor="couponApplicable" className="text-xs sm:text-sm font-medium text-slate-300">Coupon Applicable</label>
                  </div>
                </div>

                {/* Necklace Layers with Pricing */}
               <div className="space-y-4">
  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Necklace Layer Pricing</h3>
  
  <div className="space-y-3">
    <p className="text-xs text-slate-400">Configure different prices for each layer option. Leave empty if not a necklace product.</p>
    
    {/* Add new layer input */}
    <div className="flex gap-2">
      <input
        type="number"
        min="1"
        placeholder="Layer number (e.g., 1, 3, 5, 15)"
        value={newLayerNumber}
        onChange={(e) => setNewLayerNumber(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && newLayerNumber) {
            e.preventDefault();
            const layerNum = parseInt(newLayerNumber);
            if (layerNum > 0 && !formData.necklaceLayers.find(l => l.layer === `${layerNum}-layer`)) {
              setFormData({
                ...formData,
                necklaceLayers: [...formData.necklaceLayers, { layer: `${layerNum}-layer`, price: 0 }]
              });
              setNewLayerNumber("");
            }
          }
        }}
        className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        aria-label="Necklace layer number"
      />
      <button
        type="button"
        onClick={() => {
          if (newLayerNumber) {
            const layerNum = parseInt(newLayerNumber);
            if (layerNum > 0 && !formData.necklaceLayers.find(l => l.layer === `${layerNum}-layer`)) {
              setFormData({
                ...formData,
                necklaceLayers: [...formData.necklaceLayers, { layer: `${layerNum}-layer`, price: 0 }]
              });
              setNewLayerNumber("");
            }
          }
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg text-white font-medium transition-colors"
        aria-label="Add layer"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
    
    {/* Existing layers */}
    {formData.necklaceLayers.length > 0 && (
      <div className="space-y-2">
        {[...formData.necklaceLayers]
          .sort((a, b) => parseInt(a.layer) - parseInt(b.layer))
          .map((layer) => {
            const layerNum = parseInt(layer.layer.replace('-layer', ''));
            return (
              <div key={layer.layer} className="flex items-center gap-3 bg-slate-700/30 p-3 rounded-lg">
                <span className="text-sm font-medium text-slate-300 w-20 flex-shrink-0">
                  {layerNum} Layer{layerNum > 1 ? 's' : ''}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={layer.price || ''}
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      necklaceLayers: formData.necklaceLayers.map(l => 
                        l.layer === layer.layer ? { ...l, price: newPrice } : l
                      )
                    });
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  aria-label={`Price for ${layerNum} layer${layerNum > 1 ? 's' : ''}`}
                />
                <span className="text-slate-400 text-sm flex-shrink-0">₹</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      necklaceLayers: formData.necklaceLayers.filter(l => l.layer !== layer.layer)
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 p-2 rounded-lg transition-colors flex-shrink-0"
                  aria-label={`Remove ${layerNum} layer${layerNum > 1 ? 's' : ''}`}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
      </div>
    )}
  </div>
  
  {formData.necklaceLayers.length > 0 && (
    <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
      <p className="text-xs text-blue-400">
        <strong>Active Layers ({formData.necklaceLayers.length}):</strong> {[...formData.necklaceLayers]
          .sort((a, b) => parseInt(a.layer) - parseInt(b.layer))
          .map(l => {
            const num = parseInt(l.layer.replace('-layer', ''));
            return `${num} Layer${num > 1 ? 's' : ''}`;
          })
          .join(', ')}
      </p>
    </div>
  )}
</div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Product Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Metal</label>
                      <input
                        type="text"
                        value={formData.details.metal}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, metal: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Metal Purity</label>
                      <input
                        type="text"
                        value={formData.details.metalPurity}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, metalPurity: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Stone</label>
                      <input
                        type="text"
                        value={formData.details.stone}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, stone: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Stone Type</label>
                      <input
                        type="text"
                        value={formData.details.stoneType}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, stoneType: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Weight (g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.details.weight}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, weight: parseFloat(e.target.value) || 0 } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Stone Weight (g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.details.stoneWeight}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, stoneWeight: parseFloat(e.target.value) || 0 } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Metal Weight (g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.details.metalWeight}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, metalWeight: parseFloat(e.target.value) || 0 } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Size</label>
                      <input
                        type="text"
                        value={formData.details.size}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, size: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Color</label>
                      <input
                        type="text"
                        value={formData.details.color}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, color: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Clarity</label>
                      <input
                        type="text"
                        value={formData.details.clarity}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, clarity: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Certification</label>
                      <input
                        type="text"
                        value={formData.details.certification}
                        onChange={(e) => setFormData({ ...formData, details: { ...formData.details, certification: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Images</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      value={currentImageUrl}
                      onChange={(e) => setCurrentImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Tags</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-600/20 border border-blue-600/30 rounded-full text-sm text-blue-400 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Inventory</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.inventory.stock}
                        onChange={(e) => setFormData({ ...formData, inventory: { ...formData.inventory, stock: parseInt(e.target.value) || 0 } })}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="inStock"
                          checked={formData.inventory.inStock}
                          onChange={(e) => setFormData({ ...formData, inventory: { ...formData.inventory, inStock: e.target.checked } })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20 bg-slate-700 border-slate-600"
                        />
                        <label htmlFor="inStock" className="text-xs sm:text-sm font-medium text-slate-300">In Stock</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20 bg-slate-700 border-slate-600"
                  />
                  <label htmlFor="isActive" className="text-xs sm:text-sm font-medium text-slate-300">Active Product</label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-700 sticky bottom-0 bg-slate-800 pb-4">
                  <button
                    onClick={handleCloseModal}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-slate-600 rounded-lg hover:bg-slate-700 active:bg-slate-600 transition-colors text-slate-300 font-medium text-sm sm:text-base touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.categorySlug || !formData.name || !formData.slug || !formData.sku}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors font-medium shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showBulkUpload && (
  <ExcelBulkUpload
    onClose={() => setShowBulkUpload(false)}
    onSuccess={() => {
      setShowBulkUpload(false);
      fetchData(); // Refresh products list
    }}
  />
)}
    </div>

  );
}