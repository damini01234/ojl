import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReelVideo({ videoUrl, fallbackImage, isActive, isMuted, onToggleMute, onDoubleTap }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(null); // 'play' | 'pause' | null
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const lastTap = useRef(0);

  // Reset loading and error states when video URL changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [videoUrl]);

  // Synchronize muted attribute directly on the DOM element for cross-browser support
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Play/Pause when active state changes
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        setHasError(false);
        setIsLoading(true);
        videoRef.current.currentTime = 0;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn("Autoplay block prevented immediate video play: ", err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, videoUrl]);

  // Handle tap/click and double tap
  const handleVideoTap = (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected -> Trigger Like
      handleDoubleTap(e);
    } else {
      // Single tap -> Toggle Play/Pause
      setTimeout(() => {
        // Only trigger single tap if another tap didn't happen in the meantime
        if (Date.now() - lastTap.current >= DOUBLE_PRESS_DELAY) {
          togglePlayPause();
        }
      }, DOUBLE_PRESS_DELAY);
    }
    lastTap.current = now;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayOverlay('pause');
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setShowPlayOverlay('play');
    }

    // Hide icon overlay after animation
    setTimeout(() => {
      setShowPlayOverlay(null);
    }, 600);
  };

  const handleDoubleTap = (e) => {
    setShowHeartOverlay(true);
    if (onDoubleTap) {
      onDoubleTap();
    }
    setTimeout(() => {
      setShowHeartOverlay(false);
    }, 800);
  };

  // Listen to video events
  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };
  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };
  const handleVideoError = (e) => {
    console.error("Reel video failed to load or play:", e);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className="relative w-full h-full bg-black select-none cursor-pointer flex items-center justify-center overflow-hidden"
      onClick={handleVideoTap}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={fallbackImage}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onLoadedData={handleLoadedData}
        onError={handleVideoError}
        className="w-full h-full object-cover z-0"
      />

      {/* Fallback Image Layer if video fails to load */}
      {hasError && fallbackImage && (
        <img 
          src={fallbackImage} 
          alt="Food Fallback" 
          className="absolute inset-0 w-full h-full object-cover z-0 animate-fadeIn"
        />
      )}

      {/* Buffering/Loading State */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10"
          >
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause Overlay Animation */}
      <AnimatePresence>
        {showPlayOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4 }}
            className="absolute z-10 bg-black/50 backdrop-blur-md p-4 rounded-full text-white"
          >
            {showPlayOverlay === 'play' ? (
              <Play className="w-8 h-8 fill-white" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Tap Heart Pop Up Animation */}
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.3, 1.0, 1.5], rotate: [0, -10, 10, 0] }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.8 }}
            className="absolute z-20 text-red-500"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-24 h-24 drop-shadow-[0_10px_15px_rgba(239,68,68,0.4)]"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute Indicator Overlay (Bottom-Right of Video) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute bottom-24 right-4 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-neutral-800 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
        type="button"
        aria-label="Toggle mute"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-orange-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}
