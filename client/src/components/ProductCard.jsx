import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product._id);

  // 3D Parallax Tilt States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const percentX = x / box.width;
    const percentY = y / box.height;
    
    // Tilt calculations (-10 to 10 deg)
    const rX = (percentY - 0.5) * -20;
    const rY = (percentX - 0.5) * 20;

    setRotateX(rX);
    setRotateY(rY);
    
    // Glare reflections percent coordinates
    setGlareX(percentX * 100);
    setGlareY(percentY * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
  };

  // Format price in Indian Rupee
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const isTilted = rotateX !== 0 || rotateY !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, rotateX: 12, translateZ: -50 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, translateZ: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative glass-panel rounded-lg overflow-hidden flex flex-col h-full hover:border-gold-500/40 transition-shadow duration-300 shadow-md hover:shadow-gold-500/10 cursor-pointer select-none"
      style={{
        transform: isTilted
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(1000px)',
        transformStyle: 'preserve-3d',
        transition: isTilted ? 'none' : 'transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Product Image Container */}
      <div 
        className="relative overflow-hidden aspect-square w-full bg-stone-50"
        style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
      >
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images && product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Wishlist Button Overlay */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 border border-gold-500/15 flex items-center justify-center text-stone-600 hover:text-red-500 hover:border-red-500/20 transition-all duration-300 shadow-sm"
          style={{ transform: 'translateZ(25px)' }}
        >
          <Heart
            size={16}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-600 transition-colors'}
          />
        </button>

        {/* Category & Purity Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5" style={{ transform: 'translateZ(25px)' }}>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-gold-500 text-white px-2 py-0.5 rounded shadow">
            {product.purity}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/90 border border-gold-500/15 text-gold-600 px-2 py-0.5 rounded shadow">
            {product.weight}g
          </span>
        </div>

        {/* Interactive card shine glare */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)`,
            mixBlendMode: 'overlay',
            transform: 'translateZ(22px)'
          }}
        />
      </div>

      {/* Product Details */}
      <div 
        className="p-4 flex flex-col flex-grow bg-white"
        style={{ transform: 'translateZ(10px)' }}
      >
        <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
          {product.category}
        </div>
        <Link to={`/product/${product._id}`} className="hover:text-gold-500 transition duration-300 flex-grow">
          <h3 className="font-serif text-sm font-semibold tracking-wide text-stone-800 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between border-t border-gold-500/5 pt-3">
          <span className="font-serif font-bold text-base text-gold-500">
            {formatPrice(product.price)}
          </span>
          
          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="flex items-center space-x-1.5 border border-gold-500/20 hover:border-gold-500 hover:bg-gold-500 hover:text-white text-gold-600 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gold-500"
          >
            <ShoppingCart size={12} />
            <span>{product.stock <= 0 ? 'Out of stock' : 'Add'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
