import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, ShoppingBag, Plus, Minus, CreditCard, Landmark, Send, CheckCircle2, Loader2, Phone, User, Calendar } from 'lucide-react';
import { SAMPLE_REELS } from '../data/sampleData';

export default function CheckoutPage({ onAddOrderToHistory }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Load active session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mukbites_session');
      return saved ? JSON.parse(saved) : { fullName: 'MukBites Diner', creatorHandle: '@anonymous' };
    } catch {
      return { fullName: 'MukBites Diner', creatorHandle: '@anonymous' };
    }
  });

  // Extract selected reel, fallback to first sample reel to prevent errors
  const reel = location.state?.reel || SAMPLE_REELS[0];

  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(currentUser.fullName);
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('mukbites_address') || '';
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'COD'
  
  // Card details simulator states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Bill Calculations
  const itemPrice = reel.price;
  const deliveryFee = reel.deliveryFee || 30;
  const platformFee = 5;
  const itemTotal = itemPrice * quantity;
  const gstTax = Math.round(itemTotal * 0.05); // 5% GST
  const grandTotal = itemTotal + deliveryFee + platformFee + gstTax;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanName = customerName.trim();
    const cleanAddress = address.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName) {
      setValidationError('Please enter a delivery name.');
      return;
    }
    if (!cleanAddress) {
      setValidationError('Please enter a delivery address.');
      return;
    }
    if (cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone)) {
      setValidationError('Please enter a valid 10-digit phone number.');
      return;
    }

    // Additional validation for credit card
    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16 || !/^\d+$/.test(cleanCard)) {
        setValidationError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setValidationError('Please enter expiry date in MM/YY format.');
        return;
      }
      if (cardCVV.length !== 3 || !/^\d+$/.test(cardCVV)) {
        setValidationError('Please enter a valid 3-digit CVV.');
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate Swiggy payment gateway delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const orderObj = {
        id: `mukbites-ord-${Date.now()}`,
        dishTitle: reel.dishName,
        price: itemPrice,
        quantity: quantity,
        restaurantName: reel.restaurantName,
        paymentMode: paymentMethod === 'COD' 
          ? 'Cash on Delivery (COD)' 
          : paymentMethod === 'CARD' 
          ? 'Credit/Debit Card' 
          : 'UPI / NetBanking',
        grandTotal: grandTotal,
        timestamp: 'Just now',
        deliveryAddress: cleanAddress,
        contactNumber: cleanPhone,
        customerName: cleanName
      };

      setPlacedOrder(orderObj);
      
      // Save order to history
      if (onAddOrderToHistory) {
        onAddOrderToHistory(orderObj);
      }
    }, 1800);
  };

  return (
    <div className="w-full h-full bg-[#0b0b0c] text-white flex flex-col overflow-hidden pt-12">
      {/* HEADER BAR */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-10 shrink-0">
        {!isSuccess && !isSubmitting && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-neutral-100 tracking-tight">
            {isSuccess ? 'Order Confirmed!' : 'Secure Checkout'}
          </h2>
          {!isSuccess && (
            <p className="text-[9px] text-neutral-500 font-semibold truncate leading-none mt-0.5">
              MukBites checkout simulator
            </p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs uppercase select-none">
          {currentUser.fullName.substring(0, 2)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess && placedOrder ? (
          /* SUCCESS SCREEN STATE */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-5 text-center flex flex-col items-center justify-center space-y-6 scrollbar-none"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-emerald-400 tracking-tight">Order Placed Successfully!</h2>
              <p className="text-xs text-neutral-400 px-4 leading-relaxed font-medium">
                Delicious food from <span className="text-neutral-200 font-bold">{placedOrder.restaurantName.split(',')[0]}</span> is on the way.
              </p>
            </div>

            {/* Receipt details */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 w-full text-left space-y-3 shadow-xl">
              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block border-b border-neutral-900 pb-1.5">
                Receipt details
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Dish:</span>
                  <span className="font-bold text-neutral-200">{placedOrder.dishTitle} x {placedOrder.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Customer:</span>
                  <span className="font-semibold text-neutral-200">{placedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Delivery Address:</span>
                  <span className="font-semibold text-neutral-200 max-w-[180px] truncate text-right">{placedOrder.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Phone Number:</span>
                  <span className="font-semibold text-neutral-200">{placedOrder.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Payment Mode:</span>
                  <span className="font-semibold text-orange-400">{placedOrder.paymentMode}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-900 pt-2 text-sm">
                  <span className="font-bold text-neutral-100">Amount Paid:</span>
                  <span className="font-black text-orange-400">₹{placedOrder.grandTotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/10 active:scale-95 duration-150"
            >
              Back to Reels
            </button>
          </motion.div>
        ) : (
          /* CART & BILLING SCREEN STATE */
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-20"
          >
            {/* Restaurant Detail Banner with matching food video/image */}
            <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 flex gap-3.5 items-center">
              <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-neutral-900 flex items-center justify-center shrink-0">
                {reel.videoUrl ? (
                  <video 
                    src={reel.videoUrl} 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : reel.foodImage ? (
                  <img 
                    src={reel.foodImage} 
                    alt={reel.dishName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={reel.profilePic} 
                    alt={reel.dishName} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] uppercase tracking-wider text-orange-500 font-bold block">Ordering from</span>
                <h3 className="text-xs font-bold text-neutral-100 truncate mt-0.5">{reel.restaurantName}</h3>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">Rating: ⭐ {reel.rating} • Delivery in {reel.deliveryTime}</p>
              </div>
            </div>

            {/* Cart Item Detail */}
            <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-extrabold text-neutral-100">{reel.dishName}</h4>
                  <p className="text-xs text-orange-400 font-black mt-1">₹{itemPrice}</p>
                </div>

                {/* Quantity Editor */}
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 shrink-0">
                  <button
                    onClick={handleDecrement}
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white active:scale-95 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-white">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white active:scale-95 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Delivery Details Card */}
              <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 space-y-3.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block">Delivery details</span>
                
                {/* Customer name - editable */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name for delivery"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none transition"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" /> Phone Number (10 Digits)
                  </label>
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="e.g. 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-medium text-white outline-none placeholder-neutral-600 transition"
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" /> Delivery Address
                  </label>
                  <textarea
                    rows="2.5"
                    placeholder="Enter full street address, apartment no. etc."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-medium text-white outline-none placeholder-neutral-600 transition resize-none"
                  />
                </div>

                {validationError && (
                  <p className="text-[10px] text-red-500 font-black animate-pulse flex items-center gap-1 pl-0.5">
                    ⚠️ {validationError}
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-1 block">Payment Method</span>
                
                <div className="grid grid-cols-3 gap-2 bg-neutral-950 border border-neutral-900 p-1 rounded-xl">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2.5 rounded-lg text-[10px] font-black uppercase flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'UPI'
                        ? 'bg-neutral-900 text-orange-400 border border-neutral-800 shadow-lg'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>UPI</span>
                  </button>

                  {/* Credit/Debit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2.5 rounded-lg text-[10px] font-black uppercase flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-neutral-900 text-orange-400 border border-neutral-800 shadow-lg'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-2.5 rounded-lg text-[10px] font-black uppercase flex flex-col items-center gap-1 transition ${
                      paymentMethod === 'COD'
                        ? 'bg-neutral-900 text-orange-400 border border-neutral-800 shadow-lg'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>COD</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Card Details Form */}
              <AnimatePresence>
                {paymentMethod === 'CARD' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 space-y-3 overflow-hidden"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block">Card details</span>
                    
                    {/* Card Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-neutral-500" /> Card Number
                      </label>
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format with spaces
                          const val = e.target.value.replace(/\D/g, '');
                          const matches = val.match(/\d{1,4}/g);
                          setCardNumber(matches ? matches.join(' ') : '');
                        }}
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Expiry
                        </label>
                        <input
                          type="text"
                          maxLength="5"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 3) {
                              setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-semibold pl-0.5 flex items-center gap-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength="3"
                          placeholder="***"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bill breakdown */}
              <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 space-y-2.5 text-xs">
                <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block">Bill details</span>
                
                <div className="flex justify-between text-neutral-400 font-medium">
                  <span>Item Subtotal ({quantity} x ₹{itemPrice})</span>
                  <span className="font-bold text-neutral-200">₹{itemTotal}</span>
                </div>
                <div className="flex justify-between text-neutral-400 font-medium">
                  <span>GST & Restaurant Charges (5%)</span>
                  <span className="font-bold text-neutral-200">₹{gstTax}</span>
                </div>
                <div className="flex justify-between text-neutral-400 font-medium">
                  <span>Delivery Surcharge</span>
                  <span className="font-bold text-neutral-200">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-neutral-400 font-medium">
                  <span>Platform Operations Fee</span>
                  <span className="font-bold text-neutral-200">₹{platformFee}</span>
                </div>

                <div className="border-t border-neutral-900 pt-2.5 flex justify-between items-center text-sm">
                  <span className="font-black text-neutral-100">Grand Total</span>
                  <span className="text-base font-black text-orange-400">₹{grandTotal}</span>
                </div>
              </div>

              {/* Confirm checkout button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span className="text-neutral-950">Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{grandTotal}</span>
                  </>
                )}
              </button>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
