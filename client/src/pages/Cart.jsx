import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // GST for gold in India is 3%
  const gstTax = Math.round(cartSubtotal * 0.03);
  const totalAmount = cartSubtotal + gstTax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 mb-2">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-serif text-2xl text-stone-800">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm">Explore our collection of rings, necklaces, and coins to add items to your cart.</p>
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
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase">Shopping Bag</h1>
        <p className="text-xs text-stone-500">You have {cart.length} unique items in your bag.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden md:grid grid-cols-12 text-[10px] uppercase tracking-wider text-stone-500 border-b border-gold-500/10 pb-3.5 px-4 font-bold">
            <div className="col-span-6">Product Details</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 bg-white border border-gold-500/15 hover:border-gold-500/30 p-4 rounded-lg transition-all duration-300 shadow-sm"
              >
                {/* Product Detail info */}
                <div className="col-span-12 md:col-span-6 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-stone-50 border border-gold-500/10">
                    <img
                      src={item.product.images && item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gold-500">{item.product.purity} • {item.product.weight}g</span>
                    <Link to={`/product/${item.product._id}`} className="hover:text-gold-500 transition duration-300 block">
                      <h3 className="text-xs font-semibold text-stone-800 truncate">{item.product.name}</h3>
                    </Link>
                    <p className="text-[10px] text-stone-500 font-mono uppercase">{item.product.sku}</p>
                  </div>
                </div>

                {/* Mobile labels */}
                {/* Quantity */}
                <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center">
                  <div className="flex items-center border border-gold-500/10 rounded bg-stone-100/80">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      className="p-1.5 hover:text-gold-500 text-stone-500 transition"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2.5 text-xs font-bold text-stone-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="p-1.5 hover:text-gold-500 text-stone-500 transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 md:col-span-2 text-right md:text-right flex md:block items-center justify-between">
                  <span className="md:hidden text-[10px] text-stone-500 uppercase">Unit Price</span>
                  <span className="text-xs text-stone-750 font-medium">{formatPrice(item.product.price)}</span>
                </div>

                {/* Item Total & Remove */}
                <div className="col-span-12 md:col-span-2 text-right flex items-center justify-between md:justify-end md:space-x-4">
                  <span className="md:hidden text-[10px] text-stone-500 uppercase">Subtotal</span>
                  <div className="flex items-center space-x-3.5">
                    <span className="text-sm font-bold text-gold-500 font-serif">{formatPrice(item.product.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-stone-500 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Actions */}
          <div className="flex justify-between items-center pt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-gold-500 transition"
            >
              <ArrowLeft size={14} />
              <span>Continue Shopping</span>
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-500 hover:bg-red-500/5 border border-red-500/10 px-4 py-2 rounded transition"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-6 shadow-sm">
            <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/10 pb-3">Order Summary</h3>

            {/* Calculations details */}
            <div className="space-y-3.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-stone-800">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3% Indian Gold Tax)</span>
                <span className="text-stone-800">{formatPrice(gstTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Doorstep Shipping</span>
                <span className="text-green-500 font-semibold uppercase tracking-wide">FREE</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-end border-t border-gold-500/10 pt-4 text-base">
              <span className="font-serif text-stone-800 uppercase tracking-widest text-xs font-bold">Total (INC. GST)</span>
              <span className="font-serif font-bold text-xl text-gold-500">{formatPrice(totalAmount)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center space-x-2 gold-gradient-bg text-black py-3.5 rounded text-xs font-bold uppercase tracking-widest transition duration-300 hover:opacity-90 shadow-lg shadow-gold-500/10"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Secure Shopping Info */}
          <div className="bg-stone-50 border border-gold-500/10 rounded p-4 text-[11px] text-stone-500 leading-relaxed text-center">
            All gold transactions are fully insured during transport. Orders are processed via our encrypted payment partner (Razorpay). 3% Goods and Services Tax (GST) is calculated automatically in compliance with Indian regulatory standards.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
