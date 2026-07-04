import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingBag, Truck, ShieldCheck, Award, Info, Plus, Minus, ArrowLeft, Loader, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import GoldRing3D from '../components/GoldRing3D';

// Interactive 3D Rotation Showcase for Ornaments
const Product3DViewer = ({ image, name }) => {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startRotX, setStartRotX] = useState(0);
  const [startRotY, setStartRotY] = useState(0);

  // Auto-rotate showcase spinner when not dragging
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotationY((prev) => (prev + 0.4) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches[0].clientX);
    setStartY(e.clientY || e.touches[0].clientY);
    setStartRotX(rotationX);
    setStartRotY(rotationY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    setRotationY(startRotY + deltaX * 0.7);
    setRotationX(Math.max(-30, Math.min(30, startRotX - deltaY * 0.7)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Luxury golden sparkling particles data
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    top: `${20 + (i * 29) % 60}%`,
    left: `${15 + (i * 37) % 70}%`,
    size: (i % 3) + 2,
    delay: `${(i * 0.4).toFixed(1)}s`
  }));

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Depth Card Container wrapper */}
      <div
        className="relative w-[80%] h-[80%] transition-transform duration-75 ease-out flex items-center justify-center"
        style={{
          transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Floating Sparks */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gold-400 animate-pulse opacity-55 pointer-events-none"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              transform: 'translateZ(50px)',
              boxShadow: '0 0 10px #d4af37'
            }}
          />
        ))}

        {/* Under-shadow */}
        <div
          className="absolute w-4/5 h-8 bg-black/10 rounded-full blur-xl bottom-1 pointer-events-none"
          style={{
            transform: 'translateZ(-50px) rotateX(90deg)',
          }}
        />

        {/* Jewelry PNG */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_15px_30px_rgba(212,175,55,0.25)]"
          style={{
            transform: 'translateZ(25px)',
          }}
        />

        {/* Glare/Shine overlay dynamic */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            transform: 'translateZ(27px)',
            background: `linear-gradient(${rotationY + 135}deg, rgba(255,255,255,0) 35%, rgba(255,244,175,0.2) 48%, rgba(255,255,255,0.35) 50%, rgba(255,244,175,0.2) 52%, rgba(255,255,255,0) 65%)`,
            mixBlendMode: 'overlay'
          }}
        />
      </div>
      
      {/* Helper guide */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-stone-900/10 border border-stone-900/5 text-[9px] font-bold text-stone-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
        Drag to Rotate 3D
      </div>
    </div>
  );
};


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [is3DMode, setIs3DMode] = useState(false);

  // Load single product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        if (data.success) {
          setProduct(data.product);
          setSelectedImage(data.product.images[0]);
          
          // Fetch related category products
          const relatedResponse = await axios.get(`/api/products?category=${data.product.category}`);
          if (relatedResponse.data.success) {
            // Filter current product out
            const filtered = relatedResponse.data.products.filter(p => p._id !== data.product._id);
            setRelatedProducts(filtered.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size={36} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="font-serif text-2xl text-stone-800">Jewelry Piece Not Found</h2>
        <p className="text-sm text-stone-500">The product SKU or ID may have been deleted or archived.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center space-x-2 gold-gradient-bg text-black font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded hover:opacity-90"
        >
          <ArrowLeft size={14} />
          <span>Back to Collections</span>
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col space-y-16 md:space-y-24">
      {/* Back Button */}
      <Link to="/catalog" className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-wider text-gray-400 hover:text-gold-500 transition w-fit">
        <ArrowLeft size={14} />
        <span>Back to Collections</span>
      </Link>

      {/* Product Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        {/* Left Side: Images Viewer */}
        <div className="space-y-4">
          <div className="relative glass-panel aspect-square rounded-lg overflow-hidden bg-stone-50 border border-gold-500/15 flex items-center justify-center">
            {is3DMode ? (
              product.category?.toLowerCase() === 'rings' ? (
                <GoldRing3D />
              ) : (
                <Product3DViewer image={selectedImage} name={product.name} />
              )
            ) : (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            )}
            
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`absolute bottom-4 right-4 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
                is3DMode
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'bg-white/90 text-gold-600 border-gold-500/15 hover:bg-gold-500 hover:text-white'
              }`}
            >
              <Sparkles size={12} className={is3DMode ? 'animate-spin' : ''} />
              <span>{is3DMode ? '2D View' : '3D Interactive View'}</span>
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3.5 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded border overflow-hidden shrink-0 transition-all ${
                    selectedImage === img ? 'border-gold-500 scale-95' : 'border-gold-500/10 hover:border-gold-500/35'
                  }`}
                >
                  <img src={img} alt={`${product.name}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and Description */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2 border-b border-gold-500/10 pb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2.5 py-1 rounded w-fit block">
              {product.purity} Gold Certified
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900 tracking-wide leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-stone-500">SKU: <strong className="text-stone-700 uppercase">{product.sku}</strong></p>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="text-xs text-stone-500 uppercase tracking-widest">Inclusive of all taxes</div>
            <div className="text-3xl font-bold font-serif text-gold-500">{formatPrice(product.price)}</div>
          </div>

          {/* Short Specs Box */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 border border-gold-500/15 p-4 rounded">
            <div>
              <span className="text-[10px] uppercase text-stone-500 block">Metal Weight</span>
              <strong className="text-sm text-stone-800">{product.weight} grams</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-500 block">Category</span>
              <strong className="text-sm text-stone-800">{product.category}</strong>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-600">Description</h3>
            <p className="text-xs leading-relaxed text-stone-600">{product.description}</p>
          </div>

          {/* Stock and Quantity Adjuster */}
          <div className="space-y-4 pt-4 border-t border-gold-500/10">
            {product.stock > 0 ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-stone-500">Quantity:</span>
                <div className="flex items-center border border-gold-500/20 rounded overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-gold-500/10 text-stone-500 hover:text-gold-500 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold text-stone-800 bg-stone-100/80">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-gold-500/10 text-gray-400 hover:text-gold-500 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-500">{product.stock} items available</span>
              </div>
            ) : (
              <div className="text-red-400 text-sm font-semibold">Out of Stock currently</div>
            )}

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center space-x-2 border border-gold-500/20 hover:border-gold-500 text-gold-500 hover:bg-gold-500/5 py-3.5 rounded text-xs font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-40"
              >
                <ShoppingBag size={14} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center space-x-2 gold-gradient-bg text-black py-3.5 rounded text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:opacity-90 disabled:opacity-40"
              >
                <span>Buy It Now</span>
              </button>
            </div>

            {/* Wishlist Action */}
            <button
              onClick={() => toggleWishlist(product)}
              className="flex items-center space-x-2 text-xs uppercase font-bold tracking-widest text-stone-500 hover:text-gold-500 transition mt-2 w-fit"
            >
              <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
              <span>{wishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Secure Trust Marks */}
          <div className="pt-6 border-t border-gold-500/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs sm:text-[10px] text-stone-500">
            <div className="flex flex-col sm:flex-col items-center space-y-1">
              <Award className="text-gold-500" size={18} />
              <span>100% BIS Hallmarked</span>
            </div>
            <div className="flex flex-col sm:flex-col items-center space-y-1">
              <ShieldCheck className="text-gold-500" size={18} />
              <span>Secured Transit</span>
            </div>
            <div className="flex flex-col sm:flex-col items-center space-y-1">
              <Info className="text-gold-500" size={18} />
              <span>Certified Weight</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-10 border-t border-gold-500/10">
          <div className="space-y-2">
            <span className="text-gold-500 font-semibold uppercase tracking-widest text-xs">Exquisite Selections</span>
            <h2 className="text-2xl font-bold font-serif text-stone-900 uppercase tracking-wider">Related Creations</h2>
            <div className="w-12 h-0.5 gold-gradient-bg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div className="scale-95 hover:scale-100 transition-all duration-300" key={p._id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
