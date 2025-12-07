import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Phone, Lock, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://nitai-gems-backend.nitai-gems-backend.workers.dev';

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState(''); // For development
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated and clear any errors
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
    // Clear any existing errors when component mounts
    setError('');
  }, [isAuthenticated, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Sending admin OTP to:', phone);
    console.log('API URL:', `${API_BASE_URL}/admin/auth/send-otp`);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setStep('otp');
        // Store debug OTP if available (for development)
        if (data.debug?.otp) {
          setDebugOtp(data.debug.otp);
          console.log('Development OTP:', data.debug.otp);
        }
      } else {
        // Handle both API errors and HTTP errors
        setError(data.message || `Failed to send OTP (${response.status})`);
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Admin verification already done on backend
        // Login successful
        login(data.data.token, data.data.user);
        navigate('/admin');
      } else {
        // Handle both API errors and HTTP errors
        setError(data.message || `Verification failed (${response.status})`);
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setDebugOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your phone number to receive OTP' 
              : 'Enter the OTP sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {debugOtp && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                <strong>Development OTP:</strong> {debugOtp}
              </AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Sent to {phone}
                </p>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Change Phone Number
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}