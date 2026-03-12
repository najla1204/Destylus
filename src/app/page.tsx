"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Building2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First, try to login using the API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem("userRole", data.user.role || "");
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("employeeId", data.user.employeeId || "");
        
        // Redirect based on role
        if (data.user.role === 'project_manager') {
          router.push("/dashboard");
        } else if (data.user.role === 'engineer') {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Fallback for hardcoded HR credentials if API login fails
        const credentials = {
          hr: { user: "rajakumaran", email: "rajakumaran.work@gmail.com", pass: "rajaraja27", role: "HR Manager" },
        };

        const validHR =
          (username === credentials.hr.user || username === credentials.hr.email) && password === credentials.hr.pass;

        if (validHR) {
          localStorage.setItem("userRole", credentials.hr.role);
          localStorage.setItem("userName", "HR Manager");
          localStorage.setItem("employeeId", "HR-0001"); // Mock employeeId for the fallback HR user
          router.push("/dashboard");
        } else {
          setError(data.error || "Invalid credentials. Please try again.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1541888087405-eb81f84d6b67?q=80&w=2671&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay for depth and contrast */}
      <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 bg-zinc-900/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          {/* Logo on Left */}
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Destylus Logo" className="h-16 sm:h-20 w-auto object-contain shadow-2xl" />
          </div>
          
          {/* Name on Right */}
          <div className="flex flex-col items-end text-right">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">
              Destylus Civil
            </h1>
            <p className="mt-1 text-[10px] sm:text-xs text-[#ffb600] tracking-[0.2em] uppercase font-bold">
              ERP Portal
            </p>
          </div>
        </div>

        <div className="pt-2">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              {/* Username / Email Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Username / Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ffb600]">
                    <User className="h-5 w-5 text-zinc-500 group-focus-within:text-[#ffb600] transition-colors" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-zinc-950/50 py-3 pl-11 pr-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ffb600]/80 focus:border-transparent transition-all sm:text-sm shadow-inner"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ffb600]">
                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-[#ffb600] transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-zinc-950/50 py-3 pl-11 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ffb600]/80 focus:border-transparent transition-all sm:text-sm shadow-inner"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-opacity hover:opacity-80"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-zinc-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900/50 text-[#ffb600] focus:ring-[#ffb600] focus:ring-offset-zinc-900/60"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-zinc-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-[#ffb600] hover:text-[#ffc833] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl backdrop-blur-md bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-sm tracking-wide text-red-200">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4">
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
                    "Sign in securely"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-zinc-900 px-4 text-zinc-500 rounded-full">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl border border-white/10 bg-zinc-950/50 text-sm font-semibold text-white shadow-inner hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                onClick={() => {
                  alert("Google Sign-In integration pending");
                }}
              >
                <div className="bg-white p-1 rounded-full mr-3 group-hover:bg-gray-100 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                </div>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
