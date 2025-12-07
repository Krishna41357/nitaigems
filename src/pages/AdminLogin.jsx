import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, Phone, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';

export default function AdminLogin() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin ) nav('/admin', { replace: true });
  }, [isAuthenticated, user, nav]);

  const sendOTP = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_BASE_URL}/admin/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const d = await r.json();
      if (r.ok && d.success) {
        setStep('otp');
        if (d.debug?.otp) setDebugOtp(d.debug.otp);
      } else setError(d.message || 'Failed to send OTP');
    } catch { setError('Network error'); }
    setLoading(false);
  };

  const verifyOTP = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_BASE_URL}/admin/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const d = await r.json();
      if (r.ok && d.success) {
        login(d.data.token, d.data.user);
        nav('/admin');
      } else setError(d.message || 'Verification failed');
    } catch { setError('Network error'); }
    setLoading(false);
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
            {step === 'phone' ? 'Enter phone to receive OTP' : 'Enter OTP sent to your phone'}
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
                <strong>Dev OTP:</strong> {debugOtp}
              </AlertDescription>
            </Alert>
          )}

          {step === 'phone' ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+919876543210" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10" required disabled={loading} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="otp" type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="pl-10 text-center text-lg tracking-widest" maxLength={6} required disabled={loading} autoFocus />
                </div>
                <p className="text-xs text-muted-foreground text-center">Sent to {phone}</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify & Login'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep('phone'); setOtp(''); setError(''); setDebugOtp(''); }} disabled={loading}>
                Change Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}