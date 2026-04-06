'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser, registerUser } from '@/lib/authActions';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('m') === 'register' ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Restaurant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password, role);
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full glass-card p-10 rounded-3xl animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2 mb-10">
        <Link href="/">
          <span className="text-2xl font-black text-gradient cursor-pointer">AR Food SaaS</span>
        </Link>
        <h2 className="text-3xl font-black text-gray-900 mt-4 leading-tight">
          {isLogin ? 'Welcome Back!' : 'Join the Future of Dining.'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isLogin ? "Sign in to manage your menu." : "Start your free trial today."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 bg-gray-100 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 shadow-inner"
              placeholder="chef@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-gray-100 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="animate-in slide-in-from-top duration-300">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Account Type</label>
              <select
                className="w-full px-5 py-4 bg-gray-100 border border-transparent focus:bg-white focus:border-orange-500 rounded-2xl outline-none transition font-bold text-gray-900 shadow-inner"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Restaurant">Restaurant Owner</option>
                <option value="Customer">Food Enthusiast</option>
                <option value="Admin">Platform Admin</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition shadow-xl transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <div className="text-center text-sm font-bold text-gray-500">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:text-orange-700 transition"
          >
            {isLogin ? "New here? Create an account." : "Already have an account? Log in."}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Suspense fallback={<div className="max-w-md w-full glass-card p-10 rounded-3xl text-center font-bold text-orange-600 animate-pulse">Loading Authentication...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
