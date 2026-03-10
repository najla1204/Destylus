"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage (in production, use secure cookies)
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('Login successful! Redirecting...');
      setMessageType('success');

      // Redirect based on user role
      setTimeout(() => {
        switch (data.user.role) {
          case 'project_manager':
            router.push('/pm');
            break;
          case 'engineer':
            router.push('/engineer/attendance');
            break;
          case 'hr':
            router.push('/hr/reports');
            break;
          default:
            router.push('/dashboard');
        }
      }, 1500);

    } catch (error: any) {
      setMessage(error.message || 'Login failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1541888087405-eb81f84d6b67?q=80&w=2671&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay for depth and contrast */}
      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm z-0"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-zinc-900/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md">
        <div>
          {/* Logo / Brand Accent */}
          <div className="mx-auto h-16 w-16 bg-[#ffb600] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,182,0,0.25)]">
            <Building2 className="h-8 w-8 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="mt-8 text-center text-3xl font-extrabold text-white tracking-tight">
            Centralized Access
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Sign in to manage construction progress
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ffb600]">
                  <User className="h-5 w-5 text-zinc-500 group-focus-within:text-[#ffb600] transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-11 pr-3 py-3 border border-white/10 placeholder-zinc-600 text-white bg-zinc-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb600]/80 focus:border-transparent transition-all sm:text-sm shadow-inner"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-[#ffb600] transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-11 pr-10 py-3 border border-white/10 placeholder-zinc-600 text-white bg-zinc-950/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffb600]/80 focus:border-transparent transition-all sm:text-sm shadow-inner"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-opacity hover:opacity-80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl backdrop-blur-md ${
                  messageType === 'success'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
                }`}>
                <div className="flex items-center">
                  <AlertCircle className={`h-4 w-4 mr-2 ${
                    messageType === 'success' ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <span className={`text-sm tracking-wide ${
                    messageType === 'success' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {message}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-[#ffb600] hover:bg-[#ffc833] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-[#ffb600] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_20px_rgba(255,182,0,0.15)] hover:shadow-[0_0_25px_rgba(255,182,0,0.3)]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in securely'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
            Project Destylus
          </p>
        </div>
      </div>
    </div>
  );
}
