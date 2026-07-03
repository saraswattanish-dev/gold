import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
  const { login, token, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear errors on page mount
  useEffect(() => {
    clearError();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      const defaultRedirect = user.role === 'admin' ? '/admin' : '/';
      const redirect = searchParams.get('redirect') || defaultRedirect;
      navigate(redirect, { replace: true });
    }
  }, [token, user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-stone-900 gold-gradient-text">Welcome Back</h2>
          <p className="text-xs text-stone-500">Sign in to sync your cart and trace your jewelry purchases.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Email Address</label>
            <div className="relative flex items-center border border-gold-500/15 focus-within:border-gold-500 rounded bg-stone-50 py-2.5 px-3 transition-colors duration-300">
              <Mail size={16} className="text-stone-500 mr-2" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-stone-850 w-full placeholder-stone-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Password</label>
            <div className="relative flex items-center border border-gold-500/15 focus-within:border-gold-500 rounded bg-stone-50 py-2.5 px-3 transition-colors duration-300">
              <KeyRound size={16} className="text-stone-500 mr-2" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-stone-850 w-full placeholder-stone-400"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 gold-gradient-bg text-black py-3 rounded text-xs font-bold uppercase tracking-widest transition duration-300 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <div className="text-center text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
