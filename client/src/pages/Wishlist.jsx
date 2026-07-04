import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 mb-2">
          <Heart size={28} />
        </div>
        <h2 className="font-serif text-2xl text-stone-850">Your Wishlist is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm">Save your favorite gold chokers, signet rings, or bracelets here to review them later.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center space-x-2 gold-gradient-bg text-black font-semibold text-xs uppercase tracking-widest px-6 py-3.5 rounded hover:opacity-90 transition shadow-lg shadow-gold-500/10"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col space-y-8 md:space-y-12">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase">My Wishlist</h1>
        <p className="text-xs text-stone-500">You have {wishlist.length} saved ornaments.</p>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product._id}
            className="group relative glass-panel rounded-lg overflow-hidden flex flex-col h-full hover:border-gold-500/35 transition-all duration-300 shadow-lg"
          >
            {/* Image Wrapper */}
            <div className="relative aspect-square w-full bg-stone-50">
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.images && product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Remove button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 border border-gold-500/15 flex items-center justify-center text-stone-500 hover:text-red-500 hover:border-red-500/30 transition shadow-sm"
              >
                <X size={14} />
              </button>

              {/* Badge Overlay */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                <span className="text-[9px] uppercase font-bold tracking-wider bg-gold-500 text-white px-1.5 py-0.5 rounded">
                  {product.purity}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider bg-white/90 border border-gold-500/15 text-gold-650 px-1.5 py-0.5 rounded shadow-sm">
                  {product.weight}g
                </span>
              </div>
            </div>

            {/* Information Card content */}
            <div className="p-4 flex flex-col flex-grow space-y-3">
              <div className="flex-grow space-y-1">
                <span className="text-[10px] text-stone-500 uppercase tracking-widest block">{product.category}</span>
                <Link to={`/product/${product._id}`} className="hover:text-gold-500 transition duration-300">
                  <h3 className="font-serif text-xs font-semibold text-stone-850 line-clamp-1">{product.name}</h3>
                </Link>
                <span className="font-serif text-sm font-bold text-gold-500 block">{formatPrice(product.price)}</span>
              </div>

              {/* Add to Bag and Remove */}
              <button
                onClick={() => {
                  addToCart(product, 1);
                  toggleWishlist(product); // Remove from wishlist on cart add
                }}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center space-x-1.5 border border-gold-500/20 hover:border-gold-500 hover:bg-gold-500 hover:text-white text-gold-500 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-300 disabled:opacity-40"
              >
                <ShoppingCart size={12} />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
