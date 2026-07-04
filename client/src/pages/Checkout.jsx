import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowLeft, Loader, CreditCard, Banknote, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });

  // Flow control states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mockPaymentModal, setMockPaymentModal] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Calculations (India Standard GST is 3% for Gold)
  const gstTax = Math.round(cartSubtotal * 0.03);
  const totalAmount = cartSubtotal + gstTax;

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (cart.length === 0) {
      setError('Your shopping bag is empty.');
      setLoading(false);
      return;
    }

    try {
      // 1. Send Order items & address details to backend to initialize order
      const { data } = await axios.post('/api/orders', {
        items: cart.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.images[0]
        })),
        shippingAddress,
        totalAmount,
        paymentMethod
      });

      if (data.success) {
        if (data.isCOD) {
          clearCart();
          navigate('/orders');
          return;
        }

        const { order, razorpayDetails } = data;

        // 2. Determine checkout pathway: Real SDK vs. simulated Sandbox
        if (razorpayDetails.isMock) {
          // Open mock checkout modal
          setCreatedOrderData({ order, razorpayDetails });
          setMockPaymentModal(true);
          setLoading(false);
        } else {
          // Launch standard Razorpay SDK modal
          const options = {
            key: razorpayDetails.key,
            amount: razorpayDetails.amount,
            currency: razorpayDetails.currency,
            name: 'Aryansh Gold Store',
            description: 'Fine Jewelry Purchase',
            order_id: razorpayDetails.id,
            handler: async function (response) {
              setLoading(true);
              try {
                // Crypto verification signature check on backend
                const verification = await axios.post('/api/orders/verify-payment', {
                  orderId: order._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                if (verification.data.success) {
                  clearCart();
                  navigate('/orders');
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Payment signature verification failed.');
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: shippingAddress.phone
            },
            theme: {
              color: '#D4AF37'
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Try again.');
      setLoading(false);
    }
  };

  // Triggers verification for Simulated payment checkouts
  const handleSimulatePayment = async (success = true) => {
    if (!createdOrderData) return;
    setLoading(true);
    setMockPaymentModal(false);

    const { order, razorpayDetails } = createdOrderData;

    try {
      if (success) {
        const { data } = await axios.post('/api/orders/verify-payment', {
          orderId: order._id,
          razorpayOrderId: razorpayDetails.id,
          razorpayPaymentId: `mock_pay_${Date.now()}`,
          razorpaySignature: `mock_sig_${Date.now()}`
        });

        if (data.success) {
          clearCart();
          navigate('/orders');
        }
      } else {
        setError('Simulated payment failed or was cancelled.');
      }
    } catch (err) {
      setError('Simulated payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col space-y-8 md:space-y-12">
      {/* Back Button */}
      <button onClick={() => navigate('/cart')} className="inline-flex items-center space-x-2 text-xs uppercase font-semibold tracking-wider text-gray-400 hover:text-gold-500 transition w-fit">
        <ArrowLeft size={14} />
        <span>Back to Shopping Bag</span>
      </button>

      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-serif text-stone-900 tracking-widest uppercase">Secure Checkout</h1>
        <p className="text-xs text-stone-500">Provide shipping coordinates to settle your invoice via Razorpay secure portal.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-14">
        {/* Left Side: Delivery Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePaymentSubmit} className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-6 shadow-sm">
            <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/10 pb-3">Delivery Coordinates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Contact Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-3 outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Street Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Street & Apartment / House No.</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="Flat 102, Gold Palace Building"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-3 outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Mumbai"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-3 outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Maharashtra"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-3 outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Postal Pin Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">PIN Code / ZIP</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder="400001"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 border border-gold-500/15 rounded text-xs text-stone-900 p-3 outline-none focus:border-gold-500 transition"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full bg-stone-200 border border-gold-500/10 text-stone-500 rounded text-xs p-3 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/10 pb-3">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`border rounded-lg p-4 cursor-pointer flex items-start space-x-3.5 transition-all duration-300 ${
                    paymentMethod === 'Razorpay'
                      ? 'border-gold-500 bg-gold-500/5 shadow-md'
                      : 'border-gold-500/15 hover:border-gold-500/40 hover:bg-stone-50/50'
                  }`}
                >
                  <div className={`p-2.5 rounded border transition-colors duration-300 ${
                    paymentMethod === 'Razorpay' ? 'bg-gold-500 text-white border-gold-500' : 'bg-stone-50 text-stone-500 border-gold-500/10'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-850">Online Payment</h4>
                    <p className="text-[10px] text-stone-500 leading-normal mt-0.5">UPI, Debit/Credit Card, NetBanking, and Wallets via Razorpay</p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`border rounded-lg p-4 cursor-pointer flex items-start space-x-3.5 transition-all duration-300 ${
                    paymentMethod === 'COD'
                      ? 'border-gold-500 bg-gold-500/5 shadow-md'
                      : 'border-gold-500/15 hover:border-gold-500/40 hover:bg-stone-50/50'
                  }`}
                >
                  <div className={`p-2.5 rounded border transition-colors duration-300 ${
                    paymentMethod === 'COD' ? 'bg-gold-500 text-white border-gold-500' : 'bg-stone-50 text-stone-500 border-gold-500/10'
                  }`}>
                    <Banknote size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-850">Cash on Delivery</h4>
                    <p className="text-[10px] text-stone-500 leading-normal mt-0.5">Pay in cash directly to the delivery associate when your jewelry arrives</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit checkout button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 gold-gradient-bg text-black py-4 rounded text-xs font-bold uppercase tracking-widest transition duration-300 hover:opacity-90 shadow-lg disabled:opacity-40"
            >
              {loading ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'COD' ? <Truck size={14} /> : <CreditCard size={14} />}
                  <span>{paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Initiate Secure Payment'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Order summary review */}
        <div className="space-y-6">
          <div className="bg-white border border-gold-500/15 p-6 rounded-lg space-y-6 shadow-sm">
            <h3 className="font-serif font-bold text-stone-850 text-sm tracking-wider uppercase border-b border-gold-500/10 pb-3">Shopping Bag Items</h3>

            <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2.5">
              {cart.map((item) => (
                <div key={item.product._id} className="flex justify-between items-center space-x-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded border border-gold-500/10 overflow-hidden bg-stone-50 shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-stone-800 truncate">{item.product.name}</h4>
                      <span className="text-[10px] text-stone-500">Qty: {item.quantity} • {item.product.weight}g</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gold-500 shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="space-y-3 pt-4 border-t border-gold-500/10 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-stone-800 font-medium">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (3%)</span>
                <span className="text-stone-800 font-medium">{formatPrice(gstTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Secure Transit Cover</span>
                <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-gold-500/10 pt-4 text-base">
              <span className="font-serif text-stone-800 uppercase tracking-widest text-xs font-bold">Total Invoice</span>
              <span className="font-serif font-bold text-lg text-gold-500">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-stone-500">
            <ShieldCheck size={14} className="text-gold-500 shrink-0" />
            <span>Encrypted Payment Processing Gateway Protocol</span>
          </div>
        </div>
      </div>

      {/* Simulated Sandbox Payment Modal */}
      <AnimatePresence>
        {mockPaymentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-[400px] h-[340px] max-w-[90%] bg-white border border-gold-500/30 rounded-lg p-6 shadow-2xl z-50 flex flex-col justify-between"
            >
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center justify-center text-gold-500 mx-auto">
                  <CreditCard size={22} />
                </div>
                <h3 className="font-serif font-bold text-stone-800 uppercase tracking-wider text-sm">Simulated Checkout Sandbox</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Razorpay environment API keys are not detected in the backend configuration. The server generated a simulated billing sandbox order:
                </p>
                <div className="bg-stone-100 border border-gold-500/10 p-3 rounded font-mono text-[10px] text-gold-600 space-y-1 text-left select-all">
                  <div>Order ID: {createdOrderData?.razorpayDetails.id}</div>
                  <div>Amount: {formatPrice(totalAmount)}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleSimulatePayment(false)}
                  className="w-1/2 text-center py-2.5 rounded text-xs border border-red-500/20 text-red-400 hover:bg-red-500/5 transition font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSimulatePayment(true)}
                  className="w-1/2 text-center py-2.5 rounded text-xs gold-gradient-bg text-black hover:opacity-90 transition font-bold uppercase tracking-wider"
                >
                  Pay Invoice
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
