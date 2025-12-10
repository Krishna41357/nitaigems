// UserLoginModal.jsx - FIXED VERSION with proper VAPID key handling
import React, { useState, useEffect } from 'react';
import { Phone, Lock, Loader2, Bell, CheckCircle, Zap, AlertTriangle, BellRing } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_APP_BASE_URL || '';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export default function UserLoginModal({ open, onClose }) {
  const [step, setStep] = useState('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('sms');
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Push prompt state
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [loginData, setLoginData] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // ==========================================
  // PUSH NOTIFICATION FUNCTIONS
  // ==========================================

  const urlBase64ToUint8Array = (base64String) => {
    try {
      // Remove any whitespace and newlines
      base64String = base64String.trim();
      
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID public key format');
    }
  };

  // Add this function to check service worker status
const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log('Service Worker registered:', registration.scope);
        return true;
      } else {
        console.log('No Service Worker registered');
        return false;
      }
    } catch (error) {
      console.error('Service Worker check failed:', error);
      return false;
    }
  }
  return false;
};


  // In UserLoginModal.jsx, update the service worker registration part:
const requestPushPermission = async (token) => {
  try {
    console.log('🔔 Starting push notification setup...');
    
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key is not configured');
    }

    // Check all required APIs
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Browser does not support push notifications');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    // Register service worker with better error handling
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('✅ Service worker registered:', registration.scope);
    } catch (swError) {
      console.error('SW registration failed:', swError);
      throw new Error('Service worker registration failed. Make sure sw.js is in your public folder.');
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');

    // Convert VAPID key
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Get existing subscription
    let existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('📋 Found existing subscription');
      
      // Try to use existing subscription first
      try {
        const response = await fetch(`${API_BASE}/user/push/enable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            subscription: existingSubscription.toJSON() // Convert to JSON
          })
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('pushEnabled', 'true');
          return true;
        }
      } catch (err) {
        console.log('Existing subscription invalid, creating new one');
        await existingSubscription.unsubscribe();
      }
    }

    // Create new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log('✅ New subscription created:', subscription);

    // Send to backend with proper formatting
    const response = await fetch(`${API_BASE}/user/push/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        subscription: subscription.toJSON() // Convert to JSON
      })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('pushEnabled', 'true');
      return true;
    } else {
      throw new Error(data.message || 'Server rejected subscription');
    }

  } catch (error) {
    console.error('❌ Push notification error:', error);
    alert(`Push notification error: ${error.message}`);
    return false;
  }
};

  const handlePushSetup = async (accept) => {
    if (accept && loginData) {
      const success = await requestPushPermission(loginData.token);
      if (success) {
        alert('🔔 Push notifications enabled! You\'ll receive OTPs instantly next time.');
      }
    } else {
      // User skipped - mark it so we don't ask again immediately (ask again after 7 days)
      localStorage.setItem('pushPromptSkipped', Date.now().toString());
    }
    
    setShowPushPrompt(false);
    
    // Now actually complete the login
    if (loginData) {
      login(loginData.token, loginData.user);
      onClose && onClose();
      
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  };
  // Add this test function to your component
const testPushNotification = async () => {
  try {
    console.log('🧪 Testing push notification...');
    
    // Check if push is enabled
    const pushEnabled = localStorage.getItem('pushEnabled') === 'true';
    if (!pushEnabled) {
      console.log('❌ Push not enabled');
      return;
    }
    
    // Get current subscription
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('❌ No subscription found');
      return;
    }
    
    console.log('📍 Using subscription:', subscription.endpoint);
    
    // Test the backend endpoint
    const response = await fetch(`${API_BASE}/test-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData?.token || 'test-token'}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        message: 'Hello from test!'
      })
    });
    
    const result = await response.json();
    console.log('🎯 Test result:', result);
    
    if (result.success) {
      alert('✅ Test notification sent! Check your device.');
    } else {
      alert('❌ Test failed: ' + result.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
    alert('❌ Test error: ' + error.message);
  }
};

// Add a test button in your UI
<button 
  onClick={testPushNotification}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Test Push Notification
</button>

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    const fullPhone = `${countryCode}${phone}`;

    fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: fullPhone })
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 200 && data.success) {
        setStep('otp');
        setSessionId(data.data.sessionId);
        setDeliveryMethod(data.data.deliveryMethod || 'sms');
        setIsNewUser(data.data.isNewUser || false);
        
        // In dev mode, show OTP in console ONLY if it came via SMS
        if (data.data.otp && data.data.deliveryMethod === 'sms') {
          console.log(`[DEV] SMS OTP for ${countryCode}${phone}:`, data.data.otp);
        }
        
        // If push was sent, don't log OTP (it's in the notification)
        if (data.data.deliveryMethod === 'push') {
          console.log(`[INFO] Push notification sent to device`);
        }
      } else {
        setError(data.message || 'Failed to send OTP');
        
        if (status === 429 && data.retryAfter) {
          setError(`${data.message} (${data.retryAfter}s remaining)`);
        }
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Send OTP error:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    });
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);

    const fullPhone = `${countryCode}${phone}`;

    fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: fullPhone,
        otp,
        sessionId
      })
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 200 && data.success) {
        
        // Check if we should show push prompt
        const pushEnabled = localStorage.getItem('pushEnabled') === 'true';
        const pushPromptSkipped = localStorage.getItem('pushPromptSkipped');
        const skippedRecently = pushPromptSkipped && 
          (Date.now() - parseInt(pushPromptSkipped)) < 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // Show push prompt if:
        // 1. User received SMS (not push) AND
        // 2. Push is not already enabled AND
        // 3. User hasn't skipped recently
        const shouldPrompt = deliveryMethod === 'sms' && 
                           !pushEnabled && 
                           !skippedRecently;
        
        if (shouldPrompt) {
          // Store login data but don't complete login yet - show push prompt first
          setLoginData({
            token: data.data.token,
            user: data.data.user
          });
          setShowPushPrompt(true);
          setLoading(false);
        } else {
          // Complete login immediately (either push is enabled or user skipped recently)
          login(data.data.token, data.data.user);
          onClose && onClose();
          
          const from = location.state?.from || '/';
          navigate(from, { replace: true });
        }
      } else {
        setError(data.message || 'Verification failed');
        setLoading(false);
        
        if (status === 429 && data.retryAfter) {
          setError(`${data.message} (${data.retryAfter}s remaining)`);
        }
      }
    })
    .catch(err => {
      console.error('Verify OTP error:', err);
      setError('Network error. Please check your connection.');
      setLoading(false);
    });
  };

  const handleBack = () => {
    setStep('phone');
    setCountryCode('+91');
    setPhone('');
    setOtp('');
    setSessionId('');
    setError('');
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('phone');
      setCountryCode('+91');
      setPhone('');
      setOtp('');
      setError('');
      setSessionId('');
      setShowPushPrompt(false);
      setDeliveryMethod('sms');
      setIsNewUser(false);
      setLoginData(null);
    }
  }, [open]);

  if (!open) return null;

  // ==========================================
  // PUSH NOTIFICATION PROMPT (FIXED FOR MOBILE)
  // ==========================================

  if (showPushPrompt) {
    return (
      <div className="fixed inset-0 z-[70] flex items-start md:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 md:p-8 m-4 my-4 md:my-0">
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <BellRing className="text-white" size={32} />
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Enable Instant OTP?
            </h3>
            
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Get your OTPs instantly through push notifications next time.
              <strong className="block mt-2 text-blue-600">No more waiting for SMS!</strong>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <ul className="text-xs md:text-sm text-left text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Instant delivery</strong> - No SMS delays</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Free forever</strong> - Save on SMS costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Works offline</strong> - Even when browser is closed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Secure</strong> - Same device login recognition</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePushSetup(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-medium transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Bell size={18} />
                Enable Push Notifications
              </button>
              <button
                onClick={() => handlePushSetup(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition active:scale-95"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 md:mt-4">
              💡 You can enable this anytime from Settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN LOGIN MODAL
  // ==========================================

  return (
    <div className="fixed inset-0 z-[60] flex items-start md:items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 my-4 md:my-0">
        
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#b8860b] to-[#9a7109] rounded-full flex items-center justify-center mx-auto mb-3">
            <Phone className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Sign in to your account</h3>
          <p className="text-sm text-gray-600 mt-1">Login with your phone number</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8860b] bg-white"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>

                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8860b]"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) setPhone(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && phone.length === 10) {
                        handleSendOTP();
                      }
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || phone.length !== 10}
                className="flex-1 bg-gradient-to-r from-[#b8860b] to-[#9a7109] text-white py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap size={18} className="mr-2" />
                    Send OTP
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveryMethod === 'sms' ? (
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Phone className="text-blue-600 mt-0.5" size={22} />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      📱 SMS OTP sent
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Check your messages for the code
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="text-purple-600 mt-0.5" size={22} />
                  <div>
                    <p className="text-sm font-semibold text-purple-900">
                      🔔 Push notification sent!
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Check your browser notifications
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#b8860b]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 6) {
                      handleVerifyOTP();
                    }
                  }}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-gradient-to-r from-[#b8860b] to-[#9a7109] text-white py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign in'
                )}
              </button>
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            {step === 'phone'
              ? 'OTP will be sent via SMS or push notification'
              : deliveryMethod === 'push'
              ? 'Check your browser notifications for the OTP'
              : 'Check your phone messages for the OTP code'
            }
          </p>
        </div>
      </div>
    </div>
  );
}