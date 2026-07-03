import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, ShoppingBag, ClipboardList, Upload, Plus, Trash2, Edit, Check, AlertCircle, Loader, DollarSign, Calendar, Package, X } from 'lucide-react';

const AdminDashboard = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('analytics');

  // Products State
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    category: 'Rings',
    purity: '22K',
    weight: '',
    images: '',
    stock: '10'
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Orders State
  const [orders, setOrders] = useState([]);
  
  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // General States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load Admin Data on tab mount
  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'analytics' || activeTab === 'orders') {
        const { data } = await axios.get('/api/orders');
        if (data.success) {
          setOrders(data.orders);
        }
      }
      if (activeTab === 'products') {
        const { data } = await axios.get('/api/products');
        if (data.success) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to load dashboard data. Ensure connection is active.');
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD Handlers
  const handleProductInputChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const manualImages = productForm.images
      ? productForm.images.split(',').map((img) => img.trim()).filter(Boolean)
      : [];
    const finalImages = [...uploadedImages, ...manualImages];

    if (finalImages.length === 0) {
      setErrorMsg('At least one product image is required (upload one or enter URL).');
      return;
    }

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      weight: Number(productForm.weight),
      stock: Number(productForm.stock),
      images: finalImages
    };

    try {
      if (editingProductId) {
        // Edit Product
        const { data } = await axios.put(`/api/products/${editingProductId}`, payload);
        if (data.success) {
          setSuccessMsg('Product details modified successfully.');
          setEditingProductId(null);
        }
      } else {
        // Create Product
        const { data } = await axios.post('/api/products', payload);
        if (data.success) {
          setSuccessMsg('New product introduced to catalog.');
        }
      }
      
      // Reset Form & reload
      setProductForm({
        name: '',
        sku: '',
        description: '',
        price: '',
        category: 'Rings',
        purity: '22K',
        weight: '',
        images: '',
        stock: '10'
      });
      setUploadedImages([]);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Action on product catalog failed.');
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      purity: product.purity,
      weight: product.weight.toString(),
      images: '',
      stock: product.stock.toString()
    });
    setUploadedImages(product.images || []);
  };

  const handleDeleteClick = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this jewelry piece?')) return;
    
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data } = await axios.delete(`/api/products/${productId}`);
      if (data.success) {
        setSuccessMsg('Product eliminated from catalog.');
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg('Failed to eliminate product.');
    }
  };

  // Image File Upload Handler
  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post('/api/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.success) {
        setUploadedImages(prev => [...prev, data.imageUrl]);
        setSuccessMsg('Image uploaded successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload image file.');
    } finally {
      setLoading(false);
    }
  };

  // CSV Bulk Upload Handler
  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
    setUploadResult(null);
    setUploadError(null);
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setLoading(true);
    setUploadResult(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const { data } = await axios.post('/api/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.success) {
        setUploadResult(data.message);
        setCsvFile(null);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'CSV Bulk import encountered a parsing issue.');
    } finally {
      setLoading(false);
    }
  };

  // Order Status update handlers
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
      if (data.success) {
        setSuccessMsg(`Order status upgraded to "${newStatus}" successfully.`);
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg('Failed to modify order status.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate Metrics for Analytics Tab
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row gap-8">
      {/* 1. Left Navigation Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-white border border-gold-500/15 p-4 rounded-lg flex flex-col space-y-2 h-fit shadow-sm">
        <h2 className="font-serif font-bold text-stone-850 text-xs tracking-widest uppercase px-3 py-2 border-b border-gold-500/15 mb-2">Admin Panel</h2>
        
        <button
          onClick={() => { setActiveTab('analytics'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'analytics' ? 'bg-gold-500 text-white font-bold shadow' : 'text-stone-500 hover:text-gold-500 hover:bg-gold-500/5'
          }`}
        >
          <LayoutDashboard size={14} />
          <span>Analytics Overview</span>
        </button>

        <button
          onClick={() => { setActiveTab('products'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'products' ? 'bg-gold-500 text-white font-bold shadow' : 'text-stone-500 hover:text-gold-500 hover:bg-gold-500/5'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Product Catalog</span>
        </button>

        <button
          onClick={() => { setActiveTab('csv'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'csv' ? 'bg-gold-500 text-white font-bold shadow' : 'text-stone-500 hover:text-gold-500 hover:bg-gold-500/5'
          }`}
        >
          <Upload size={14} />
          <span>CSV Bulk Upload</span>
        </button>

        <button
          onClick={() => { setActiveTab('orders'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === 'orders' ? 'bg-gold-500 text-white font-bold shadow' : 'text-stone-500 hover:text-gold-500 hover:bg-gold-500/5'
          }`}
        >
          <ClipboardList size={14} />
          <span>Customer Orders</span>
        </button>
      </div>

      {/* 2. Main Dashboard Tab Area */}
      <div className="flex-grow space-y-6">
        {/* Banner messages */}
        {successMsg && (
          <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded text-xs">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-xs">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-stone-900 tracking-widest uppercase">Analytics Overview</h2>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-gold-500/15 p-5 rounded-lg flex items-center space-x-4 shadow-sm">
                <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-bold">Total Sales</span>
                  <strong className="text-lg text-stone-900 font-serif">{formatPrice(totalSales)}</strong>
                </div>
              </div>
              <div className="bg-white border border-gold-500/15 p-5 rounded-lg flex items-center space-x-4 shadow-sm">
                <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-lg">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-bold">Total Orders</span>
                  <strong className="text-lg text-stone-900 font-serif">{orders.length}</strong>
                </div>
              </div>
              <div className="bg-white border border-gold-500/15 p-5 rounded-lg flex items-center space-x-4 shadow-sm">
                <div className="p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest block font-bold">Pending Orders</span>
                  <strong className="text-lg text-stone-900 font-serif">{pendingOrdersCount}</strong>
                </div>
              </div>
            </div>

            {/* Recent Orders log */}
            <div className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-stone-855 text-sm tracking-wider uppercase border-b border-gold-500/15 pb-3">Recent Transactions</h3>
              {loading ? (
                <div className="flex justify-center p-6"><Loader size={20} className="animate-spin text-gold-500" /></div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No recent sales recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-stone-600">
                    <thead>
                      <tr className="border-b border-gold-500/10 text-[10px] uppercase text-stone-500 font-bold">
                        <th className="pb-2.5">Order ID</th>
                        <th className="pb-2.5">Customer</th>
                        <th className="pb-2.5 text-right">Invoice Amount</th>
                        <th className="pb-2.5 text-center">Payment Status</th>
                        <th className="pb-2.5 text-right">Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-b border-gold-500/10 hover:bg-gold-500/5">
                          <td className="py-3 font-mono">{order._id.substr(0, 10)}...</td>
                          <td className="py-3 truncate max-w-[120px]">{order.user?.name || 'Guest'}</td>
                          <td className="py-3 text-right font-serif font-bold text-stone-850">{formatPrice(order.totalAmount)}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-semibold ${
                              order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-600 font-bold' : 'bg-amber-500/10 text-amber-600 font-bold'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-[9px] uppercase font-bold text-gold-500">{order.orderStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalog CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-stone-900 tracking-widest uppercase">Catalog Management</h2>

            {/* Form */}
            <form onSubmit={handleProductSubmit} className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/15 pb-2">
                {editingProductId ? 'Modify Jewelry Details' : 'Introduce New Jewelry Piece'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Jewelry Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={productForm.name}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">SKU Code</label>
                  <input
                    type="text"
                    name="sku"
                    required
                    value={productForm.sku}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={productForm.price}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Weight (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    required
                    value={productForm.weight}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Stock Level</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={productForm.stock}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Coins">Gold Coins</option>
                    <option value="Pendants">Pendants</option>
                  </select>
                </div>

                {/* Purity */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Gold Purity</label>
                  <select
                    name="purity"
                    value={productForm.purity}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  >
                    <option value="18K">18K Gold</option>
                    <option value="22K">22K Gold</option>
                    <option value="24K">24K Gold</option>
                  </select>
                </div>

                {/* Image paths / File Selector */}
                <div className="space-y-2 sm:col-span-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold font-bold">Product Image URLs (Comma Separated)</label>
                    <span className="text-[9px] text-gold-600 font-semibold font-bold">Or upload local image files below</span>
                  </div>
                  <input
                    type="text"
                    name="images"
                    placeholder="https://example.com/ring1.jpg, https://example.com/ring2.jpg"
                    value={productForm.images}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500 font-mono"
                  />
                  <div className="flex items-center space-x-3 bg-stone-50 border border-dashed border-gold-500/15 p-2 rounded">
                    <label className="bg-gold-500 text-black text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded cursor-pointer hover:opacity-90 transition shrink-0 select-none">
                      Choose Local Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-stone-400">Select file to upload and add it to previews below</span>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 border border-gold-500/20 rounded overflow-hidden group">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X size={14} className="text-red-500 font-bold" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Description details</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    value={productForm.description}
                    onChange={handleProductInputChange}
                    className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-2.5 outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3.5 pt-2">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        name: '',
                        sku: '',
                        description: '',
                        price: '',
                        category: 'Rings',
                        purity: '22K',
                        weight: '',
                        images: '',
                        stock: '10'
                      });
                    }}
                    className="px-4 py-2 bg-white border border-stone-200 text-stone-500 rounded text-xs font-semibold uppercase tracking-wider hover:text-stone-850"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 gold-gradient-bg text-black rounded text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5 hover:opacity-90"
                >
                  <Plus size={14} />
                  <span>{editingProductId ? 'Apply Changes' : 'Publish Product'}</span>
                </button>
              </div>
            </form>

            {/* List */}
            <div className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/15 pb-3">Active Inventory</h3>
              {loading ? (
                <div className="flex justify-center p-6"><Loader size={20} className="animate-spin text-gold-500" /></div>
              ) : products.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No products loaded.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {products.map((product) => (
                    <div key={product._id} className="flex justify-between items-center bg-stone-50 border border-gold-500/10 p-3 rounded hover:border-gold-500/15 transition-all">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 bg-stone-50 border border-gold-500/15 rounded overflow-hidden shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-stone-850 truncate">{product.name}</h4>
                          <span className="text-[9px] text-stone-500 uppercase font-mono">{product.sku} • {product.category} • {product.purity} • {product.weight}g</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-stone-500 uppercase block">Price</span>
                          <strong className="text-xs text-gold-500 font-serif font-bold">{formatPrice(product.price)}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-stone-500 uppercase block">Stock</span>
                          <strong className={`text-xs ${product.stock <= 2 ? 'text-red-500 font-semibold' : 'text-stone-800'}`}>{product.stock}</strong>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-1.5 text-stone-550 hover:text-gold-500 transition"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product._id)}
                            className="p-1.5 text-stone-500 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: CSV Bulk Upload */}
        {activeTab === 'csv' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-stone-900 tracking-widest uppercase">Daily Product Bulk Imports</h2>

            <form onSubmit={handleCsvSubmit} className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/15 pb-2">Upload Inventory CSV</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Import dozens of ornaments instantly. Select a `.csv` file mapping the following columns exactly in the first header row:
                </p>
                <div className="bg-stone-100 p-3 rounded font-mono text-[9px] text-gold-700 leading-normal border border-gold-500/10">
                  name, sku, description, price, category, purity, weight, stock, images
                </div>
              </div>

              {/* Upload Drop area */}
              <div className="border border-dashed border-gold-500/20 rounded-lg p-8 text-center bg-stone-50 hover:bg-gold-500/5 hover:border-gold-500/40 transition duration-300 relative shadow-inner">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={28} className="text-gold-500 mx-auto mb-2 animate-bounce" />
                <span className="text-xs text-stone-500 block font-semibold">
                  {csvFile ? `Selected: ${csvFile.name}` : 'Click or Drag CSV file here'}
                </span>
                <span className="text-[10px] text-stone-400 block mt-1">Accepts UTF-8 comma separated files</span>
              </div>

              {uploadResult && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded text-xs font-semibold">
                  {uploadResult}
                </div>
              )}
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {/* Download Template helper */}
                <a
                  href="data:text/csv;charset=utf-8,name,sku,description,price,category,purity,weight,stock,images%0AEternal Gold Choker,NK-HER-100,22K Gold Choker,150000,Necklaces,22K,20.4,5,https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f"
                  download="aryansh_gold_template.csv"
                  className="text-xs text-gold-500 hover:underline uppercase tracking-wider font-semibold"
                >
                  Download CSV Template
                </a>

                <button
                  type="submit"
                  disabled={loading || !csvFile}
                  className="px-6 py-2.5 gold-gradient-bg text-black rounded text-xs font-bold uppercase tracking-widest transition duration-300 disabled:opacity-40"
                >
                  {loading ? <Loader size={14} className="animate-spin" /> : 'Launch Import'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-stone-900 tracking-widest uppercase">Customer Order Pipeline</h2>

            <div className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/15 pb-3">Active Deliveries</h3>
              
              {loading ? (
                <div className="flex justify-center p-6"><Loader size={20} className="animate-spin text-gold-500" /></div>
              ) : orders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No user transactions recorded.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gold-500/15 rounded-lg p-5 bg-stone-50 space-y-4 hover:border-gold-500/25 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-500/10 pb-3">
                        <div>
                          <span className="text-[9px] text-stone-500 block font-mono">ORDER ID: {order._id}</span>
                          <span className="text-xs font-bold text-stone-850">Customer: {order.user?.name || 'Guest'} ({order.user?.email || 'N/A'})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-stone-500 block">Transaction amount</span>
                          <strong className="text-xs text-gold-500 font-serif font-bold">{formatPrice(order.totalAmount)}</strong>
                        </div>
                      </div>

                      {/* Purchased Items details list */}
                      <div className="text-xs space-y-1">
                        <strong className="text-stone-600 block text-[10px] uppercase tracking-wider mb-1">Purchased Products</strong>
                        {order.items.map((item) => (
                          <div key={item._id} className="text-stone-500 flex justify-between">
                            <span>{item.name} <strong className="text-stone-850 font-semibold">x{item.quantity}</strong></span>
                            <span className="font-semibold text-stone-600">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* shipping coordinate details */}
                      <div className="text-xs text-stone-500 pt-2 border-t border-gold-500/10">
                        <strong className="text-stone-600 block text-[10px] uppercase tracking-wider mb-1">Delivery Coordinate Details</strong>
                        <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        <p className="font-semibold text-stone-850">Tel: {order.shippingAddress.phone}</p>
                      </div>

                      {/* Status select controllers */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gold-500/10">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <span className="text-stone-500 font-medium">Method:</span>
                            <span className="font-semibold text-stone-700">{order.paymentMethod}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-stone-500 font-medium">Gateway Settle:</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-600 font-bold' : 'bg-red-500/10 text-red-650 font-bold'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-stone-500 font-semibold">Change Delivery Status:</span>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                            className="bg-white border border-gold-500/20 text-xs text-stone-850 rounded px-2.5 py-1.5 focus:border-gold-500 outline-none transition"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
