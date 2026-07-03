import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import gsap from 'gsap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

// Register GSAP ScrollTrigger plugin globally
gsap.registerPlugin(ScrollTrigger);

// 3D Floating Gold Dust, Coins, and Sparkles Backdrop Effect via GSAP
const GoldDustBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleCount = 20;
    const particles = [];
    const activeTweens = [];
    const elements = [];

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      const type = Math.floor(Math.random() * 3); // 0: Coin, 1: Diamond, 2: Ambient Dust

      if (type === 0) {
        el.className = 'coin-3d-particle';
        const size = Math.random() * 10 + 6; // 6px to 16px
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      } else if (type === 1) {
        el.className = 'diamond-3d-particle';
        const size = Math.random() * 7 + 4; // 4px to 11px
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      } else {
        el.className = 'dust-3d-particle';
        const size = Math.random() * 14 + 6; // 6px to 20px
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      }

      el.style.left = `${Math.random() * 100}%`;
      el.style.top = '105%';
      container.appendChild(el);
      particles.push(el);
      elements.push(el);

      const duration = Math.random() * 12 + 13; // 13s to 25s
      const delay = Math.random() * -25; // negative delay to distribute immediately

      gsap.set(el, {
        y: '0vh',
        x: 0,
        z: Math.random() * 180 - 90,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        opacity: Math.random() * 0.45 + 0.1
      });

      const t = gsap.to(el, {
        y: '-115vh',
        x: `+=${Math.random() * 120 - 60}`,
        rotationX: '+=720',
        rotationY: '+=1080',
        rotationZ: '+=360',
        duration: duration,
        delay: delay,
        repeat: -1,
        ease: 'none',
        modifiers: {
          x: (x) => {
            const time = Date.now() * 0.001;
            const floatVal = parseFloat(x) + Math.sin(time + i) * 0.5;
            return `${floatVal}px`;
          }
        }
      });
      activeTweens.push(t);
    }

    return () => {
      activeTweens.forEach(t => t.kill());
      elements.forEach(el => gsap.killTweensOf(el));
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    />
  );
};

// Guard for normal authenticated users
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-b-2 border-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return token ? children : <Navigate to="/login" replace />;
};

const AccessDenied = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login?redirect=/admin');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12 relative z-10 animate-fade-in">
      <div className="w-full max-w-md glass-panel p-8 rounded-lg text-center space-y-6 border border-red-500/20 shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-full text-red-500 animate-pulse">
            <ShieldAlert size={48} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-stone-900">Access Denied</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            You do not have administrative privileges to access this dashboard. If you believe this is an error, please sign in with an authorized account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center space-x-2 border border-gold-500/20 hover:border-gold-500 text-stone-700 hover:text-gold-600 bg-white py-3 rounded text-xs font-bold uppercase tracking-widest transition duration-300"
          >
            <ArrowLeft size={14} />
            <span>Go to Home</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center space-x-2 gold-gradient-bg text-black py-3 rounded text-xs font-bold uppercase tracking-widest transition duration-300 hover:opacity-90"
          >
            <LogOut size={14} />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Guard for admin dashboard
const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-b-2 border-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user && user.role !== 'admin') {
    return <AccessDenied />;
  }

  return children;
};

function App() {
  // Initialize Lenis smooth scroll globally
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-stone-900 relative">
            {/* Global 3D Gold Dust Background */}
            <GoldDustBackground />
            
            {/* Global Navigation */}
            <Navbar />
            
            {/* Page Content */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                
                {/* Guest Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected User Routes */}
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Global Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
