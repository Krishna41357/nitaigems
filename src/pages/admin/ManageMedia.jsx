import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Move, ExternalLink, Image, Video } from 'lucide-react';

const ManageMedia = () => {
  const [activeTab, setActiveTab] = useState('banners');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [routes, setRoutes] = useState(null);
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

  useEffect(() => {
    fetchMedia();
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

  const handleSubmit = async () => {
    const token = localStorage.getItem('adminToken');
    
    // Prepare data - convert empty strings to null for optional URL fields
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

    // Validate required fields
    if (activeTab === 'banners' && !submitData.imageUrl) {
      alert('Banner requires an Image URL');
      return;
    }
    if (activeTab === 'reels' && !submitData.videoUrl) {
      alert('Reel requires a Video URL');
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
  };

  const handleCTATypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      ctaType: type,
      ctaLink: '',
      ctaSlug: ''
    }));
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
        route = `/products/category/${prod?.categorySlug}/${prod?.subCategorySlug}/${prod?.slug}`;
      } else if (type === 'collection') {
        route = `/products/collection/${slug}`;
      }

      setFormData(prev => ({
        ...prev,
        ctaLink: route,
        ctaSlug: slug
      }));
    }
  };

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
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                {item.ctaLink && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mb-3">
                    <ExternalLink size={12} />
                    <span className="truncate">{item.ctaLink}</span>
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
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'banners' ? 'Banner' : 'Reel'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

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
                    placeholder="Shop Now"
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
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="subcategory">Subcategory</option>
                    <option value="collection">Collection</option>
                    <option value="custom">Custom URL</option>
                  </select>
                </div>

                {formData.ctaType !== 'none' && formData.ctaType !== 'custom' && routes && (
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
                      
                      {formData.ctaType === 'product' && routes.products?.map(prod => (
                        <option key={prod.slug} value={`product:${prod.slug}`}>
                          {prod.name}
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

                {formData.ctaLink && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Link Preview</label>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {formData.ctaLink}
                    </div>
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