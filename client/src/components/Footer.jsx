import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Award, ShieldCheck, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#f5f2eb] border-t border-gold-500/20 text-stone-600 text-sm">
      {/* Brand Certifications Bar */}
      <div className="border-b border-gold-500/15 bg-[#FAF9F6] py-8 md:py-10 px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Award className="text-gold-600" size={32} />
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">100% BIS Hallmarked</h4>
          <p className="text-xs text-stone-500">Every single ornament is certified by government-authorized assaying centers.</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <ShieldCheck className="text-gold-600" size={32} />
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">Insured Transit</h4>
          <p className="text-xs text-stone-500">Secure door-to-door shipping insured by leading logistic firms.</p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="text-gold-600" size={32} />
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">Easy Returns & Exchange</h4>
          <p className="text-xs text-stone-500">Simple exchange policy across all standard products.</p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-16 px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img src="/images/logo.jpg" alt="Aryansh Gold Logo" className="w-9 h-9 rounded-full border border-gold-500/20 object-cover" />
            <h3 className="font-serif font-bold text-lg text-stone-900 tracking-widest uppercase gold-gradient-text">ARYANSH GOLD</h3>
          </div>
          <p className="text-xs leading-relaxed text-stone-500">
            Crafting premium fine gold jewelry that elevates your elegance. Our catalog combines generational craftsmanship with timeless contemporary designs.
          </p>
          <div className="flex space-x-4">
            <a href="https://instagram.com" className="text-stone-400 hover:text-gold-600 transition">
              <Instagram size={20} />
            </a>
            <a href="https://facebook.com" className="text-stone-400 hover:text-gold-600 transition">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">Explore Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/catalog" className="hover:text-gold-600 transition font-medium">All Jewelry</Link></li>
            <li><Link to="/catalog?category=Rings" className="hover:text-gold-600 transition font-medium">Rings</Link></li>
            <li><Link to="/catalog?category=Necklaces" className="hover:text-gold-600 transition font-medium">Necklaces</Link></li>
            <li><Link to="/catalog?category=Earrings" className="hover:text-gold-600 transition font-medium">Earrings</Link></li>
            <li><Link to="/catalog?category=Coins" className="hover:text-gold-600 transition font-medium">Gold Coins</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">Customer Service</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/orders" className="hover:text-gold-600 transition font-medium">Track Your Order</Link></li>
            <li><span className="hover:text-gold-600 cursor-pointer transition font-medium">Gold Rates Calculator</span></li>
            <li><span className="hover:text-gold-600 cursor-pointer transition font-medium">Terms & Conditions</span></li>
            <li><span className="hover:text-gold-600 cursor-pointer transition font-medium">Privacy Policy</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-serif font-bold text-stone-900 text-sm tracking-widest uppercase">Aryansh Showroom</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start space-x-2.5">
              <MapPin size={16} className="text-gold-600 shrink-0 mt-0.5" />
              <span className="text-stone-600">102 Gold Palace, Diamond Enclave, Mumbai, MH, 400001, India</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone size={16} className="text-gold-600 shrink-0" />
              <span className="text-stone-600">+91 22 8765 4321</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Mail size={16} className="text-gold-600 shrink-0" />
              <span className="text-stone-600">support@aryanshgold.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gold-500/10 py-6 text-center text-xs text-stone-400 px-6">
        <p>&copy; {new Date().getFullYear()} Aryansh Gold. All Rights Reserved. Crafted for premium excellence.</p>
      </div>
    </footer>
  );
};

export default Footer;
