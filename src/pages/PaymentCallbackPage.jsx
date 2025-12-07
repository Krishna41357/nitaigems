// src/pages/PaymentCallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import MainHeader from '../components/homepage/MainHeader';
import Navigation from '../components/homepage/Navigation';
import Footer from '../components/homepage/Footer';

const PaymentCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [orderDetails, setOrderDetails] = useState(null);
  const [message, setMessage] = useState('Processing your payment...');

  const headerFont = "'Cinzel', 'Playfair Display', serif";

  useEffect(() => {
    // Get payment status from URL params
    const paymentStatus = searchParams.get('status');
    const merchantTransactionId = searchParams.get('merchantTransactionId');
    const orderId = searchParams.get('orderId');

    if (paymentStatus === 'success') {
      setStatus('success');
      setMessage('Payment successful! Your order has been placed.');
      // Optionally fetch order details
      if (orderId) {
        fetchOrderDetails(orderId);
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'error') {
      setStatus('failed');
      setMessage('Payment failed. Please try again or contact support.');
    } else {
      // If no status, verify with backend
      if (merchantTransactionId) {
        verifyPaymentStatus(merchantTransactionId);
      } else {
        setTimeout(() => {
          setStatus('failed');
          setMessage('Invalid payment response.');
        }, 2000);
      }
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (merchantTransactionId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/payments/phonepe/status/${merchantTransactionId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'PAYMENT_SUCCESS') {
          setStatus('success');
          setMessage('Payment verified successfully!');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed.');
        }
      } else {
        setStatus('failed');
        setMessage('Unable to verify payment status.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Error verifying payment.');
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/orders/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setOrderDetails(result.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/account/orders');
  };

  const handleRetry = () => {
    navigate('/cart');
  };

  return (
    <>
      <MainHeader />
      <div className="bg-[#fbf6ef] min-h-screen w-full">
        <div className="w-full mx-auto px-4 md:px-8 py-6">
          <Navigation />
          
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-xl shadow-lg border border-[#efe6d9] p-8 md:p-12 text-center">
              {status === 'processing' && (
                <>
                  <div className="mb-6">
                    <Loader className="w-16 h-16 text-[#b8860b] mx-auto animate-spin" />
                  </div>
                  <h2 style={{ fontFamily: headerFont }} className="text-2xl md:text-3xl font-bold text-[#3b1b12] mb-4">
                    Processing Payment
                  </h2>
                  <p className="text-[#6b5342] mb-6">
                    Please wait while we confirm your payment...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  </div>
                  <h2 style={{ fontFamily: headerFont }} className="text-2xl md:text-3xl font-bold text-[#3b1b12] mb-4">
                    Payment Successful!
                  </h2>
                  <p className="text-[#6b5342] mb-6">
                    {message}
                  </p>
                  
                  {orderDetails && (
                    <div className="bg-[#fbf6ef] rounded-lg p-6 mb-8 text-left">
                      <h3 className="font-semibold text-[#3b1b12] mb-4">Order Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6b5342]">Order Number:</span>
                          <span className="font-semibold text-[#3b1b12]">{orderDetails.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b5342]">Total Amount:</span>
                          <span className="font-semibold text-[#3b1b12]">
                            ₹{Number(orderDetails.final_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b5342]">Payment Status:</span>
                          <span className="font-semibold text-green-600">Paid</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleViewOrders}
                      className="px-8 py-3 bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white rounded-lg font-semibold hover:from-[#a06f09] hover:to-[#b8860b] transition-all"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="px-8 py-3 border-2 border-[#b8860b] text-[#b8860b] rounded-lg font-semibold hover:bg-[#b8860b] hover:text-white transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}

              {status === 'failed' && (
                <>
                  <div className="mb-6">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                  </div>
                  <h2 style={{ fontFamily: headerFont }} className="text-2xl md:text-3xl font-bold text-[#3b1b12] mb-4">
                    Payment Failed
                  </h2>
                  <p className="text-[#6b5342] mb-6">
                    {message}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleRetry}
                      className="px-8 py-3 bg-gradient-to-r from-[#b8860b] to-[#d4a055] text-white rounded-lg font-semibold hover:from-[#a06f09] hover:to-[#b8860b] transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="px-8 py-3 border-2 border-gray-300 text-[#6b5342] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              )}

              <div className="mt-8 pt-8 border-t border-[#efe6d9]">
                <p className="text-xs text-[#6b5342]">
                  Need help? Contact our support at{' '}
                  <a href="mailto:support@yourstore.com" className="text-[#b8860b] hover:underline">
                    support@yourstore.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentCallbackPage;