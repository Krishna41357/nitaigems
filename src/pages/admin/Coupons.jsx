import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, Edit2, Trash2, Search, Tag, Calendar, Percent, Package, Grid, Layers, AlertCircle, X, Check } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    maxDiscount: '',
    validFrom: '',
    validTill: '',
    applicableType: 'all',
    applicableCategories: [],
    applicableSubcategories: [],
    applicableProducts: []
  });

  const [formErrors, setFormErrors] = useState({});

  const API_BASE = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8787';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [couponsRes, categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/coupons`, { headers }),
        fetch(`${API_BASE}/admin/categories`, { headers }),
        fetch(`${API_BASE}/admin/subcategories`, { headers }),
        fetch(`${API_BASE}/admin/products`, { headers })
      ]);

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }

      if (subcategoriesRes.ok) {
        const subcategoriesData = await subcategoriesRes.json();
        setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const current = prev[name];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) errors.code = 'Coupon code is required';
    if (!formData.discountPercent || formData.discountPercent <= 0 || formData.discountPercent > 100) {
      errors.discountPercent = 'Discount must be between 1 and 100';
    }
    if (formData.validFrom && formData.validTill && new Date(formData.validFrom) > new Date(formData.validTill)) {
      errors.validTill = 'End date must be after start date';
    }
    if (formData.applicableType === 'categories' && formData.applicableCategories.length === 0) {
      errors.applicableCategories = 'Select at least one category';
    }
    if (formData.applicableType === 'subcategories' && formData.applicableSubcategories.length === 0) {
      errors.applicableSubcategories = 'Select at least one subcategory';
    }
    if (formData.applicableType === 'products' && formData.applicableProducts.length === 0) {
      errors.applicableProducts = 'Select at least one product';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountPercent: parseFloat(formData.discountPercent),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        validFrom: formData.validFrom || null,
        validTill: formData.validTill || null,
        applicableCategories: formData.applicableType === 'categories' ? formData.applicableCategories : [],
        applicableSubcategories: formData.applicableType === 'subcategories' ? formData.applicableSubcategories : [],
        applicableProducts: formData.applicableType === 'products' ? formData.applicableProducts : []
      };

      const url = editingCoupon 
        ? `${API_BASE}/admin/coupons/${editingCoupon.code}`
        : `${API_BASE}/admin/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
        fetchData();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save coupon');
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    
    let applicableType = 'all';
    if (coupon.applicableProducts?.length > 0) applicableType = 'products';
    else if (coupon.applicableSubcategories?.length > 0) applicableType = 'subcategories';
    else if (coupon.applicableCategories?.length > 0) applicableType = 'categories';

    setFormData({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      maxDiscount: coupon.maxDiscount || '',
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validTill: coupon.validTill ? coupon.validTill.split('T')[0] : '',
      applicableType,
      applicableCategories: coupon.applicableCategories || [],
      applicableSubcategories: coupon.applicableSubcategories || [],
      applicableProducts: coupon.applicableProducts || []
    });
    setShowModal(true);
  };

  const handleDelete = async (code) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Coupon deleted successfully');
        fetchData();
      } else {
        setError('Failed to delete coupon');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountPercent: '',
      maxDiscount: '',
      validFrom: '',
      validTill: '',
      applicableType: 'all',
      applicableCategories: [],
      applicableSubcategories: [],
      applicableProducts: []
    });
    setFormErrors({});
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (validTill) => {
    if (!validTill) return false;
    return new Date(validTill) < new Date();
  };

  const isActive = (validFrom, validTill) => {
    const now = new Date();
    if (validFrom && new Date(validFrom) > now) return false;
    if (validTill && new Date(validTill) < now) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <Check size={20} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && coupons.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No coupons found</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => {
            const active = isActive(coupon.validFrom, coupon.validTill);
            const expired = isExpired(coupon.validTill);

            return (
              <Card key={coupon.code} className={`relative ${expired ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Tag size={20} className="text-primary" />
                        {coupon.code}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          expired ? 'bg-red-100 text-red-700' :
                          active ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {expired ? 'Expired' : active ? 'Active' : 'Scheduled'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.code)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Percent size={16} />
                      Discount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {coupon.discountPercent}%
                    </span>
                  </div>

                  {coupon.maxDiscount && (
                    <div className="text-sm text-muted-foreground">
                      Max discount: ₹{coupon.maxDiscount}
                    </div>
                  )}

                  {(coupon.validFrom || coupon.validTill) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <Calendar size={14} />
                      {coupon.validFrom && (
                        <span>From {new Date(coupon.validFrom).toLocaleDateString()}</span>
                      )}
                      {coupon.validFrom && coupon.validTill && ' - '}
                      {coupon.validTill && (
                        <span>To {new Date(coupon.validTill).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t space-y-1">
                    {coupon.applicableCategories?.length > 0 && (
                      <div className="flex items-start gap-2 text-xs">
                        <Grid size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {coupon.applicableCategories.length} {coupon.applicableCategories.length === 1 ? 'category' : 'categories'}
                        </span>
                      </div>
                    )}
                    {coupon.applicableSubcategories?.length > 0 && (
                      <div className="flex items-start gap-2 text-xs">
                        <Layers size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {coupon.applicableSubcategories.length} {coupon.applicableSubcategories.length === 1 ? 'subcategory' : 'subcategories'}
                        </span>
                      </div>
                    )}
                    {coupon.applicableProducts?.length > 0 && (
                      <div className="flex items-start gap-2 text-xs">
                        <Package size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {coupon.applicableProducts.length} {coupon.applicableProducts.length === 1 ? 'product' : 'products'}
                        </span>
                      </div>
                    )}
                    {!coupon.applicableCategories?.length && 
                     !coupon.applicableSubcategories?.length && 
                     !coupon.applicableProducts?.length && (
                      <div className="text-xs text-muted-foreground italic">
                        Applicable to all products
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button onClick={handleCloseModal} className="hover:bg-accent p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled={editingCoupon}
                  placeholder="SUMMER50"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase ${
                    formErrors.code ? 'border-red-500' : ''
                  } ${editingCoupon ? 'bg-muted cursor-not-allowed' : ''}`}
                />
                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    step="0.01"
                    placeholder="10"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.discountPercent ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.discountPercent && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.discountPercent}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid From</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valid Till</label>
                  <input
                    type="date"
                    name="validTill"
                    value={formData.validTill}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      formErrors.validTill ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.validTill && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.validTill}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Apply To</label>
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'categories', 'subcategories', 'products'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        applicableType: type,
                        applicableCategories: [],
                        applicableSubcategories: [],
                        applicableProducts: []
                      }))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.applicableType === type
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {type === 'all' ? 'All Products' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.applicableType === 'categories' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {categories.map(cat => (
                      <label key={cat.slug} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.applicableCategories.includes(cat.slug)}
                          onChange={() => handleMultiSelect('applicableCategories', cat.slug)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.applicableCategories && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.applicableCategories}</p>
                  )}
                </div>
              )}

              {formData.applicableType === 'subcategories' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Subcategories <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {subcategories.map(sub => (
                      <label key={sub.slug} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.applicableSubcategories.includes(sub.slug)}
                          onChange={() => handleMultiSelect('applicableSubcategories', sub.slug)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.applicableSubcategories && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.applicableSubcategories}</p>
                  )}
                </div>
              )}

              {formData.applicableType === 'products' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Products <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {products.map(prod => (
                      <label key={prod.slug} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.applicableProducts.includes(prod.slug)}
                          onChange={() => handleMultiSelect('applicableProducts', prod.slug)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{prod.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.applicableProducts && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.applicableProducts}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border rounded-lg hover:bg-accent transition-colors"
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
}