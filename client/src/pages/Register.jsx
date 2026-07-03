import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, ArrowRight, Loader, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register, token, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear errors on page mount
  useEffect(() => {
    clearError();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await register(name, email, password, 'user');
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-stone-900 gold-gradient-text">Create Account</h2>
          <p className="text-xs text-stone-500">Sign up to buy certified jewelry and track shipments.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Full Name</label>
            <div className="relative flex items-center border border-gold-500/15 focus-within:border-gold-500 rounded bg-stone-50 py-2.5 px-3 transition-colors duration-300">
              <User size={16} className="text-stone-500 mr-2" />
              <input
                type="text"
                required
                placeholder="Aryansh Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-stone-850 w-full placeholder-stone-400"
              />
            </div>
          </div>

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
                placeholder="•••••• (min 6 characters)"
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
                <span>Sign Up</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <div className="text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-500 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
