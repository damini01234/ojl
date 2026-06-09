import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Music, UserCheck, Eye, MessageCircle } from 'lucide-react';
import { getNearbyFoodJoints } from '../utils/geoSimulator';

// Default static dataset representing Patna food short reels
export const DEFAULT_REELS = [
  {
    id: 'reel-default-1',
    username: 'patna_bites',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chili-pepper-falling-into-red-powder-28392-large.mp4',
    caption: 'Satisfying crunch of hand-picked red chillies dropping into spice mix. 🌶️🔥 #streetfood #patnafood',
    likesCount: 1845,
    sharesCount: 142,
    isLiked: false,
    dishName: 'Spicy Chilli Samosa',
    restaurantName: "Kapildev's Elevens, Boring Road",
    price: 99,
    isFoodRelated: true
  },
  {
    id: 'reel-default-2',
    username: 'sweet_patna',
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-hands-decorating-a-handmade-soap-2803-large.mp4',
    caption: 'Hot crispy jalebis getting dipped in aromatic sugar syrup. 🍯🌸 #jalebilove #biharifood',
    likesCount: 924,
    sharesCount: 89,
    isLiked: false,
    dishName: 'Desi Ghee Jalebi',
    restaurantName: 'Maurya Heritage, Fraser Road',
    price: 149,
    isFoodRelated: true
  },
  {
    id: 'reel-default-3',
    username: 'momo_junction',
    profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    caption: 'Freshly folded momos steaming over hot custom broths. 🥟🔥 #streetfood #momos #hot',
    likesCount: 3105,
    sharesCount: 423,
    isLiked: false,
    dishName: 'Steaming Veg Momos',
    restaurantName: 'The Local Bistro',
    price: 79,
    isFoodRelated: true
  }
];

/**
 * ReelsFeed component mapping the list of scrolling video reels.
 * 
 * @param {object} props
 * @param {string} props.userAddress - Currently selected address from global state
 * @param {function} props.setUserAddress - Setter to update the global address
 * @param {function} props.onOrderSelect - Callback to trigger checkout panel with chosen food details
 * @param {array} props.reelsDataset - Dynamic dataset of reels
 */
