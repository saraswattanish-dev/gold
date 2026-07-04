import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, ArrowUpDown, X, Loader } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import gsap from 'gsap';

const CATEGORIES = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Coins'];
const PURITIES = ['All', '18K', '22K', '24K'];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // GSAP Sidebar Parallax Hover handlers
  const handleSidebarMouseMove = (e) => {
    const sidebar = e.currentTarget;
    const box = sidebar.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const percentX = x / box.width;
    const percentY = y / box.height;
    
    const rX = (percentY - 0.5) * -8;
    const rY = (percentX - 0.5) * 8;

    gsap.to(sidebar, {
      rotateX: rX,
      rotateY: rY,
      scale: 1.01,
      boxShadow: '0 10px 25px -5px rgba(212, 175, 55, 0.12)',
      borderColor: 'rgba(212, 175, 55, 0.35)',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleSidebarMouseLeave = (e) => {
    const sidebar = e.currentTarget;
    gsap.to(sidebar, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      borderColor: 'rgba(212, 175, 55, 0.2)',
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [purity, setPurity] = useState(searchParams.get('purity') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minWeight, setMinWeight] = useState(searchParams.get('minWeight') || '');
  const [maxWeight, setMaxWeight] = useState(searchParams.get('maxWeight') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  // UI Control States
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state values with URL search params changes
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setCategory(searchParams.get('category') || 'All');
    setPurity(searchParams.get('purity') || 'All');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinWeight(searchParams.get('minWeight') || '');
    setMaxWeight(searchParams.get('maxWeight') || '');
    setSort(searchParams.get('sort') || 'latest');
  }, [searchParams]);

  // Load catalog on filter adjustments
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.set('keyword', keyword);
        if (category && category !== 'All') queryParams.set('category', category);
        if (purity && purity !== 'All') queryParams.set('purity', purity);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (minWeight) queryParams.set('minWeight', minWeight);
        if (maxWeight) queryParams.set('maxWeight', maxWeight);
        if (sort) queryParams.set('sort', sort);

        const { data } = await axios.get(`/api/products?${queryParams.toString()}`);
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products from API:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [location.search]);

  // Apply filters by writing to searchParams URL
  const applyFilters = (updatedFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Helper to set/delete params
    const manageParam = (name, val) => {
      if (val && val !== 'All') {
        params.set(name, val);
      } else {
        params.delete(name);
      }
    };

    const merged = {
      keyword,
      category,
      purity,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      sort,
      ...updatedFilters
    };

    manageParam('keyword', merged.keyword);
    manageParam('category', merged.category);
    manageParam('purity', merged.purity);
    manageParam('minPrice', merged.minPrice);
    manageParam('maxPrice', merged.maxPrice);
    manageParam('minWeight', merged.minWeight);
    manageParam('maxWeight', merged.maxWeight);
    manageParam('sort', merged.sort);

    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ keyword });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('All');
    setPurity('All');
    setMinPrice('');
    setMaxPrice('');
    setMinWeight('');
    setMaxWeight('');
    setSort('latest');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col space-y-8 md:space-y-12">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase">The Gold Collections</h1>
        <p className="text-xs text-stone-500">Browse pure 18K, 22K, and 24K ornaments curated by Aryansh Gold.</p>
      </div>

      {/* Header Controls (Search, Mobile Filter Toggle, Sort Selector) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gold-500/20 p-4 rounded-lg shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#FAF9F6] border border-gold-500/15 rounded px-3 py-2 flex-grow max-w-lg">
          <input
            type="text"
            placeholder="Search SKU or name (e.g. choker, ring)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-stone-800 w-full placeholder-stone-400"
          />
          <button type="submit" className="text-stone-500 hover:text-gold-600">
            <Search size={16} />
          </button>
        </form>

        <div className="flex items-center justify-between md:justify-end gap-4">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center space-x-2 border border-gold-500/20 text-gold-600 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-gold-500/10 transition"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown size={14} className="text-stone-500" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters({ sort: e.target.value });
              }}
              className="bg-white border border-gold-500/20 text-xs text-stone-700 rounded px-3 py-2 outline-none focus:border-gold-500 transition shadow-xs"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="weightAsc">Weight: Light to Heavy</option>
              <option value="weightDesc">Weight: Heavy to Light</option>
              <option value="oldest">Oldest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* 1. Sidebar Filters (Desktop) */}
        <div 
          onMouseMove={handleSidebarMouseMove}
          onMouseLeave={handleSidebarMouseLeave}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="hidden lg:block space-y-6 bg-white border border-gold-500/20 p-6 rounded-lg h-fit shadow-xs transition-shadow duration-300"
        >
          <div className="flex items-center justify-between border-b border-gold-500/10 pb-3">
            <h3 className="font-serif font-bold text-stone-900 text-sm tracking-wider uppercase">Filter Jewelry</h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] uppercase font-bold tracking-widest text-gold-600 hover:text-stone-950 transition"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Category</h4>
            <div className="flex flex-col space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    applyFilters({ category: cat });
                  }}
                  className={`text-xs text-left py-1 transition-all ${
                    category === cat ? 'text-gold-600 font-semibold pl-1.5 border-l border-gold-500' : 'text-stone-500 hover:text-stone-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gold Purity Filter */}
          <div className="space-y-2.5 pt-4 border-t border-gold-500/10">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Purity</h4>
            <div className="flex flex-col space-y-1.5">
              {PURITIES.map((pur) => (
                <button
                  key={pur}
                  onClick={() => {
                    setPurity(pur);
                    applyFilters({ purity: pur });
                  }}
                  className={`text-xs text-left py-1 transition-all ${
                    purity === pur ? 'text-gold-600 font-semibold pl-1.5 border-l border-gold-500' : 'text-stone-500 hover:text-stone-950'
                  }`}
                >
                  {pur}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5 pt-4 border-t border-gold-500/10">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => applyFilters({ minPrice })}
                className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2 outline-none focus:border-gold-500 w-full"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => applyFilters({ maxPrice })}
                className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2 outline-none focus:border-gold-500 w-full"
              />
            </div>
          </div>

          {/* Weight Range Filter */}
          <div className="space-y-2.5 pt-4 border-t border-gold-500/10">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Weight (grams)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Min g"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
                onBlur={() => applyFilters({ minWeight })}
                className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2 outline-none focus:border-gold-500 w-full"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Max g"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                onBlur={() => applyFilters({ maxWeight })}
                className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2 outline-none focus:border-gold-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* 2. Product Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader size={36} className="text-gold-500 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 border border-dashed border-gold-500/25 rounded-lg p-10 bg-white text-center shadow-xs">
              <p className="text-stone-700 font-serif text-lg">No jewelry pieces match your filter criteria.</p>
              <p className="text-xs text-stone-400">Try adjusting your filters or clearing search text.</p>
              <button
                onClick={handleClearFilters}
                className="gold-gradient-bg text-black font-semibold text-xs uppercase tracking-widest px-6 py-2.5 rounded transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Mobile Filters Slide-Over Drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 h-full w-80 max-w-full bg-white border-r border-gold-500/20 shadow-2xl p-6 z-50 overflow-y-auto lg:hidden flex flex-col space-y-6">
            <div className="flex justify-between items-center border-b border-gold-500/10 pb-3">
              <span className="font-serif font-bold text-stone-900 uppercase text-sm tracking-wider">Filter Ornaments</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-stone-500 hover:text-gold-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Category</h4>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      applyFilters({ category: cat });
                    }}
                    className={`text-xs py-2 rounded text-center border transition-all ${
                      category === cat
                        ? 'border-gold-500 text-gold-600 bg-gold-500/10 font-semibold'
                        : 'border-gold-500/5 text-stone-600 bg-stone-50 hover:text-stone-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Purity */}
            <div className="space-y-2 pt-4 border-t border-gold-500/10">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Gold Purity</h4>
              <div className="grid grid-cols-2 gap-2">
                {PURITIES.map((pur) => (
                  <button
                    key={pur}
                    onClick={() => {
                      setPurity(pur);
                      applyFilters({ purity: pur });
                    }}
                    className={`text-xs py-2 rounded text-center border transition-all ${
                      purity === pur
                        ? 'border-gold-500 text-gold-600 bg-gold-500/10 font-semibold'
                        : 'border-gold-500/5 text-stone-600 bg-stone-50 hover:text-stone-950'
                    }`}
                  >
                    {pur}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2 pt-4 border-t border-gold-500/10">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Price Range (₹)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => applyFilters({ minPrice })}
                  className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2.5 outline-none focus:border-gold-500 w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => applyFilters({ maxPrice })}
                  className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2.5 outline-none focus:border-gold-500 w-full"
                />
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2 pt-4 border-t border-gold-500/10">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Weight (g)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Min g"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  onBlur={() => applyFilters({ minWeight })}
                  className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2.5 outline-none focus:border-gold-500 w-full"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Max g"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  onBlur={() => applyFilters({ maxWeight })}
                  className="bg-[#FAF9F6] border border-gold-500/15 rounded text-xs text-stone-800 p-2.5 outline-none focus:border-gold-500 w-full"
                />
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <button
                onClick={() => {
                  handleClearFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-full text-center py-2.5 text-xs text-stone-500 hover:text-stone-950 uppercase tracking-wider font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Catalog;
