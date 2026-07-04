import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Award, Shield, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


const LOCAL_MOCK_FEATURED = [
  {
    _id: 'mock1',
    name: 'Eternal Heritage Gold Choker',
    sku: 'NK-HER-01',
    description: 'A traditional 22K hallmarked gold choker handcrafted by master artisans in Mumbai.',
    price: 185000,
    category: 'Necklaces',
    purity: '22K',
    weight: 24.5,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'],
    stock: 5
  },
  {
    _id: 'mock2',
    name: 'Royal Maharaja Signet Ring',
    sku: 'RG-SIG-02',
    description: 'An elegant 24K gold signet ring featuring intricate traditional filigree carvings.',
    price: 92000,
    category: 'Rings',
    purity: '24K',
    weight: 12.0,
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'],
    stock: 8
  },
  {
    _id: 'mock3',
    name: 'Divine Blossom Gold Jhumkas',
    sku: 'ER-DIV-03',
    description: 'Traditional heavy gold earrings designed for weddings and festive wear.',
    price: 135000,
    category: 'Earrings',
    purity: '22K',
    weight: 18.2,
    images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80'],
    stock: 4
  },
  {
    _id: 'mock4',
    name: 'Sleek Imperial Cuff Bangle',
    sku: 'BL-SLK-04',
    description: 'A contemporary 18K solid yellow gold flexible cuff bracelet, perfect for layered styling.',
    price: 78000,
    category: 'Bracelets',
    purity: '18K',
    weight: 10.4,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'],
    stock: 10
  }
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load featured products from server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        if (data.success && data.products.length > 0) {
          // Take first 4 as featured
          setFeaturedProducts(data.products.slice(0, 4));
        } else {
          setFeaturedProducts(LOCAL_MOCK_FEATURED);
        }
      } catch (err) {
        console.error('Failed to fetch catalog, using mock data:', err.message);
        setFeaturedProducts(LOCAL_MOCK_FEATURED);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // GSAP ScrollTrigger reveals
  useEffect(() => {
    // Cinematic video load anim
    gsap.fromTo('.cinematic-banner-video', 
      { scale: 1.15, filter: 'brightness(0.2)' },
      { scale: 1, filter: 'brightness(0.9)', duration: 1.6, ease: 'power3.out' }
    );

    const triggers = [];
    const animateOnScroll = (target, delay = 0) => {
      const t = gsap.fromTo(target,
        { 
          opacity: 0, 
          y: 60, 
          rotationX: 10, 
          transformPerspective: 1000, 
          transformOrigin: 'top center' 
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.1,
          delay: delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
      triggers.push(t);
    };

    animateOnScroll('.brand-values-section');
    animateOnScroll('.shop-category-section');
    animateOnScroll('.featured-creations-section');

    return () => {
      triggers.forEach(t => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, []);

  // GSAP 3D Hover Parallax handlers
  const handleValueCardMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const percentX = x / box.width;
    const percentY = y / box.height;
    
    const rX = (percentY - 0.5) * -16;
    const rY = (percentX - 0.5) * 16;

    gsap.to(card, {
      rotateX: rX,
      rotateY: rY,
      scale: 1.025,
      boxShadow: '0 12px 30px -10px rgba(212, 175, 55, 0.2)',
      borderColor: 'rgba(212, 175, 55, 0.4)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleValueCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: '0 4px 20px -2px rgba(212, 175, 55, 0.04)',
      borderColor: 'rgba(212, 175, 55, 0.18)',
      duration: 0.55,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleCategoryMouseMove = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('.category-image');
    const txt = card.querySelector('.category-text');
    
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const percentX = x / box.width;
    const percentY = y / box.height;
    
    const rX = (percentY - 0.5) * -20;
    const rY = (percentX - 0.5) * 20;
    const tX = (percentX - 0.5) * -16;
    const tY = (percentY - 0.5) * -16;

    gsap.to(card, {
      rotateX: rX,
      rotateY: rY,
      scale: 1.035,
      borderColor: 'rgba(212, 175, 55, 0.45)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    if (img) {
      gsap.to(img, {
        x: tX,
        y: tY,
        scale: 1.14,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
    
    if (txt) {
      gsap.to(txt, {
        z: 45,
        color: '#d4af37',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };

  const handleCategoryMouseLeave = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('.category-image');
    const txt = card.querySelector('.category-text');
    
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      borderColor: 'rgba(212, 175, 55, 0.1)',
      duration: 0.55,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    if (img) {
      gsap.to(img, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
    
    if (txt) {
      gsap.to(txt, {
        z: 0,
        color: '#e5e7eb',
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };



  return (
    <div className="flex flex-col space-y-16 md:space-y-28 pb-20 md:pb-32">
      {/* 1. Brand Cinematic Banner (3D Animation) */}
      <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center text-center">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="cinematic-banner-video absolute inset-0 w-full h-full object-cover opacity-75"
        >
          <source src="/videos/showcase.mp4" type="video/mp4" />
        </video>
        
        {/* 35% Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/35 z-10" />

        {/* Centered Typography & CTA Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center h-full text-white space-y-6 md:space-y-8 select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="space-y-4"
          >
            <span className="text-gold-400 uppercase tracking-[0.35em] text-xs font-semibold block">
              Aryansh Gold Exclusive
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-widest uppercase text-white drop-shadow-lg leading-tight">
              Timeless Luxury, <br className="hidden sm:inline" /> Crafted for You
            </h1>
            <p className="text-sm sm:text-base md:text-lg max-w-xl mx-auto text-stone-200 font-light tracking-wide leading-relaxed font-sans">
              Experience the heritage of generational craftsmanship, sculpted in pure 22K & 24K gold masterworks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          >
            <Link
              to="/catalog"
              className="inline-block gold-gradient-bg text-black hover:bg-gold-500 hover:text-white px-8 py-3.5 rounded text-xs font-bold uppercase tracking-widest transition duration-300 shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 border border-gold-400 animate-pulse"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 2. Brand Value Indicators */}
      <div className="brand-values-section max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          onMouseMove={handleValueCardMouseMove}
          onMouseLeave={handleValueCardMouseLeave}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="glass-panel p-6 rounded flex items-start space-x-4 border border-gold-500/10 hover:border-gold-500/20 transition-all duration-300 cursor-pointer select-none"
        >
          <Award className="text-gold-500 mt-1 shrink-0" size={32} style={{ transform: 'translateZ(20px)' }} />
          <div style={{ transform: 'translateZ(10px)' }}>
            <h3 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-sm mb-1">BIS Hallmarked Jewelry</h3>
            <p className="text-xs text-stone-500 leading-relaxed">Shop with absolute trust. We guarantee the purity of all 18K, 22K, and 24K gold items.</p>
          </div>
        </div>
        <div 
          onMouseMove={handleValueCardMouseMove}
          onMouseLeave={handleValueCardMouseLeave}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="glass-panel p-6 rounded flex items-start space-x-4 border border-gold-500/10 hover:border-gold-500/20 transition-all duration-300 cursor-pointer select-none"
        >
          <Shield className="text-gold-500 mt-1 shrink-0" size={32} style={{ transform: 'translateZ(20px)' }} />
          <div style={{ transform: 'translateZ(10px)' }}>
            <h3 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-sm mb-1">100% Insured Shipping</h3>
            <p className="text-xs text-stone-500 leading-relaxed">Insured transit across India. Your precious jewelry is fully secure until it reaches you.</p>
          </div>
        </div>
        <div 
          onMouseMove={handleValueCardMouseMove}
          onMouseLeave={handleValueCardMouseLeave}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="glass-panel p-6 rounded flex items-start space-x-4 border border-gold-500/10 hover:border-gold-500/20 transition-all duration-300 cursor-pointer select-none"
        >
          <Truck className="text-gold-500 mt-1 shrink-0" size={32} style={{ transform: 'translateZ(20px)' }} />
          <div style={{ transform: 'translateZ(10px)' }}>
            <h3 className="font-serif font-bold text-stone-850 uppercase tracking-wider text-sm mb-1">Insured Easy Exchanges</h3>
            <p className="text-xs text-stone-500 leading-relaxed">Exchange gold ornaments at contemporary market evaluations transparently in store.</p>
          </div>
        </div>
      </div>

      {/* 3. Shop by Category */}
      <div className="shop-category-section max-w-7xl mx-auto px-6 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-gold-500 font-semibold uppercase tracking-widest text-xs">Curated Masterpieces</span>
          <h2 className="text-3xl font-bold font-serif text-stone-900 uppercase tracking-wider">Shop by Category</h2>
          <div className="w-16 h-0.5 gold-gradient-bg mx-auto mt-1" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80', query: '?category=Rings' },
            { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80', query: '?category=Necklaces' },
            { name: 'Earrings', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80', query: '?category=Earrings' },
            { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80', query: '?category=Bracelets' },
            { name: 'Gold Coins', image: '/images/coin.png', query: '?category=Coins' }
          ].map((cat, i) => (
            <Link
              to={`/catalog${cat.query}`}
              key={i}
              onMouseMove={handleCategoryMouseMove}
              onMouseLeave={handleCategoryMouseLeave}
              className="group relative h-64 rounded-md overflow-hidden border border-gold-500/10 hover:border-gold-500/30 shadow-md flex flex-col justify-end p-4 transition-all duration-300"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />
              <img
                src={cat.image}
                alt={cat.name}
                className="category-image absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500"
              />
              <span className="category-text relative z-20 font-serif font-semibold tracking-wider text-base uppercase text-gray-200 group-hover:text-gold-500 transition duration-300">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>




      {/* 5. Featured Catalog */}
      <div className="featured-creations-section max-w-7xl mx-auto px-6 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-gold-500 font-semibold uppercase tracking-widest text-xs">Exquisite Showcase</span>
            <h2 className="text-3xl font-bold font-serif text-stone-900 uppercase tracking-wider">Featured Creations</h2>
            <div className="w-16 h-0.5 gold-gradient-bg" />
          </div>
          <Link
            to="/catalog"
            className="text-xs uppercase font-semibold tracking-widest text-gold-500 hover:text-stone-900 flex items-center space-x-1.5 transition"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel h-80 rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
