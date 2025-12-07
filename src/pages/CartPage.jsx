import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Home, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainHeader from '../components/homepage/MainHeader';
import Navigation from '../components/homepage/Navigation';
import '../components/cart/cart.css';

const CartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const headerFont = "'Cinzel', 'Playfair Display', serif";
  const API_BASE = import.meta.env.VITE_APP_BASE_URL;

  // Build breadcrumbs from navigation state or fallback
  const buildBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', path: '/' }];

    // If the navigator passed a breadcrumb trail
    if (location.state?.breadcrumb && Array.isArray(location.state.breadcrumb)) {
      location.state.breadcrumb.forEach((c) => crumbs.push(c));
    } else if (location.state?.from) {
      const from = location.state.from;

      if (from === '/') {
        // nothing more
      } else if (from.startsWith('/products') || from.startsWith('/product')) {
        crumbs.push({ label: 'Products', path: '/products' });

        if (location.state?.productName) {
          crumbs.push({ label: location.state.productName, path: location.state.from });
        }
      } else if (from.startsWith('/categories') || from.startsWith('/collections')) {
        crumbs.push({ label: 'Products', path: '/products' });
      } else {
        // unknown, just add a generic
        crumbs.push({ label: 'Products', path: '/products' });
      }
    }

    // Finally the cart
    crumbs.push({ label: 'Shopping Cart', path: null });
    return crumbs;
  };

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      if (!isAuthenticated) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCartData(data.data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [isAuthenticated, API_BASE]);

  // Calculate totals
  const calculateTotals = () => {
    if (!cartData?.items || cartData.items.length === 0) {
      return { subtotal: 0, tax: 0, total: 0, itemCount: 0 };
    }

    const subtotal = cartData.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const itemCount = cartData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return { subtotal, tax, total, itemCount };
  };

  const { subtotal, tax, total, itemCount } = calculateTotals();

  // Handle quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartData((prev) => ({
          ...prev,
          items: data.data.items,
        }));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartData((prev) => ({
          ...prev,
          items: data.data.items,
        }));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCartData({ items: [] });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/checkout', { state: { cartTotal: total, items: cartData?.items } });
  };

  // Show loading
  if (loading) {
    return (
      <>
        <MainHeader />
        <Navigation />
        <div className="min-h-screen bg-[#fbf6ef] flex items-center justify-center">
          <div className="animate-spin">
            <ShoppingCart size={48} className="text-[#b8860b]" />
          </div>
        </div>
      </>
    );
  }

  // Show login modal
  if (!isAuthenticated) {
    return (
      <>
        <MainHeader />
        <Navigation />
        <div className="min-h-screen bg-[#fbf6ef] flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <ShoppingCart size={48} className="text-[#b8860b] mx-auto mb-4" />
              <h2 style={{ fontFamily: headerFont }} className="text-2xl font-bold text-[#3b1b12] mb-2">
                Please Log In
              </h2>
              <p className="text-[#6b5342] mb-6">You need to be logged in to view your cart.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white px-6 py-3 rounded-full font-medium hover:from-[#a06f09] hover:to-[#b8860b] transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Empty cart
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <>
        <MainHeader />
        <Navigation />
        <div className="min-h-[calc(100vh-120px)] bg-[#fbf6ef] flex flex-col items-center justify-center px-4">
          <ShoppingCart size={64} className="empty-cart-icon text-[#b8860b] mb-4" />
          <h2 style={{ fontFamily: headerFont }} className="text-2xl md:text-3xl font-bold text-[#3b1b12] mb-2 text-center">
            Your Cart is Empty
          </h2>
          <p className="text-[#6b5342] mb-8 text-center max-w-md text-sm md:text-base">
            Discover our exquisite collection of heirloom jewellery and add your favorite pieces to your cart.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white px-6 py-2.5 rounded-full font-medium hover:from-[#a06f09] hover:to-[#b8860b] transition-all flex items-center gap-2 text-sm md:text-base"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="bg-[#fbf6ef] min-h-screen w-screen overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
          <Navigation />
          
          {/* Breadcrumbs */}
          <div style={{ fontFamily: headerFont }} className="flex mt-4 items-center gap-1.5 mb-4 md:mb-6 text-xs md:text-sm overflow-x-auto pb-2">
            {buildBreadcrumbs().map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1. flex-shrink-0">
                {idx > 0 && <span className="text-[#b8860b]">{'>'}</span>}

                {crumb.path ? (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="breadcrumb-item flex bg-transparent items-center gap-1 text-[#6b5342] hover:text-[#b8860b] transition-colors whitespace-nowrap"
                  >
                    {idx === 0 ? <Home size={14} /> : idx === 1 ? <Package size={14} /> : null}
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[#3b1b12] font-semibold ml-2 whitespace-nowrap">{crumb.label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-[#efe6d9] overflow-hidden">
                {/* Header */}
                <div style={{ fontFamily: headerFont }} className="bg-gradient-to-r from-[#fbf6ef] to-[#fffaf3] p-4 md:p-5 border-b border-[#efe6d9]">
                  <div className="flex items-center justify-between">
                    <h1 className="text-lg md:text-xl font-bold text-[#3b1b12]">Shopping Cart</h1>
                    <span className="text-[#b8860b] font-semibold text-sm md:text-base">{itemCount} items</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="cart-items-container max-h-[50vh] overflow-y-auto">
                  {cartData.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="cart-product-card border-b border-[#efe6d9] p-4 md:p-5 last:border-b-0 cart-item-enter"
                    >
                      <div className="flex gap-3 md:gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                          <div className="w-full h-full bg-gradient-to-br from-[#fbf6ef] to-[#efefef] rounded-lg flex items-center justify-center overflow-hidden">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={24} className="text-[#b8860b]" />
                            )}
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 style={{ fontFamily: headerFont }} className="text-sm md:text-base font-bold text-[#3b1b12] mb-1 truncate">
                            {item.product_name}
                          </h3>
                          <p className="text-[#6b5342] text-xs mb-3 truncate">SKU: {item.sku}</p>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-1 bg-[#fbf6ef] rounded-lg p-0.5">
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="qty-btn p-1.5 bg-white border-black hover:bg-white rounded text-[#3b1b12] disabled:opacity-30"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 py-0.5 font-semibold text-[#3b1b12] min-w-[32px] text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                className="qty-btn p-1.5 bg-white border-black hover:bg-white rounded text-[#3b1b12]"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-[#6b5342] mb-0.5">₹{item.price?.toFixed(2)} each</p>
                              <p style={{ fontFamily: headerFont }} className="text-base md:text-lg font-bold text-[#3b1b12]">
                                ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.product_id)}
                              className="remove-btn p-1.5 text-[#b8860b] hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="order-summary rounded-lg md:rounded-xl p-4 md:p-5 sticky top-24 md:top-32">
                <h2 style={{ fontFamily: headerFont }} className="text-lg md:text-xl font-bold text-[#3b1b12] mb-4 md:mb-5">
                  Order Summary
                </h2>

                {/* Summary Items */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6b5342] text-sm">Subtotal ({itemCount} items)</span>
                    <span style={{ fontFamily: headerFont }} className="font-semibold text-[#3b1b12] text-sm">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-[#d4a055]">
                    <span className="text-[#6b5342] text-sm">Tax (10%)</span>
                    <span style={{ fontFamily: headerFont }} className="font-semibold text-[#3b1b12] text-sm">
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 price-highlight">
                    <span style={{ fontFamily: headerFont }} className="font-bold text-[#3b1b12]">
                      Total
                    </span>
                    <span style={{ fontFamily: headerFont }} className="text-xl md:text-2xl font-bold text-[#b8860b]">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={handleCheckout}
                    className="checkout-btn w-full text-white py-2.5 md:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full bg-white border-2 border-[#b8860b] text-[#b8860b] py-2.5 md:py-3 rounded-lg font-semibold hover:bg-[#fbf6ef] transition-all text-sm md:text-base"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full bg-white border-2 border-red-200 text-red-600 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-red-50 transition-all text-xs md:text-sm"
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Info */}
                <div className="mt-4 md:mt-5 p-3 md:p-4 bg-white/60 rounded-lg border border-[#efe6d9]">
                  <p className="text-xs text-[#6b5342] leading-relaxed">
                    ✓ Free shipping on orders above ₹5000
                    <br />
                    ✓ 15-day return policy
                    <br />
                    ✓ Secure checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;