export default function ReelsFeed({ 
  userAddress, 
  setUserAddress,
  onOrderSelect, 
  reelsDataset = DEFAULT_REELS,
  onLikeToggle
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight || 788;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reelsDataset.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      
      {/* FLOATING LOCATION BADGE */}
      <div className="absolute top-16 left-4 z-40 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-white flex items-center gap-2 shadow-lg max-w-[260px] pointer-events-auto">
        <span className="text-orange-500 animate-pulse text-xs shrink-0">📍</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-extrabold leading-none">Delivering to</span>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="Enter address..."
            className="bg-transparent border-none outline-none text-xs font-bold text-neutral-100 placeholder-neutral-500 focus:ring-0 p-0 mt-0.5 min-w-0 truncate"
          />
        </div>
      </div>

      {/* Sleek Glassmorphic Toast Notification Overlay */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-32 inset-x-6 z-50 bg-white/15 backdrop-blur-lg border border-white/20 px-4 py-3 rounded-2xl text-center text-xs font-bold shadow-2xl text-white tracking-wide"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snap-Scrolling Viewport */}
      <div
        onScroll={handleScroll}
        className="snap-y snap-mandatory overflow-y-scroll h-full w-full pb-16 scrollbar-none"
      >
        {reelsDataset.map((reel, index) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            index={index}
            isActive={index === activeIndex}
            userAddress={userAddress}
            onOrderSelect={onOrderSelect}
            triggerToast={triggerToast}
            onLikeToggle={onLikeToggle}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual Reel Item Component.
 * Full-screen layout matching Instagram Reels design.
 */
function ReelItem({ reel, index, isActive, userAddress, onOrderSelect, triggerToast, onLikeToggle }) {
  const videoRef = useRef(null);
  
  const isLiked = reel.isLiked;
  const likesCount = reel.likesCount || 0;
  const [isVerified, setIsVerified] = useState(false);
  const [showFoodCard, setShowFoodCard] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Play/Pause video depending on active status
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay block prevented immediate video play: ", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  // Reset auto-open on reel transition
  useEffect(() => {
    if (isActive) {
      setHasAutoOpened(false);
      setIsVerified(false);
      setShowFoodCard(false);
    }
  }, [isActive]);

  // AUTOMATIC 3-SECOND ORDER CARD POP-UP
  useEffect(() => {
    let timer;
    if (isActive && !hasAutoOpened && reel.isFoodRelated) {
      timer = setTimeout(() => {
        setIsVerified(true);
        setShowFoodCard(true);

        const data = getNearbyFoodJoints(userAddress);
        const calculatedDistance = (Math.random() * 2 + 3).toFixed(1);
        const distanceStr = `• ${calculatedDistance} km away`;

        const activeRestaurant = {
          restaurantName: reel.restaurantName || data.restaurantName,
          distance: distanceStr
        };
        setRestaurantDetails(activeRestaurant);

        // Automatically open the order summary drawer
        onOrderSelect({
          dishTitle: reel.dishName || reel.title || reel.dishTitle || 'Delicious Dish',
          price: reel.price,
          restaurantName: reel.restaurantName || data.restaurantName,
          distance: distanceStr
        });

        setHasAutoOpened(true);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, hasAutoOpened, reel, userAddress, onOrderSelect]);

  const handleLike = () => {
    if (onLikeToggle) {
      onLikeToggle(reel.id);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.origin + `?reel=${reel.id}`;
      await navigator.clipboard.writeText(shareUrl);
      triggerToast('🔗 Link copied to clipboard!');
    } catch (err) {
      triggerToast('❌ Clipboard copy failed.');
    }
  };

  const displayTitle = reel.dishName || reel.title || reel.dishTitle || 'Delicious Dish';
  const displayCaption = reel.caption || reel.description || '';

  return (
    <div className="relative w-full h-full shrink-0 snap-start bg-black flex flex-col justify-end">
      
      {/* 100% CLEAN VIDEO LAYER */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* GRADIENT SHADOW OVERLAYS FOR READABILITY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75 z-10 pointer-events-none" />

      {/* TOP STATUS BADGE: AI ENGINE INDICATOR */}
      <div className="absolute top-16 right-4 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider">
          <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
          <span>
            {isVerified ? 'Verified' : 'Analyzing...'}
          </span>
        </div>
      </div>

      {/* MANUAL FOOD TRIGGER BUTTON / FLOATING INFO CARD */}
      {isVerified && (reel.restaurantName || restaurantDetails) && (
        <div className="absolute top-26 right-4 z-30 transition-all duration-300">
          <button
            onClick={() => onOrderSelect({
              dishTitle: displayTitle,
              price: reel.price,
              restaurantName: reel.restaurantName || restaurantDetails?.restaurantName,
              distance: restaurantDetails?.distance || '• 3.5 km away'
            })}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-neutral-950 text-[10px] font-black rounded-xl shadow-lg uppercase tracking-wider border border-orange-400/20"
          >
            <span>Order (₹{reel.price})</span>
          </button>
        </div>
      )}

      {/* BOTTOM-LEFT OVERLAY CONTENT (CREATOR HANDLE, TITLE, DESCRIPTION) */}
      <div className="absolute bottom-22 left-4 right-16 z-20 space-y-3 pointer-events-none">
        
        {/* Creator Identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f91f7f] via-[#ff5e3a] to-[#ffc837] p-0.5">
            {reel.profilePic ? (
              <img src={reel.profilePic} alt={reel.username} className="w-full h-full rounded-full object-cover border border-black" />
            ) : (
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px] font-black text-white uppercase">
                {reel.username.substring(0, 2)}
              </div>
            )}
          </div>
          <div className="pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">@{reel.username}</span>
              <span className="bg-white/15 text-[8px] text-neutral-200 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                <UserCheck className="w-2.5 h-2.5 text-orange-400" /> Following
              </span>
            </div>
          </div>
        </div>

        {/* Title / Description */}
        <div className="space-y-1">
          {displayTitle && (
            <h3 className="text-xs font-bold text-orange-400 text-shadow tracking-wide leading-none">
              {displayTitle}
            </h3>
          )}
          <p className="text-xs text-neutral-200 leading-relaxed text-shadow max-w-[90%] font-medium">
            {displayCaption}
          </p>
        </div>

        {/* Original Audio Indicator */}
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-semibold">
          <Music className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="truncate max-w-[140px]">Original Audio - @{reel.username}</span>
        </div>
      </div>

      {/* RIGHT SIDE FLOATING BAR */}
      <div className="absolute right-4 bottom-22 z-20 flex flex-col items-center gap-5">
        
        {/* Profile Avatar */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f91f7f] via-[#ff5e3a] to-[#ffc837] p-0.5 shadow-lg flex items-center justify-center shrink-0">
          <img
            src={reel.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
            alt={reel.username}
            className="w-full h-full rounded-full object-cover border border-black"
          />
        </div>

        {/* Heart/Like */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            animate={isLiked ? { scale: [1, 1.4, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleLike}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-md transition duration-200 ${
              isLiked ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-black/35 text-white hover:bg-neutral-800/80'
            }`}
            aria-label="Like reel"
          >
            <Heart className="w-5 h-5 fill-current" />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {likesCount}
          </span>
        </div>

        {/* Comments Button */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => triggerToast('💬 Comments feature coming soon!')}
            className="w-11 h-11 rounded-full bg-black/35 text-white hover:bg-neutral-800/80 flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-md transition duration-200"
            aria-label="View comments"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {Math.floor(likesCount * 0.15)}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleShare}
            className="w-11 h-11 rounded-full bg-black/35 text-white hover:bg-neutral-800/80 flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-md transition duration-200"
            aria-label="Share reel"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {reel.sharesCount || 'Share'}
          </span>
        </div>

        {/* Live / Eye count */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Eye className="w-4.5 h-4.5 text-neutral-300" />
          </div>
          <span className="text-[9px] font-bold text-neutral-400 text-shadow tracking-wider">
            Live
          </span>
        </div>

      </div>

    </div>
  );
}
