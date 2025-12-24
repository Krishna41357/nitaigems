// src/pages/admin/CategoriesAdmin.jsx
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL_ADMIN;

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const toggleSubcategories = async (categoryId, currentState) => {
    try {
      const response = await fetch(`${API_BASE}/category/${categoryId}/toggle-subcategories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ showSubcategories: !currentState })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCategories(prev => 
          prev.map(cat => 
            cat.id === categoryId 
              ? { ...cat, showSubcategories: !currentState }
              : cat
          )
        );
        showNotification(`Subcategories ${!currentState ? 'enabled' : 'disabled'}`, 'success');
      } else {
        showNotification(data.error || 'Failed to update category', 'error');
      }
    } catch (error) {
      showNotification('Failed to update category', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#10254b] text-lg font-semibold">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#10254b] mb-2">Category Management</h1>
        <p className="text-gray-600">Toggle subcategories visibility for each category</p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-[#10254b]/10"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-[#10254b]">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-[#10254b]">
                    Show Subcategories
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.showSubcategories !== false ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => toggleSubcategories(category.id, category.showSubcategories !== false)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#10254b] focus:ring-offset-2 ${
                    category.showSubcategories !== false ? 'bg-[#10254b]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      category.showSubcategories !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No categories found. Create some categories first.
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}