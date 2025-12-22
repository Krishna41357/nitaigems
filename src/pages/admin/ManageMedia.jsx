import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink, Image, Video, ShoppingCart, Eye } from 'lucide-react';

const ManageMedia = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [selectedItemPreview, setSelectedItemPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'banner',
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    mobileImageUrl: '',
    videoUrl: '',
    ctaText: '',
    ctaLink: '',
    ctaType: 'none',
    ctaSlug: '',
    duration: 45,
    orderIndex: 0,
    isActive: true
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL_ADMIN;
  const PUBLIC_API_URL = import.meta.env.VITE_APP_BASE_URL;

  useEffect(() => {
    fetchMedia();
    fetchAllProducts();
    fetchRoutes();
  }, [activeTab]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/media?type=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        setAllProducts(data.data || []);
      } else if (Array.isArray(data)) {
        setAllProducts(data);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/media/routes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchItemPreview = async (type, slug) => {
    if (!slug) {
      setSelectedItemPreview(null);
      return;
    }

    setPreviewLoading(true);

    try {
      let url = '';
      if (type === 'product') {
        // Use the /products/sku/:sku endpoint for products
        url = `${PUBLIC_API_URL}/products/sku/${slug}`;
      } else if (type === 'category') {
        url = `${PUBLIC_API_URL}/categories/${slug}`;
      } else if (type === 'subcategory') {
        url = `${PUBLIC_API_URL}/subcategories/${slug}`;
      } else if (type === 'collection') {
        url = `${PUBLIC_API_URL}/collections/${slug}`;
      }

      if (url) {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setSelectedItemPreview({
            type,
            data: data.data
          });
        } else {
          setSelectedItemPreview(null);
        }
      }
    } catch (error) {
      console.error('Error fetching item preview:', error);
      setSelectedItemPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    // Generate the product route using SKU (not slug)
    const route = `/product/category/${product.categorySlug}/${product.subCategorySlug}/${product.sku}`;
    
    setFormData(prev => ({
      ...prev,
      ctaSlug: product.sku,  // Store SKU in ctaSlug
      ctaLink: route
    }));

    // Fetch and show preview using SKU
    fetchItemPreview('product', product.sku);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('adminToken');
    
    const submitData = {
      ...formData,
      type: activeTab === 'banners' ? 'banner' : 'reel',
      imageUrl: formData.imageUrl || null,
      mobileImageUrl: formData.mobileImageUrl || null,
      videoUrl: formData.videoUrl || null,
      ctaText: formData.ctaText || null,
      ctaLink: formData.ctaLink || null,
      ctaSlug: formData.ctaSlug || null,
      description: formData.description || null
    };

    if (activeTab === 'banners' && !submitData.imageUrl) {
      alert('Banner requires an Image URL');
      return;
    }
    if (activeTab === 'reels' && !submitData.videoUrl) {
      alert('Reel requires a Video URL');
      return;
    }

    // Validate product CTA
    if (submitData.ctaType === 'product' && !submitData.ctaSlug) {
      alert('Please select a product');
      return;
    }
    
    try {
      const url = editingItem 
        ? `${API_URL}/media/${editingItem.id}`
        : `${API_URL}/media`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingItem ? 'Media updated!' : 'Media created!');
        resetForm();
        fetchMedia();
      } else {
        alert(`Error: ${data.message || JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      console.error('Error saving media:', error);
      alert('Error saving media');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Deleted!');
        fetchMedia();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      mobileImageUrl: item.mobileImageUrl || '',
      videoUrl: item.videoUrl || '',
      ctaText: item.ctaText || '',
      ctaLink: item.ctaLink || '',
      ctaType: item.ctaType || 'none',
      ctaSlug: item.ctaSlug || '',
      duration: item.duration || 45,
      orderIndex: item.orderIndex || 0,
      isActive: item.isActive
    });
    setShowForm(true);
    
    if (item.ctaType === 'product' && item.ctaSlug) {
      fetchItemPreview('product', item.ctaSlug);
    } else if (item.ctaType !== 'none' && item.ctaType !== 'custom' && item.ctaSlug) {
      fetchItemPreview(item.ctaType, item.ctaSlug);
    }
  };

  const resetForm = () => {
    setFormData({
      type: activeTab === 'banners' ? 'banner' : 'reel',
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      mobileImageUrl: '',
      videoUrl: '',
      ctaText: '',
      ctaLink: '',
      ctaType: 'none',
      ctaSlug: '',
      duration: 45,
      orderIndex: 0,
      isActive: true
    });
    setEditingItem(null);
    setShowForm(false);
    setSelectedItemPreview(null);
    setProductSearchTerm('');
  };

  const handleCTATypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      ctaType: type,
      ctaLink: '',
      ctaSlug: ''
    }));
    setSelectedItemPreview(null);
    setProductSearchTerm('');
  };

  const handleRouteSelect = (value) => {
    if (value) {
      const [type, slug] = value.split(':');
      let route = '';
      
      if (type === 'category') {
        route = `/products/category/${slug}`;
      } else if (type === 'subcategory') {
        const subcat = routes.subcategories.find(s => s.slug === slug);
        route = `/products/category/${subcat?.categorySlug}`;
      } else if (type === 'product') {
        const prod = routes.products.find(p => p.slug === slug);
        route = `/product/category/${prod?.categorySlug}/${prod?.subCategorySlug}/${prod?.sku}`;
      } else if (type === 'collection') {
        route = `/products/collection/${slug}`;
      }

      setFormData(prev => ({
        ...prev,
        ctaLink: route,
        ctaSlug: slug
      }));

      fetchItemPreview(type, slug);
    }
  };

  const renderPreview = () => {
    if (!selectedItemPreview) return null;

    const { type, data } = selectedItemPreview;

    if (type === 'product') {
      const price = data.pricing?.discountedPrice || data.pricing?.basePrice || data.price || 0;
      const originalPrice = data.pricing?.basePrice || data.originalPrice || 0;
      const hasDiscount = originalPrice > price;

      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-amber-600" />
            <h4 className="font-semibold text-gray-900">Selected Product</h4>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {data.images && data.images.length > 0 ? (
                  <img 
                    src={data.images[0]} 
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-semibold text-sm line-clamp-1">
                  {data.name}
                </h3>
                <p className="text-gray-900 text-base font-bold">
                  ₹{price?.toLocaleString('en-IN')}
                </p>
                {hasDiscount && (
                  <p className="text-gray-500 text-xs line-through">
                    ₹{originalPrice?.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
            <button className="mt-3 w-full bg-amber-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              {formData.ctaText || 'Add to Cart'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p>SKU: <span className="font-mono">{data.sku}</span></p>
            <p>Slug: <span className="font-mono">{data.slug}</span></p>
            <p className="break-all">Route: <code className="bg-gray-100 px-1 py-0.5 rounded">{formData.ctaLink}</code></p>
          </div>
        </div>
      );
    }

    return null;
  };

  const filteredProducts = allProducts.filter(product => 
    product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Media</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          <Plus size={20} />
          Add {activeTab === 'banners' ? 'Banner' : 'Reel'}
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => {
            setActiveTab('banners');
            resetForm();
          }}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'banners'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Banners
        </button>
        <button
          onClick={() => {
            setActiveTab('reels');
            resetForm();
          }}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'reels'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reels
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {activeTab} found. Click "Add" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="aspect-video bg-gray-100 relative">
                {activeTab === 'banners' && item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : activeTab === 'reels' && item.videoUrl ? (
                  <video src={item.videoUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {activeTab === 'banners' ? <Image size={48} /> : <Video size={48} />}
                  </div>
                )}
                {!item.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
                {item.ctaType === 'product' && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <ShoppingCart size={12} />
                    Product
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                {item.ctaSlug && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mb-2">
                    <ShoppingCart size={12} />
                    <span className="truncate font-mono">{item.ctaSlug}</span>
                  </div>
                )}
                {item.ctaText && (
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded mb-3 truncate">
                    CTA: "{item.ctaText}"
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'banners' ? 'Banner' : 'Reel'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                      rows={3}
                    />
                  </div>

                  {activeTab === 'banners' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Image URL *</label>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-gray-900"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Mobile Image URL</label>
                        <input
                          type="url"
                          value={formData.mobileImageUrl}
                          onChange={(e) => setFormData({...formData, mobileImageUrl: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-gray-900"
                          placeholder="https://..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Video URL *</label>
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-gray-900"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Duration (seconds)</label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 45})}
                          className="w-full border rounded-lg px-3 py-2 text-gray-900"
                          min="1"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">CTA Text</label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                      placeholder="Add to Cart"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">CTA Type</label>
                    <select
                      value={formData.ctaType}
                      onChange={(e) => handleCTATypeChange(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-gray-900"
                    >
                      <option value="none">None</option>
                      <option value="product">Product (Add to Cart)</option>
                      <option value="category">Category</option>
                      <option value="subcategory">Subcategory</option>
                      <option value="collection">Collection</option>
                      <option value="custom">Custom URL</option>
                    </select>
                  </div>

                  {formData.ctaType !== 'none' && formData.ctaType !== 'custom' && formData.ctaType !== 'product' && routes && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Select {formData.ctaType}</label>
                      <select
                        onChange={(e) => handleRouteSelect(e.target.value)}
                        value={formData.ctaSlug ? `${formData.ctaType}:${formData.ctaSlug}` : ''}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                      >
                        <option value="">-- Select --</option>
                        
                        {formData.ctaType === 'category' && routes.categories?.map(cat => (
                          <option key={cat.slug} value={`category:${cat.slug}`}>
                            {cat.name}
                          </option>
                        ))}
                        
                        {formData.ctaType === 'subcategory' && routes.subcategories?.map(sub => (
                          <option key={sub.slug} value={`subcategory:${sub.slug}`}>
                            {sub.name} (in {sub.categorySlug})
                          </option>
                        ))}
                        
                        {formData.ctaType === 'collection' && routes.collections?.map(col => (
                          <option key={col.slug} value={`collection:${col.slug}`}>
                            {col.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.ctaType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Custom URL</label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        placeholder="/custom-page"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  {formData.ctaType === 'product' ? (
                    <>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <ShoppingCart size={20} className="text-amber-600" />
                          Select Product
                        </h3>
                        <input
                          type="text"
                          placeholder="Search products by name or SKU..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-gray-900 mb-3"
                        />
                        {selectedItemPreview && renderPreview()}
                      </div>

                      {loadingProducts ? (
                        <div className="text-center py-12">
                          <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-gray-500">Loading products...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 mb-2">
                            {filteredProducts.length} products found
                          </p>
                          {filteredProducts.map((product) => {
                            const price = product.pricing?.discountedPrice || product.pricing?.basePrice || product.price || 0;
                            const isSelected = formData.ctaSlug === product.slug;
                            
                            return (
                              <div
                                key={product.id}
                                onClick={() => handleProductSelect(product)}
                                className={`border rounded-lg p-3 cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition ${
                                  isSelected ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                      <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Image size={24} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-gray-900 font-semibold text-sm line-clamp-1">
                                      {product.name}
                                    </h4>
                                    <p className="text-gray-900 text-sm font-bold">
                                      ₹{price?.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      SKU: {product.sku}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="flex-shrink-0">
                                      <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          
                          {filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <Image size={48} className="mx-auto mb-2 opacity-30" />
                              <p>No products found</p>
                              {productSearchTerm && (
                                <button 
                                  onClick={() => setProductSearchTerm('')}
                                  className="mt-2 text-amber-600 text-sm hover:underline"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : formData.ctaType === 'custom' ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom URL Preview</h3>
                      {formData.ctaLink ? (
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-2">Custom URL</h4>
                          <code className="bg-white px-3 py-2 rounded block text-sm break-all">
                            {formData.ctaLink}
                          </code>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <ExternalLink size={48} className="mx-auto mb-2 opacity-30" />
                          <p>Enter a custom URL in the form</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Eye size={48} className="mx-auto mb-2 opacity-30" />
                      <p>Select CTA type to continue</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedia;