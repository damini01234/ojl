import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderNowCard({ reel, isVisible, onClose }) {
  const navigate = useNavigate();

  const handleOrderClick = (e) => {
    e.stopPropagation();
    // Navigate to the Swiggy-style checkout page, passing the reel info in state
    navigate('/checkout', { state: { reel } });
  };

  // Clean restaurant name to avoid card overflow
  const shortRestName = reel.restaurantName ? reel.restaurantName.split(',')[0].trim() : 'Gourmet Kitchen';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="absolute right-4 top-14 z-30 w-36 bg-neutral-950/90 border border-white/10 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // Prevent triggering parent taps
        >
          {/* Close button top right of the thumbnail */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-200 z-10 border border-white/5"
            type="button"
            aria-label="Dismiss card"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Food Image Thumbnail */}
          <div className="w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/5 relative bg-neutral-900 mb-1.5 flex items-center justify-center">
            <img 
              src={reel.foodImage || reel.profilePic} 
              alt={reel.dishName} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Food name */}
          <h4 className="text-[10px] font-black text-neutral-100 text-center w-full truncate leading-tight px-0.5">
            {reel.dishName}
          </h4>

          {/* Restaurant details */}
          <p className="text-[8px] text-neutral-400 text-center w-full truncate leading-none mt-0.5">
            {shortRestName}
          </p>

          {/* Price Tag & Rating Row */}
          <div className="flex items-center justify-between w-full mt-1.5 mb-2 px-1 text-[10px]">
            <span className="font-black text-orange-400">
              ₹{reel.price}
            </span>
            <div className="flex items-center gap-0.5 text-[8.5px] text-amber-400 font-extrabold bg-amber-500/10 px-1 py-0.5 rounded-md">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{reel.rating || 4.5}</span>
            </div>
          </div>

          {/* Action Order Button */}
          <button
            onClick={handleOrderClick}
            className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-neutral-950 font-black rounded-lg shadow-md text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-all duration-150"
            type="button"
          >
            <ShoppingBag className="w-3 h-3 fill-current" />
            <span>Order</span>
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
