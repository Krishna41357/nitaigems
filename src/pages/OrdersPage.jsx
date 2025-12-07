// src/pages/OrdersPage.jsx - COMPLETE VERSION

import React, { useState, useEffect } from 'react';
import { Package, MapPin, Phone, Mail, Truck, Calendar, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Tag, Box, ShoppingBag, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainHeader from '../components/homepage/MainHeader';
import Footer from '../components/homepage/Footer';

const OrdersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const headerFont = "'Cinzel', 'Playfair Display', serif";
  const API_BASE = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8787';

  const buildBreadcrumbs = () => {
    return [
      { label: 'Home', path: '/' },
      { label: 'My Orders', path: null }
    ];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Demo data for testinga
      alert(error.message || 'An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      confirmed: <CheckCircle className="w-3.5 h-3.5" />,
      processing: <Package className="w-3.5 h-3.5" />,
      shipped: <Truck className="w-3.5 h-3.5" />,
      delivered: <CheckCircle className="w-3.5 h-3.5" />,
      cancelled: <XCircle className="w-3.5 h-3.5" />
    };
    return icons[status] || <Package className="w-3.5 h-3.5" />;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      failed: 'text-red-600',
      refunded: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const calculateEstimatedDelivery = (order) => {
    if (order.status === 'delivered' && order.delivered_at) {
      return new Date(order.delivered_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }

    if (order.status === 'cancelled') return 'Cancelled';

    const createdDate = new Date(order.created_at);
    const estimatedDays = order.status === 'shipped' ? 3 : 7;
    const estimatedDate = new Date(createdDate);
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    return estimatedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
    return order.status === selectedFilter;
  });

  const orderCounts = {
    all: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (loading) {
    return (
      <>
        <MainHeader />
        <div className="min-h-[calc(100vh-120px)] bg-[#fbf6ef] flex flex-col items-center justify-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8860b] mb-4"></div>
          <p className="text-[#3b1b12]">Loading your orders...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MainHeader />
      <div className="bg-[#fbf6ef] min-h-screen w-screen overflow-x-hidden flex flex-col">
        <div className="w-screen max-w-7xl mx-auto px-3 md:px-6 py-4 h-full flex flex-col">
          
          {/* Breadcrumb */}
          <div style={{ fontFamily: headerFont }} className="flex items-center gap-1.5 mb-4 md:mb-6 text-xs md:text-sm overflow-x-auto pb-2">
            {buildBreadcrumbs().map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                {idx > 0 && <span className="text-[#b8860b]">{'>'}</span>}
                {crumb.path ? (
                  <button
                    onClick={() => window.location.href = crumb.path}
                    className="flex bg-transparent items-center gap-1 text-[#6b5342] hover:text-[#b8860b] transition-colors whitespace-nowrap"
                  >
                    {idx === 0 && <Home size={14} />}
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

          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 style={{ fontFamily: headerFont }} className="text-xl md:text-2xl font-bold text-[#3b1b12] mb-1">
                  My Orders
                </h1>
                <p className="text-[#6b5342] text-xs md:text-sm">Track and manage your orders</p>
              </div>
              <button
                onClick={() => window.location.href = '/products'}
                className="flex items-center gap-2 bg-transparent border-2 border-[#b8860b] text-[#b8860b] px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-[#b8860b] hover:text-white transition-all"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">Error</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 bg-transparent">×</button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Orders', icon: <Package size={12} /> },
              { key: 'active', label: 'Active', icon: <Clock size={12} /> },
              { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={12} /> },
              { key: 'cancelled', label: 'Cancelled', icon: <XCircle size={12} /> }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedFilter === filter.key
                    ? 'bg-[#b8860b] text-white'
                    : 'bg-white text-[#6b5342] border border-[#efe6d9] hover:border-[#b8860b]'
                }`}
              >
                {filter.icon}
                {filter.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedFilter === filter.key ? 'bg-white/20' : 'bg-[#fbf6ef]'
                }`}>
                  {orderCounts[filter.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#efe6d9] p-8 md:p-12 text-center">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <h3 style={{ fontFamily: headerFont }} className="text-lg md:text-xl font-bold text-[#3b1b12] mb-2">
                No Orders Found
              </h3>
              <p className="text-[#6b5342] text-sm mb-4 md:mb-6">
                {selectedFilter === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${selectedFilter} orders to display.`}
              </p>
              <button
                onClick={() => window.location.href = '/products'}
                className="bg-transparent border-2 border-[#b8860b] text-[#b8860b] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#b8860b] hover:text-white transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-[#efe6d9] overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-3 md:p-4 border-b border-[#efe6d9]">
                    <div className="flex items-start justify-between gap-3 md:gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 style={{ fontFamily: headerFont }} className="text-sm md:text-base font-bold text-[#3b1b12]">
                            {order.order_number}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 text-xs text-[#6b5342] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(order.created_at)}
                          </span>
                          {order.status !== 'cancelled' && (
                            <span className="flex items-center gap-1">
                              <Truck size={12} />
                              {order.status === 'delivered' ? 'Delivered' : 'Est.'}: {calculateEstimatedDelivery(order)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontFamily: headerFont }} className="text-base md:text-lg font-bold text-[#b8860b] mb-0.5">
                          {formatPrice(order.final_amount)}
                        </div>
                        <div className={`text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-3 md:p-4 bg-[#fbf6ef]">
                    <div className="space-y-2">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex gap-2 md:gap-3 items-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[#efe6d9] flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <Box className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs md:text-sm font-medium text-[#3b1b12] truncate">{item.product_name}</h4>
                            <p className="text-xs text-[#6b5342]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <div className="text-xs md:text-sm font-semibold text-[#3b1b12]">
                            {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <p className="text-xs text-[#6b5342] text-center pt-1">
                          +{order.items.length - 2} more item(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details Button */}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full p-2.5 md:p-3 bg-white border-t border-[#efe6d9] flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-[#b8860b] hover:bg-[#fbf6ef] transition-colors"
                  >
                    {expandedOrder === order.id ? 'Hide' : 'View'} Order Details
                    {expandedOrder === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="p-3 md:p-4 border-t border-[#efe6d9] space-y-3 md:space-y-4">
                      {/* All Items */}
                      <div>
                        <h4 className="font-semibold text-[#3b1b12] mb-2 md:mb-3 text-xs md:text-sm">Order Items</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-2 md:gap-3 p-2 md:p-3 bg-[#fbf6ef] rounded-lg">
                              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[#efe6d9] flex-shrink-0">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <Box className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs md:text-sm font-medium text-[#3b1b12] mb-1">{item.product_name}</h5>
                                <div className="text-xs text-[#6b5342] space-y-0.5">
                                  {item.sku && <p>SKU: {item.sku}</p>}
                                  {item.metal && <p>Metal: {item.metal} {item.metal_purity}</p>}
                                  {item.stone && <p>Stone: {item.stone}</p>}
                                  <p>Quantity: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs md:text-sm font-semibold text-[#3b1b12]">
                                  {formatPrice(item.subtotal)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-white rounded-lg p-3 md:p-4 border border-[#efe6d9]">
                        <h4 className="font-semibold text-[#3b1b12] mb-2 md:mb-3 text-xs md:text-sm">Price Details</h4>
                        <div className="space-y-2 text-xs md:text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6b5342]">Subtotal</span>
                            <span className="text-[#3b1b12]">{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5342]">Tax (3%)</span>
                            <span className="text-[#3b1b12]">{formatPrice(order.tax_amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6b5342]">Shipping</span>
                            <span className="text-[#3b1b12]">
                              {order.shipping_amount === 0 ? (
                                <span className="text-green-600">FREE</span>
                              ) : (
                                formatPrice(order.shipping_amount)
                              )}
                            </span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span className="flex items-center gap-1">
                                <Tag size={12} />
                                Discount {order.coupon_code && `(${order.coupon_code})`}
                              </span>
                              <span>-{formatPrice(order.discount_amount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-[#efe6d9] font-semibold">
                            <span className="text-[#3b1b12]">Total Amount</span>
                            <span style={{ fontFamily: headerFont }} className="text-[#b8860b]">
                              {formatPrice(order.final_amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-white rounded-lg p-3 md:p-4 border border-[#efe6d9]">
                        <h4 className="font-semibold text-[#3b1b12] mb-2 md:mb-3 text-xs md:text-sm flex items-center gap-2">
                          <MapPin size={14} className="text-[#b8860b]" />
                          Delivery Address
                        </h4>
                        <div className="text-xs md:text-sm">
                          <p className="font-medium text-[#3b1b12] mb-1">{order.shipping_name}</p>
                          <p className="text-[#6b5342] mb-1">
                            {order.shipping_address}
                            {order.shipping_landmark && `, ${order.shipping_landmark}`}
                          </p>
                          <p className="text-[#6b5342] mb-2">
                            {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                          </p>
                          <div className="flex items-center gap-3 md:gap-4 text-xs text-[#6b5342] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {order.shipping_phone}
                            </span>
                            {order.shipping_email && (
                              <span className="flex items-center gap-1">
                                <Mail size={12} />
                                {order.shipping_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.tracking_number && (
                        <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-200">
                          <h4 className="font-semibold text-[#3b1b12] mb-2 md:mb-3 text-xs md:text-sm flex items-center gap-2">
                            <Truck size={14} className="text-blue-600" />
                            Tracking Information
                          </h4>
                          <div className="text-xs md:text-sm space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#6b5342]">Tracking Number:</span>
                              <span className="font-mono font-semibold text-[#3b1b12]">{order.tracking_number}</span>
                            </div>
                            {order.courier_partner && (
                              <div className="flex justify-between items-center">
                                <span className="text-[#6b5342]">Courier Partner:</span>
                                <span className="font-medium text-[#3b1b12]">{order.courier_partner}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div className="bg-white rounded-lg p-3 md:p-4 border border-[#efe6d9]">
                        <h4 className="font-semibold text-[#3b1b12] mb-2 md:mb-3 text-xs md:text-sm flex items-center gap-2">
                          <CreditCard size={14} className="text-[#b8860b]" />
                          Payment Information
                        </h4>
                        <div className="flex items-center gap-3 p-2 md:p-3 bg-[#fbf6ef] rounded-lg">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#3b1b12] text-xs md:text-sm capitalize">{order.payment_method}</p>
                            <p className="text-xs text-[#6b5342]">Secure payment gateway</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 rounded-lg p-3 md:p-4 border border-yellow-200">
                          <h4 className="font-semibold text-[#3b1b12] mb-2 text-xs md:text-sm">Order Notes</h4>
                          <p className="text-xs md:text-sm text-[#6b5342]">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage;