import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Loader, CheckCircle2, ChevronDown, ChevronUp, Package, Truck, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        if (data.success) {
          setOrders(data.orders);
          if (data.orders.length > 0) {
            setExpandedOrder(data.orders[0]._id); // Expand first order by default
          }
        }
      } catch (err) {
        console.error('Failed to load user orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to determine active step indexes in order tracking timeline
  const getTimelineStep = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size={36} className="text-gold-500 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-500 mb-2">
          <ClipboardList size={28} />
        </div>
        <h2 className="font-serif text-2xl text-stone-850">No Orders Found</h2>
        <p className="text-xs text-stone-500 max-w-sm">You haven't placed any jewelry orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase">Order History</h1>
        <p className="text-xs text-stone-500">Track and review invoice statuses for your jewelry procurements.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const step = getTimelineStep(order.orderStatus);
          const isExpanded = expandedOrder === order._id;

          return (
            <div
              key={order._id}
              className="bg-white border border-gold-500/15 rounded-lg overflow-hidden transition-all duration-300 shadow-sm"
            >
              {/* Collapsed Header */}
              <div
                onClick={() => toggleExpand(order._id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gold-500/5 transition select-none"
              >
                <div className="space-y-1">
                  <div className="text-[10px] text-stone-500 font-mono uppercase tracking-wide">ID: {order._id}</div>
                  <div className="text-xs font-semibold text-stone-850">Date: {formatDate(order.createdAt)}</div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider">Total</span>
                    <strong className="text-sm text-gold-500 font-serif font-bold">{formatPrice(order.totalAmount)}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Status</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                      order.orderStatus === 'Shipped' ? 'bg-blue-500/10 text-blue-400' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-gold-500/10 text-gold-500'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gold-500/10"
                  >
                    <div className="p-6 space-y-8 bg-stone-50">
                      {/* 1. Visual Tracking Timeline (If not Cancelled) */}
                      {order.orderStatus !== 'Cancelled' ? (
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Live Order Tracking</h4>
                          <div className="relative flex items-center justify-between w-full max-w-lg mx-auto pt-4 pb-2">
                            {/* Track bar background */}
                            <div className="absolute left-0 right-0 h-0.5 bg-stone-200 z-0" />
                            {/* Active track bar fill */}
                            <div
                              className="absolute left-0 h-0.5 gold-gradient-bg z-0 transition-all duration-500"
                              style={{ width: `${(step / 3) * 100}%` }}
                            />

                            {/* Step points */}
                            {[
                              { label: 'Pending', icon: Compass },
                              { label: 'Confirmed', icon: CheckCircle2 },
                              { label: 'Shipped', icon: Truck },
                              { label: 'Delivered', icon: Package }
                            ].map((s, idx) => {
                              const Icon = s.icon;
                              const isCompleted = idx <= step;
                              const isCurrent = idx === step;

                              return (
                                <div key={s.label} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? 'bg-white border-gold-500 text-gold-500 gold-glow'
                                      : 'bg-stone-100 border-stone-200 text-stone-400'
                                  }`}>
                                    <Icon size={14} className={isCurrent ? 'animate-pulse' : ''} />
                                  </div>
                                  <span className={`text-[9px] uppercase tracking-wider font-semibold mt-2 ${
                                    isCompleted ? 'text-gold-500' : 'text-stone-400'
                                  }`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-400 rounded text-xs text-center font-semibold">
                          This order was Cancelled.
                        </div>
                      )}

                      {/* 2. Purchased Items Grid */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Purchased Items</h4>
                        <div className="space-y-3 bg-white border border-gold-500/10 rounded-lg p-4 shadow-xs">
                          {order.items.map((item) => (
                            <div key={item._id || item.product || item.name} className="flex justify-between items-center space-x-4">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-10 h-10 rounded border border-gold-500/10 overflow-hidden bg-stone-50 shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-semibold text-stone-800 truncate">{item.name}</h5>
                                  <span className="text-[9px] text-stone-500 font-medium">Quantity: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-gold-500 font-serif shrink-0">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Address & Payments block */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-gold-500/10 pt-6">
                        {/* Shipping Coordinate Details */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Delivery Coordinate Details</h4>
                          <address className="not-italic text-stone-500 leading-relaxed">
                            <span className="block text-stone-800 font-semibold">{order.shippingAddress.phone}</span>
                            <span className="block">{order.shippingAddress.street}</span>
                            <span className="block">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                            <span className="block">Postal Code: {order.shippingAddress.postalCode}</span>
                          </address>
                        </div>

                        {/* Payment Invoice detail */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Payment Transaction Details</h4>
                          <div className="text-stone-500 space-y-1">
                            <div>Method: <strong className="text-stone-800">{order.paymentMethod}</strong></div>
                            <div>Gateway Status: <span className={order.paymentStatus === 'Paid' ? 'text-green-600 font-semibold' : 'text-amber-500'}>{order.paymentStatus}</span></div>
                            {order.paymentDetails?.razorpayPaymentId && (
                              <div className="font-mono text-[9px] truncate">Payment ID: {order.paymentDetails.razorpayPaymentId}</div>
                            )}
                            {order.paidAt && (
                              <div>Paid At: {formatDate(order.paidAt)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
