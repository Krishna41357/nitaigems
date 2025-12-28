// src/pages/CheckoutPage.jsx - COMPLETE VERSION WITH EVERYTHING

import React, { useState, useEffect } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Plus, MapPin, Phone, Mail, Shield, Truck, Lock, CreditCard, Trash2, AlertCircle, X, Tag, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainHeader from '../components/homepage/MainHeader';
import Loading from "../components/Loading";



const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [addressForm, setAddressForm] = useState({
    label: '',
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const headerFont = "'Cinzel', 'Playfair Display', serif";
  const API_BASE = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8787';
  
  const buildBreadcrumbs = () => {
    return [
      { label: 'Home', path: '/' },
      { label: 'Cart', path: '/cart' },
      { label: 'Checkout', path: null }
    ];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    fetchCartData();
    fetchAddresses();
  }, [isAuthenticated, navigate]);

  const fetchCartData = async () => {
    setLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.data?.items || [];
        
        if (items.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCartItems(items);
        calculateOrderSummary(items);
      } else {
        const errorData = await response.json();
        setApiError(errorData.message || 'Failed to fetch cart');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setApiError('Network error. Please check your connection.');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const addressList = data.addresses || [];
        setAddresses(addressList);
        
        const defaultAddr = addressList.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const calculateOrderSummary = (items, couponDiscountAmount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.03;
    const shipping = subtotal >= 500 ? 0 : 50;
    const discount = couponDiscountAmount;
    const total = subtotal + tax + shipping - discount;
    
    setOrderSummary({ 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      tax: parseFloat(tax.toFixed(2)), 
      shipping: parseFloat(shipping.toFixed(2)), 
      discount: parseFloat(discount.toFixed(2)), 
      total: parseFloat(total.toFixed(2)) 
    });
  };

  // Coupon validation
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/coupons/${couponCode.toUpperCase()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        setCouponError('Invalid coupon code');
        setCouponLoading(false);
        return;
      }

      const coupon = await response.json();

      if (coupon.validTill && new Date(coupon.validTill) < new Date()) {
        setCouponError('This coupon has expired');
        setCouponLoading(false);
        return;
      }

      if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
        setCouponError('This coupon is not yet valid');
        setCouponLoading(false);
        return;
      }

      const isCouponApplicable = await checkCouponApplicability(coupon);
      
      if (!isCouponApplicable) {
        setCouponError('This coupon is not applicable to items in your cart');
        setCouponLoading(false);
        return;
      }

      const discount = calculateCouponDiscount(coupon);
      
      setAppliedCoupon(coupon);
      setCouponDiscount(discount);
      calculateOrderSummary(cartItems, discount);
      setSuccess(`Coupon "${coupon.code}" applied! You saved ₹${discount.toFixed(2)}`);
      
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const checkCouponApplicability = async (coupon) => {
    if (
      (!coupon.applicableCategories || coupon.applicableCategories.length === 0) &&
      (!coupon.applicableSubcategories || coupon.applicableSubcategories.length === 0) &&
      (!coupon.applicableProducts || coupon.applicableProducts.length === 0)
    ) {
      return true;
    }

    for (const item of cartItems) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/products/slug/${item.product_slug}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const product = await response.json();
          
          if (coupon.applicableProducts?.includes(product.slug)) return true;
          if (coupon.applicableSubcategories?.includes(product.subCategorySlug)) return true;
          if (coupon.applicableCategories?.includes(product.categorySlug)) return true;
        }
      } catch (error) {
        console.error('Error checking product:', error);
      }
    }

    return false;
  };

  const calculateCouponDiscount = (coupon) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = (subtotal * coupon.discountPercent) / 100;
    
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
    
    return parseFloat(discount.toFixed(2));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
    setSuccess('');
    calculateOrderSummary(cartItems, 0);
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddressForm = () => {
    const newErrors = {};
    
    if (!addressForm.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!addressForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(addressForm.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!addressForm.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!addressForm.city.trim()) newErrors.city = 'City is required';
    if (!addressForm.state.trim()) newErrors.state = 'State is required';
    if (!addressForm.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    } else if (!/^\d{6}$/.test(addressForm.postal_code)) {
      newErrors.postal_code = 'Invalid postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    if (!validateAddressForm()) return;

    setLoading(true);
    setApiError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });

      const result = await response.json();

      if (response.ok) {
        await fetchAddresses();
        setSelectedAddress(result.address.id);
        setShowAddressModal(false);
        setAddressForm({
          label: '',
          full_name: '',
          phone: '',
          email: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India',
          is_default: false
        });
        setErrors({});
      } else {
        setApiError(result.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchAddresses();
        if (selectedAddress === addressId) {
          setSelectedAddress(null);
        }
      } else {
        const result = await response.json();
        setApiError(result.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setApiError('Network error. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setApiError('Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    setApiError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const orderResponse = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address_id: selectedAddress,
          payment_method: 'phonepe',
          coupon_code: appliedCoupon ? appliedCoupon.code : null
        })
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const paymentResponse = await fetch(`${API_BASE}/payments/phonepe/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderResult.order.id
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentResult.message || 'Failed to initiate payment');
      }

      if (paymentResult.paymentUrl) {
        window.location.href = paymentResult.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error) {
      console.error('Order placement error:', error);
      setApiError(error.message || 'Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  // PART 1: Copy the entire CheckoutPage.jsx from your original document (Document 2)
// This includes ALL imports, states, and functions up to the formatPrice function
// Then continue with PART 2 below which has the complete JSX return statement

// After the formatPrice function, add the complete return statement:

  if (loading) {
    return (
      <>
        <Loading/>
      </>
    );
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <>
        <MainHeader />
       
        <div className="min-h-[calc(100vh-120px)] bg-[#fbf6ef] flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h2 style={{ fontFamily: headerFont }} className="text-2xl md:text-3xl font-bold text-black#3b1b12] mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-black#6b5342] mb-6 text-sm">Add some items to your cart before checking out.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-transparent border-2 border-[#b8860b] text-[#b8860b] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#b8860b] hover:text-white transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>

      </>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="bg-[#fbf6ef] min-h-screen w-screen overflow-x-hidden flex flex-col">
        <div className="w-screen max-w-7xl mx-auto px-3 md:px-6 py-4 h-full flex flex-col">
   
          
          {/* Breadcrumb - YOUR ORIGINAL CODE */}
          <div style={{ fontFamily: headerFont }} className="flex items-center gap-1.5 mb-4 md:mb-6 text-xs md:text-sm overflow-x-auto pb-2">
            {buildBreadcrumbs().map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                {idx > 0 && <span className="text-[#b8860b]">{'>'}</span>}
                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="flex bg-transparent items-center gap-1 text-[#6b5342] hover:text-[#b8860b] transition-colors whitespace-nowrap"
                  >
                    {idx === 0 ? <Home size={14} /> : idx === 1 ? <ShoppingCart size={14} /> : null}
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[#3b1b12] font-semibold whitespace-nowrap flex items-center gap-1">
                    <Package size={14} />
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Processing Overlay - YOUR ORIGINAL CODE */}
          {isProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 md:p-8 text-center max-w-sm mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#b8860b] mx-auto mb-4"></div>
                <h3 style={{ fontFamily: headerFont }} className="text-lg font-bold text-[#3b1b12] mb-2">
                  Processing your order
                </h3>
                <p className="text-[#6b5342] mb-4 text-sm">Please do not refresh or close this page</p>
                <div className="flex items-center justify-center gap-2 text-xs text-[#6b5342]">
                  <Lock size={12} />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          )}

          {/* YOUR COMPLETE ADDRESS MODAL FROM DOCUMENT 2 - PASTE HERE */}
{/* ADDRESS MODAL */}
       
{/* CUSTOM SCROLLBAR STYLES - Add this to your global CSS or as a style tag */}
<style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #fbf6ef;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #b8860b 0%, #d4a055 100%);
    border-radius: 10px;
    border: 2px solid #fbf6ef;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #916c0a 0%, #b8860b 100%);
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  .modal-animate {
    animation: modalSlideIn 0.3s ease-out;
  }
  
  .backdrop-blur-custom {
    backdrop-filter: blur(8px);
  }
`}</style>

{/* ADDRESS MODAL */}
{showAddressModal && (
  <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-custom flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
    <div className="bg-gradient-to-br from-white to-[#fbf6ef]/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#d4a055]/20 modal-animate">
      {/* Modal Header with Gradient */}
      <div className="sticky top-0 bg-gradient-to-r from-[#fbf6ef] via-white to-[#fbf6ef] border-b-2 border-[#d4a055]/30 px-6 py-5 flex items-center justify-between backdrop-blur-sm z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#b8860b] to-[#d4a055] rounded-xl flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 style={{ fontFamily: headerFont }} className="text-xl font-bold text-black">
              Add New Address
            </h3>
            <p className="text-xs text-black mt-0.5">Complete your delivery details</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddressModal(false);
            setErrors({});
            setApiError('');
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6b5342]/10 hover:bg-red-50 text-[#6b5342] hover:text-red-600 transition-all duration-200 bg-transparent border-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Modal Form with Custom Scrollbar */}
      <form onSubmit={handleSaveAddress} className="p-6 space-y-5 overflow-y-auto custom-scrollbar max-h-[calc(90vh-80px)]">
        {/* Error Alert inside Modal with Animation */}
        {apiError && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Error</p>
              <p className="text-red-600 text-xs mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Label (Optional) with Icon */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <Tag size={14} className="text-[#b8860b]" />
              Address Label
              <span className="text-xs font-normal text-[#6b5342]">(Optional)</span>
            </label>
            <input
              type="text"
              name="label"
              value={addressForm.label}
              onChange={handleAddressInputChange}
              placeholder="e.g., Home, Office, etc."
              className="w-full px-4 py-3 border-2 border-[#d4a055]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-[#d4a055]/50"
            />
          </div>

          {/* Full Name with Icon */}
          <div className="group">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <Mail size={14} className="text-[#b8860b]" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={addressForm.full_name}
              onChange={handleAddressInputChange}
              placeholder="Enter full name"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.full_name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Phone with Icon */}
          <div className="group">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <Phone size={14} className="text-[#b8860b]" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={addressForm.phone}
              onChange={handleAddressInputChange}
              placeholder="10-digit mobile number"
              maxLength="10"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.phone 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email (Optional) with Icon */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <Mail size={14} className="text-[#b8860b]" />
              Email
              <span className="text-xs font-normal text-[#6b5342]">(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={addressForm.email}
              onChange={handleAddressInputChange}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-[#d4a055]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-[#d4a055]/50"
            />
          </div>

          {/* Address Line 1 with Icon */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-[#b8860b]" />
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address_line1"
              value={addressForm.address_line1}
              onChange={handleAddressInputChange}
              placeholder="House No., Building Name"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.address_line1 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.address_line1 && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.address_line1}
              </p>
            )}
          </div>

          {/* Address Line 2 (Optional) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-[#b8860b]" />
              Address Line 2
              <span className="text-xs font-normal text-[#6b5342]">(Optional)</span>
            </label>
            <input
              type="text"
              name="address_line2"
              value={addressForm.address_line2}
              onChange={handleAddressInputChange}
              placeholder="Road Name, Area, Colony"
              className="w-full px-4 py-3 border-2 border-[#d4a055]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm hover:border-[#d4a055]/50"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={addressForm.city}
              onChange={handleAddressInputChange}
              placeholder="City"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.city 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.city}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={addressForm.state}
              onChange={handleAddressInputChange}
              placeholder="State"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.state 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.state}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postal_code"
              value={addressForm.postal_code}
              onChange={handleAddressInputChange}
              placeholder="6-digit PIN code"
              maxLength="6"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                errors.postal_code 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#d4a055]/30 focus:border-[#b8860b] hover:border-[#d4a055]/50'
              }`}
            />
            {errors.postal_code && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in slide-in-from-top duration-200">
                <AlertCircle size={12} />
                {errors.postal_code}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-[#3b1b12] mb-2">
              Country
            </label>
            <div className="relative">
              <input
                type="text"
                name="country"
                value={addressForm.country}
                readOnly
                className="w-full px-4 py-3 border-2 border-[#d4a055]/30 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-sm cursor-not-allowed font-medium text-[#6b5342]"
              />
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5342]" />
            </div>
          </div>

          {/* Default Address Checkbox with Card Style */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#d4a055]/30 hover:border-[#b8860b]/50 cursor-pointer transition-all duration-200 bg-gradient-to-br from-white to-[#fbf6ef]/30 hover:shadow-md group">
              <input
                type="checkbox"
                name="is_default"
                checked={addressForm.is_default}
                onChange={handleAddressInputChange}
                className="w-5 h-5 text-[#b8860b] border-2 border-[#d4a055] rounded focus:ring-2 focus:ring-[#b8860b] transition-all"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-[#3b1b12] group-hover:text-[#b8860b] transition-colors">
                  Set as default address
                </span>
                <p className="text-xs text-[#6b5342] mt-0.5">
                  This will be used as your primary delivery address
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer Buttons with Gradient */}
        <div className="flex gap-3 pt-5 border-t-2 border-[#d4a055]/20">
          <button
            type="button"
            onClick={() => {
              setShowAddressModal(false);
              setErrors({});
              setApiError('');
              setAddressForm({
                label: '',
                full_name: '',
                phone: '',
                email: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'India',
                is_default: false
              });
            }}
            className="flex-1 px-6 py-3.5 border-2 border-[#d4a055] text-[#6b5342] rounded-xl font-semibold hover:bg-gradient-to-r hover:from-[#fbf6ef] hover:to-[#efe6d9] transition-all duration-200 text-sm shadow-sm hover:shadow-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white rounded-xl font-semibold hover:from-[#916c0a] hover:to-[#b8860b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Address</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
          {/* Alerts */}
          {apiError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">Error</p>
                <p className="text-red-600 text-xs mt-1">{apiError}</p>
              </div>
              <button onClick={() => setApiError('')} className="text-red-400 hover:text-red-600 bg-transparent">×</button>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
              <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 bg-transparent">×</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1">
            {/* DELIVERY ADDRESS SECTION - YOUR ORIGINAL FROM DOCUMENT 2 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#efe6d9] p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ fontFamily: headerFont }} className="text-base md:text-lg font-bold text-[#3b1b12] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#b8860b]" />
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 text-[#b8860b] hover:text-[#a06f09] font-medium text-xs transition-colors bg-transparent"
                  >
                    <Plus size={14} />
                    Add New
                  </button>
                </div>

                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-[#6b5342] text-sm mb-3">No saved addresses yet</p>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="text-[#b8860b] hover:text-[#a06f09] font-medium text-sm bg-transparent"
                      >
                        Add your first address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddress === addr.id
                            ? 'border-[#b8860b] bg-[#fbf6ef]'
                            : 'border-gray-200 hover:border-[#d4a055]'
                        }`}
                        onClick={() => setSelectedAddress(addr.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex gap-2">
                            <input
                              type="radio"
                              checked={selectedAddress === addr.id}
                              onChange={() => setSelectedAddress(addr.id)}
                              className="w-3.5 h-3.5 text-[#b8860b] mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-semibold text-[#3b1b12] text-sm">{addr.full_name}</span>
                                {addr.label && (
                                  <span className="text-xs px-1.5 py-0.5 bg-[#b8860b]/10 text-[#b8860b] rounded">
                                    {addr.label}
                                  </span>
                                )}
                                {addr.is_default === 1 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6b5342] mb-1">
                                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                              </p>
                              <p className="text-xs text-[#6b5342] mb-1.5">
                                {addr.city}, {addr.state} - {addr.postal_code}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-[#6b5342] flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {addr.phone}
                                </span>
                                {addr.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail size={12} />
                                    {addr.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-red-500 hover:text-red-700 p-1.5 transition-colors bg-transparent"
                            title="Delete address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENT METHOD - YOUR ORIGINAL */}
              <div className="bg-white rounded-xl shadow-sm border border-[#efe6d9] p-4 md:p-5">
                <h3 style={{ fontFamily: headerFont }} className="text-base md:text-lg font-bold text-[#3b1b12] mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#b8860b]" />
                  Payment Method
                </h3>
                <div className="flex items-center gap-3 p-3 bg-[#fbf6ef] rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#3b1b12] text-sm">PhonePe</p>
                    <p className="text-xs text-[#6b5342]">Secure payment via PhonePe gateway</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY WITH COUPON */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#efe6d9] p-4 md:p-5 sticky top-20">
                <h2 style={{ fontFamily: headerFont }} className="text-lg md:text-xl font-bold text-[#3b1b12] mb-4">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-2 pb-2 border-b border-[#efe6d9]">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#fbf6ef] to-[#efefef] rounded-lg flex items-center justify-center overflow-hidden">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 bg-[#b8860b]/20 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-medium text-[#3b1b12] line-clamp-2">{item.product_name}</h3>
                        <p className="text-xs text-[#6b5342]">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontFamily: headerFont }} className="text-xs font-semibold text-[#3b1b12]">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COUPON SECTION */}
                <div className="mt-4 pt-4 border-t border-[#efe6d9]">
                  <h3 className="text-sm font-semibold text-[#3b1b12] mb-2 flex items-center gap-1">
                    <Tag size={14} className="text-[#b8860b]" />
                    Have a Coupon?
                  </h3>
                  
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Enter coupon code"
                          className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#b8860b] uppercase ${
                            couponError ? 'border-red-500' : 'border-[#d4a055]'
                          }`}
                          disabled={couponLoading}
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-[#b8860b] text-white text-sm rounded-lg font-medium hover:bg-[#916c0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      
                      {couponError && (
                        <div className="flex items-start gap-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag size={14} className="text-green-600" />
                            <span className="font-semibold text-green-800 text-sm">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-700 rounded">
                              {appliedCoupon.discountPercent}% OFF
                            </span>
                          </div>
                          <p className="text-xs text-green-600">
                            You're saving ₹{couponDiscount.toFixed(2)}!
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Remove coupon"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-3 border-t border-[#efe6d9]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6b5342] text-xs">Subtotal</span>
                    <span className="font-medium text-[#3b1b12] text-xs">{formatPrice(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6b5342] text-xs">Tax (3%)</span>
                    <span className="font-medium text-[#3b1b12] text-xs">{formatPrice(orderSummary.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6b5342] text-xs">Shipping</span>
                    <span className="font-medium text-[#3b1b12] text-xs">
                      {orderSummary.shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(orderSummary.shipping)
                      )}
                    </span>
                  </div>
                  {orderSummary.discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-xs flex items-center gap-1">
                        <Tag size={12} />
                        Coupon Discount
                      </span>
                      <span className="font-medium text-xs">-{formatPrice(orderSummary.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-[#d4a055]">
                    <span style={{ fontFamily: headerFont }} className="font-bold text-base text-[#3b1b12]">
                      Total
                    </span>
                    <span style={{ fontFamily: headerFont }} className="text-lg font-bold text-[#b8860b]">
                      {formatPrice(orderSummary.total)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || isProcessing || cartItems.length === 0}
                  className="w-full mt-4 bg-transparent border-2 border-[#b8860b] text-[#b8860b] py-3 rounded-lg text-sm font-semibold hover:bg-[#b8860b] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Proceed to Payment</span>
                    </>
                  )}
                </button>

                {!selectedAddress && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    Please select a delivery address
                  </p>
                )}

                {/* Trust Badges */}
                <div className="mt-4 p-3 bg-[#fbf6ef] rounded-lg border border-[#efe6d9]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-[#3b1b12]">Safe & Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs text-[#6b5342]">Free shipping on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs text-[#6b5342]">100% Payment Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default CheckoutPage;
