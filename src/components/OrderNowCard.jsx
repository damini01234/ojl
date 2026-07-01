import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderNowCard({ reel, isVisible, onClose }) {
  const navigate = useNavigate();

  const handleOrderClick = (e) => {
    e.stopPropagation();
    // Navigate to the Swiggy-style checkout page, passing the reel info in state
    navigate('/checkout', { state: { reel } });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="absolute right-4 top-14 z-30 w-32 bg-neutral-950/90 border border-white/10 rounded-2xl p-2.5 shadow-2xl flex flex-col items-center pointer-events-auto"
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
          <div className="w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/5 relative bg-neutral-900 mb-1.5">
            <img 
              src={reel.profilePic} 
              alt={reel.dishName} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Food name */}
          <h4 className="text-[10px] font-black text-neutral-100 text-center w-full truncate leading-tight px-0.5">
            {reel.dishName}
          </h4>

          {/* Price Tag */}
          <span className="text-[11px] font-black text-orange-400 mt-0.5 mb-1.5 text-center">
            ₹{reel.price}
          </span>

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
