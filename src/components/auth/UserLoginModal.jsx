import React, { useState } from 'react';
import { Phone, Lock, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_BASE_URL || '';

export default function UserLoginModal({ open, onClose }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get login function from context

  if (!open) return null;

  const handleSendOTP = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        if (data.debug?.otp) setDebugOtp(data.debug.otp);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update auth context with user data
        login(data.data.token, data.data.user);

        // Close modal
        onClose && onClose();

        // Navigate back to 'from' or home
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start md:items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold">Sign in to your account</h3>
          <p className="text-sm text-gray-600">Login with your phone number</p>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        {debugOtp && <div className="mb-3 text-sm text-amber-700">Dev OTP: {debugOtp}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#b8860b]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-[#b8860b] text-white py-2 rounded hover:bg-[#9a7109] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-gray-100 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-2">One-time password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  className="w-full pl-10 pr-3 py-2 border rounded text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#b8860b]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-[#b8860b] text-white py-2 rounded hover:bg-[#9a7109] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                onClick={() => setStep('phone')} 
                className="flex-1 bg-gray-100 py-2 rounded hover:bg-gray-200"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}