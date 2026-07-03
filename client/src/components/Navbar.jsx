import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart, User as UserIcon, Menu, X, Search, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogoutClick = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-gold-500/20 py-4 px-6 md:px-12 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl font-bold tracking-widest font-serif gold-gradient-text"
        >
          ARYANSH GOLD
        </motion.span>
      </Link>

      {/* Navigation Links - Desktop */}
      <div className="hidden lg:flex items-center space-x-8 text-sm uppercase tracking-widest font-semibold text-stone-600">
        <Link to="/" className="hover:text-gold-600 transition duration-300">Home</Link>
        <Link to="/catalog" className="hover:text-gold-600 transition duration-300">Collections</Link>
        <Link to="/catalog?category=Rings" className="hover:text-gold-600 transition duration-300">Rings</Link>
        <Link to="/catalog?category=Necklaces" className="hover:text-gold-600 transition duration-300">Necklaces</Link>
        <Link to="/catalog?category=Earrings" className="hover:text-gold-600 transition duration-300">Earrings</Link>
      </div>

      {/* Actions (Search, Wishlist, Cart, Profile) - Desktop */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-stone-300 hover:border-gold-500 focus-within:border-gold-500 py-1 transition duration-300">
          <input
            type="text"
            placeholder="Search jewelry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-stone-800 w-44 focus:w-56 transition-all duration-300 placeholder-stone-400 px-1"
          />
          <button type="submit" className="text-stone-500 hover:text-gold-600 transition">
            <Search size={16} />
          </button>
        </form>

        {/* Wishlist */}
        <Link to="/wishlist" className="relative text-stone-700 hover:text-gold-600 transition">
          <Heart size={20} />
          {wishlist.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </Link>

        {/* Cart */}
        <Link to="/cart" className="relative text-stone-700 hover:text-gold-600 transition">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-1 text-stone-700 hover:text-gold-600 transition focus:outline-none"
          >
            <UserIcon size={20} />
            {user && <span className="text-xs max-w-[80px] truncate hidden xl:inline font-semibold text-stone-700">{user.name.split(' ')[0]}</span>}
          </button>

          <AnimatePresence>
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-52 bg-white border border-gold-500/20 rounded shadow-xl py-2 z-20"
                >
                  {token && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gold-500/10 text-xs text-stone-500">
                        Logged in as: <strong className="text-gold-600 block truncate">{user.email}</strong>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-stone-700 hover:bg-gold-500/10 hover:text-gold-600 transition"
                        >
                          <LayoutDashboard size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-stone-700 hover:bg-gold-500/10 hover:text-gold-600 transition"
                      >
                        <ClipboardList size={16} />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={handleLogoutClick}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-gold-500/10 hover:text-gold-600 transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gold-600 hover:bg-gold-500/10 transition font-semibold"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Actions & Menu Trigger */}
      <div className="flex lg:hidden items-center space-x-4">
        <Link to="/wishlist" className="relative text-stone-700 hover:text-gold-600">
          <Heart size={20} />
          {wishlist.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </Link>

        <Link to="/cart" className="relative text-stone-700 hover:text-gold-600">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-stone-700 hover:text-gold-600 focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 max-w-full bg-white border-l border-gold-500/20 shadow-2xl p-6 z-50 flex flex-col"
            >
              {/* Close Button */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif font-bold text-lg gold-gradient-text">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-stone-500 hover:text-gold-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center border border-gold-500/20 bg-stone-50 rounded px-3 py-2 mb-6">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-stone-800 w-full placeholder-stone-400"
                />
                <button type="submit" className="text-stone-500 hover:text-gold-600">
                  <Search size={18} />
                </button>
              </form>

              {/* Navigation Links - Mobile */}
              <div className="flex flex-col space-y-4 text-base uppercase tracking-widest font-semibold text-stone-600 flex-grow">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-600 py-2 border-b border-gold-500/5">Home</Link>
                <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-600 py-2 border-b border-gold-500/5">All Collections</Link>
                <Link to="/catalog?category=Rings" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-600 py-2 border-b border-gold-500/5">Rings</Link>
                <Link to="/catalog?category=Necklaces" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-600 py-2 border-b border-gold-500/5">Necklaces</Link>
                <Link to="/catalog?category=Earrings" onClick={() => setMobileMenuOpen(false)} className="hover:text-gold-600 py-2 border-b border-gold-500/5">Earrings</Link>
              </div>

              {/* Profile / Account Buttons - Mobile */}
              <div className="border-t border-gold-500/10 pt-6">
                {token && user ? (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-500 truncate">Logged in: <span className="text-gold-600 font-semibold">{user.email}</span></p>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2 w-full text-gold-600 bg-gold-500/10 hover:bg-gold-500/20 py-2.5 rounded justify-center text-sm font-semibold tracking-wide transition"
                      >
                        <LayoutDashboard size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 w-full text-stone-700 bg-stone-50 hover:bg-gold-500/5 border border-gold-500/10 py-2.5 rounded justify-center text-sm font-semibold tracking-wide transition"
                    >
                      <ClipboardList size={16} />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="flex items-center space-x-2 w-full text-red-600 bg-red-500/10 hover:bg-red-500/20 py-2.5 rounded justify-center text-sm font-semibold transition"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center text-stone-700 border border-stone-300 rounded py-2 text-sm uppercase tracking-wider font-bold hover:border-gold-500 hover:text-gold-600 transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gold-gradient-bg text-black rounded py-2 text-sm uppercase tracking-wider font-bold hover:opacity-90 transition"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
