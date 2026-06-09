import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, CreditCard, ShoppingBag, Landmark, ArrowRight, CheckCircle2, Loader2, History, Settings, Grid, Film, Award } from 'lucide-react';

/**
 * OrderSummaryPanel component.
 * Supports drawer modal mode (slide-up bottom sheet) and standalone tab page mode (Instagram Profile Tab).
 */
export default function OrderSummaryPanel({
  isOpen,
  currentOrder,
  orderHistoryList,
  onClose,
  onAddOrderToHistory,
  isStandalone = false,
  currentUser = null,
  setCurrentUser = null,
  reelsDataset = []
}) {
  // Local states for checkout form
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState('Online UPI / Card');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Preserve the last selected order to prevent glitches during slide-down animations
  const [displayOrder, setDisplayOrder] = useState(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editBio, setEditBio] = useState('');

  // Sync edits when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName || '');
      setEditBio(currentUser.bio || '🍳 Creating delicious short reels & street food loops.\n📍 Patna, Bihar | Tap any food reel to order instantly!');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentOrder) {
      setDisplayOrder(currentOrder);
      setQuantity(1);
      setPaymentMode('Online UPI / Card');
      setAddress('');
      setContactNumber('');
      setValidationError('');
      setIsConfirming(false);
      setIsSuccess(false);
    }
  }, [currentOrder]);

  // Reset success state when reopening drawer
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
      setIsSuccess(false);
      setValidationError('');
    }
  }, [isOpen]);

  // Standalone tab mode: Profile page + Past Orders List
  if (isStandalone) {
    const userHandleClean = currentUser?.creatorHandle?.replace('@', '').toLowerCase() || '';
    const userPostCount = reelsDataset.filter(
      r => r.username?.toLowerCase() === userHandleClean
    ).length;

    return (
      <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden pt-12">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-100 tracking-tight text-md">
              {currentUser?.creatorHandle || '@creator'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300">
            <button 
              onClick={() => {
                if (setCurrentUser) {
                  setCurrentUser(null);
                }
              }}
              className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
              type="button"
            >
              Log Out
            </button>
            <Settings className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Profile Details (Instagram Grid / Stats layout) */}
        <div className="flex-1 overflow-y-auto scrollbar-none pb-20">
          
          {/* Header Row */}
          <div className="p-4 flex items-center justify-between gap-6">
            {/* Circular Profile Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f91f7f] via-[#ff5e3a] to-[#ffc837] p-0.5 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl font-black text-white select-none">
                {currentUser?.creatorHandle ? currentUser.creatorHandle.substring(1, 3).toUpperCase() : 'ME'}
              </div>
            </div>

            {/* Statistics */}
            <div className="flex flex-1 justify-around items-center text-center">
              <div>
                <p className="text-md font-black text-white">{userPostCount}</p>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Posts</p>
              </div>
              <div>
                <p className="text-md font-black text-white">12.8K</p>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Followers</p>
              </div>
              <div>
                <p className="text-md font-black text-white">356</p>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Following</p>
              </div>
            </div>
          </div>

          {/* User Bio and Inline Edit profile inputs */}
          {isEditingProfile ? (
            <div className="px-4 py-3 bg-neutral-900 border border-neutral-850 rounded-2xl mx-4 mb-4 space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-black text-orange-500">Edit Profile Details</h3>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-450 font-bold uppercase pl-1 block">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-450 font-bold uppercase pl-1 block">Bio Description</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl py-2 px-3 text-xs text-white outline-none transition resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    if (setCurrentUser) {
                      const updatedUser = {
                        ...currentUser,
                        fullName: editFullName,
                        bio: editBio
                      };
                      setCurrentUser(updatedUser);
                      localStorage.setItem('creator_session', JSON.stringify(updatedUser));
                    }
                    setIsEditingProfile(false);
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-xl text-xs font-black transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditFullName(currentUser?.fullName || '');
                    setEditBio(currentUser?.bio || '');
                    setIsEditingProfile(false);
                  }}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-1">
              <h2 className="text-xs font-bold text-neutral-100">{currentUser?.fullName || 'Food Creator'}</h2>
              <p className="text-[10px] text-neutral-500 font-semibold">Chef & Digital Creator</p>
              <p className="text-xs text-neutral-350 leading-relaxed font-medium whitespace-pre-wrap">
                {currentUser?.bio || '🍳 Creating delicious short reels & street food loops.\n📍 Patna, Bihar | Tap any food reel to order instantly!'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            <button 
              onClick={() => setIsEditingProfile(prev => !prev)}
              className="py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-200 hover:bg-neutral-850 hover:text-white transition"
            >
              {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button 
              onClick={() => {
                try {
                  navigator.clipboard.writeText(window.location.origin + `?user=${currentUser?.creatorHandle}`);
                  alert("Profile link copied to clipboard!");
                } catch {
                  alert("Copy failed.");
                }
              }}
              className="py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-200 hover:bg-neutral-850 hover:text-white transition"
            >
              Share Profile
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-t border-b border-neutral-900 text-neutral-500">
            <button className="flex-1 py-3 flex items-center justify-center border-b-2 border-white text-white">
              <Film className="w-5 h-5" />
            </button>
            <button className="flex-1 py-3 flex items-center justify-center border-b-2 border-transparent hover:text-white transition">
              <Grid className="w-5 h-5" />
            </button>
            <button className="flex-1 py-3 flex items-center justify-center border-b-2 border-transparent hover:text-white transition">
              <Award className="w-5 h-5" />
            </button>
          </div>

          {/* Past Order History Section */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <History className="w-4 h-4 text-orange-500" />
              <span className="text-xs uppercase font-extrabold tracking-widest">Order History List</span>
            </div>

            {orderHistoryList.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900/20 border border-neutral-900 rounded-2xl p-6">
                <ShoppingBag className="w-8 h-8 text-neutral-700 mx-auto animate-pulse" />
                <p className="text-xs text-neutral-600 italic mt-2">No past food transactions found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderHistoryList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-neutral-900/60 border border-neutral-900 rounded-2xl space-y-2.5 hover:border-neutral-800 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-200 leading-tight">{item.dishTitle}</h4>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          🏢 {item.restaurantName}
                        </p>
                        {item.deliveryAddress && (
                          <p className="text-[9px] text-neutral-600 mt-0.5 max-w-[280px] truncate">
                            📍 {item.deliveryAddress}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-850 px-2 py-0.5 rounded-full border border-neutral-800">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] border-t border-neutral-850 pt-2 text-neutral-500">
                      <span>{item.timestamp || 'Just now'} • {item.paymentMode}</span>
                      <span className="font-bold text-orange-400">₹{parseFloat(item.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Slide Drawer Mode
  if (!displayOrder) return null;

  // Invoice calculations
  const price = displayOrder.price || 0;
  const subtotal = price * quantity;
  const gstSurcharge = subtotal * 0.05; // 5% GST
  const platformFee = 5; // Flat ₹5
  const deliverySurcharge = 25; // Flat ₹25
  const grandTotal = subtotal + gstSurcharge + platformFee + deliverySurcharge;

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Simulates loading, validates inputs, and adds to past orders list
  const handleConfirmOrder = () => {
    setValidationError('');
    const cleanAddress = address.trim();
    const cleanPhone = contactNumber.trim();

    if (!cleanAddress) {
      setValidationError('Delivery address is required.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsConfirming(true);
    
    setTimeout(() => {
      setIsConfirming(false);
      setIsSuccess(true);
      
      const newTransaction = {
        id: `ord-${Date.now()}`,
        dishTitle: displayOrder.dishTitle,
        price: price,
        quantity: quantity,
        restaurantName: displayOrder.restaurantName,
        distance: displayOrder.distance || '• 3.2 km away',
        paymentMode: paymentMode,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        timestamp: 'Just now',
        deliveryAddress: cleanAddress,
        contactNumber: cleanPhone
      };
      
      onAddOrderToHistory(newTransaction);
    }, 1500);
  };

  return (
    <>
      {/* Semi-transparent drawer backdrop */}
      <div 
        onClick={!isConfirming && !isSuccess ? onClose : undefined}
        className={`absolute inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer slide-up bottom sheet */}
      <div 
        className={`absolute bottom-0 inset-x-0 bg-neutral-900 border-t border-neutral-800 text-white rounded-t-[24px] z-55 flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } max-h-[82%] pb-6`}
      >
        {/* Top Drag Indicator Pill */}
        <div className="w-12 h-1.5 bg-neutral-800 rounded-full mx-auto my-3 shrink-0" />

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-neutral-850 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="font-bold tracking-tight text-md text-neutral-100">
              Checkout Cart
            </span>
          </div>
          
          {!isConfirming && !isSuccess && (
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white transition duration-200"
              aria-label="Close checkout"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-xl font-black text-emerald-400 tracking-tight">Order Placed!</h2>
            <p className="text-neutral-400 text-xs mt-1.5 px-4 font-medium">
              Preparing your dish from <span className="text-neutral-200 font-semibold">{displayOrder.restaurantName}</span>.
            </p>

            <div className="my-5 p-4 rounded-xl bg-neutral-950/80 border border-neutral-850 w-full max-w-xs space-y-2 text-left">
              <p className="text-[9px] uppercase text-neutral-500 tracking-widest font-bold">Payment Status</p>
              <p className="text-xs font-bold text-neutral-100">
                {paymentMode === 'Online UPI / Card' 
                  ? 'Paid via Online UPI' 
                  : 'To be paid via Cash on Delivery'}
              </p>
              <div className="border-t border-neutral-850 my-2 pt-2 flex justify-between">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Grand Total</p>
                <p className="text-sm font-black text-orange-400">₹{grandTotal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs py-3.5 bg-orange-500 hover:bg-orange-600 text-neutral-950 font-black rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
            >
              <span>Back to Reels Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* STANDARD CART CHECKOUT VIEW */
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none pb-20">
            
            {/* Active Cart Details */}
            <div className="bg-neutral-950/50 border border-neutral-850 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-orange-400 uppercase">Selected Dish</span>
                  <h3 className="text-md font-bold text-white mt-0.5 leading-tight">{displayOrder.dishTitle}</h3>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                    🏢 {displayOrder.restaurantName} <span className="text-neutral-600">{displayOrder.distance}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-md font-black text-neutral-100">₹{price}</p>
                  <p className="text-[9px] text-neutral-500 font-semibold">per item</p>
                </div>
              </div>

              {/* Quantity incrementor */}
              <div className="flex items-center justify-between border-t border-neutral-850 pt-3">
                <span className="text-xs font-bold text-neutral-300">Select Quantity</span>
                <div className="flex items-center bg-neutral-900 rounded-xl p-1 border border-neutral-800">
                  <button
                    type="button"
                    onClick={decrementQty}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={incrementQty}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Inputs */}
            <div className="space-y-3 bg-neutral-950/30 p-4 border border-neutral-850 rounded-2xl">
              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block">Delivery details</span>
              
              {/* Shipping Address Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold pl-0.5">Shipping Address</label>
                <textarea
                  rows="2"
                  placeholder="Enter complete address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-700 rounded-xl py-2 px-3 text-xs text-white outline-none placeholder-neutral-600 transition resize-none focus:ring-1 focus:ring-neutral-700"
                />
              </div>

              {/* Contact Number Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-semibold pl-0.5">Contact Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="e.g. 9876543210"
                  value={contactNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // digit regex
                    setContactNumber(val);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-700 rounded-xl py-2 px-3 text-xs text-white outline-none placeholder-neutral-600 transition focus:ring-1 focus:ring-neutral-700"
                />
              </div>

              {validationError && (
                <p className="text-[10px] text-red-500 font-bold pl-0.5 animate-pulse">
                  ⚠️ {validationError}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                <button
                  type="button"
                  onClick={() => setPaymentMode('Online UPI / Card')}
                  className={`py-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition ${
                    paymentMode === 'Online UPI / Card'
                      ? 'bg-neutral-800 text-orange-400 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Online / UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('Cash on Delivery (COD)')}
                  className={`py-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition ${
                    paymentMode === 'Cash on Delivery (COD)'
                      ? 'bg-neutral-800 text-orange-400 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-neutral-950/20 rounded-2xl border border-neutral-850 p-4 space-y-2.5 text-xs">
              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 block">Bill Breakdown</span>
              <div className="flex justify-between text-neutral-400">
                <span>Item Subtotal ({quantity} x ₹{price})</span>
                <span className="font-semibold text-neutral-250">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Goods & Services Tax (5% GST)</span>
                <span className="font-semibold text-neutral-250">₹{gstSurcharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Platform Operational Fee</span>
                <span className="font-semibold text-neutral-250">₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Delivery Surcharge</span>
                <span className="font-semibold text-neutral-250">₹{deliverySurcharge}</span>
              </div>
              <div className="border-t border-neutral-850 my-2 pt-2 flex justify-between items-center text-sm">
                <span className="font-bold text-neutral-100">Grand Total</span>
                <span className="text-md font-black text-orange-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Drawer Button */}
            <div className="pt-2">
              <button
                onClick={handleConfirmOrder}
                disabled={isConfirming}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-850/40 disabled:text-neutral-500 text-neutral-950 font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order (₹{grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
          </div>
        )}
      </div>
    </>
  );
}
