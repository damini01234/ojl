import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, UserCheck, Flame, Info } from 'lucide-react';
import { getNearbyFoodJoints } from '../utils/geoSimulator';
import ReelVideo from '../components/ReelVideo';
import ActionBar from '../components/ActionBar';
import OrderNowCard from '../components/OrderNowCard';

export default function FeedPage({ reels, followingList = [], onFollowToggle, onLikeToggle, onSaveToggle }) {
  const { reelId } = useParams();
  const reelsContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Scroll to shared reel on load/change
  useEffect(() => {
    if (reelId && reels.length > 0) {
      const targetIndex = reels.findIndex(r => r.id === reelId);
      if (targetIndex !== -1) {
        setActiveIndex(targetIndex);
        setTimeout(() => {
          const targetEl = document.getElementById(`reel-item-${reelId}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
          } else if (reelsContainerRef.current) {
            const itemHeight = reelsContainerRef.current.clientHeight || 788;
            reelsContainerRef.current.scrollTop = targetIndex * itemHeight;
          }
        }, 150);
      }
    }
  }, [reelId, reels]);
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const handleScroll = (e) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    // Standard viewport height in simulator is 788px
    const itemHeight = container.clientHeight || 788;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">

      {/* Sleek Glassmorphic Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-28 left-6 right-6 z-50 bg-neutral-950/85 backdrop-blur-lg border border-orange-500/30 px-4 py-3 rounded-2xl text-center text-xs font-bold shadow-2xl text-white tracking-wide flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4 text-orange-500" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Snap Scrolling Reel viewport */}
      <div
        ref={reelsContainerRef}
        onScroll={handleScroll}
        className="snap-y snap-mandatory overflow-y-scroll h-full w-full pb-16 scrollbar-none"
      >
        {reels.map((reel, index) => (
          <FeedReelItem
            key={reel.id}
            reel={reel}
            index={index}
            isActive={index === activeIndex}
            isMuted={isMuted}
            followingList={followingList}
            onFollowToggle={onFollowToggle}
            onToggleMute={() => setIsMuted(!isMuted)}
            onLikeToggle={() => onLikeToggle(reel.id)}
            onSaveToggle={() => onSaveToggle(reel.id)}
            triggerToast={triggerToast}
          />
        ))}
      </div>
    </div>
  );
}

function FeedReelItem({ 
  reel, 
  index, 
  isActive, 
  isMuted, 
  followingList = [],
  onFollowToggle,
  onToggleMute, 
  onLikeToggle, 
  onSaveToggle, 
  triggerToast 
}) {
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [cardDismissed, setCardDismissed] = useState(false);

  // AUTOMATIC 3-SECOND TIMER FOR ORDER CARD
  useEffect(() => {
    let timer;
    if (isActive && !cardDismissed) {
      setShowOrderCard(false);
      timer = setTimeout(() => {
        setShowOrderCard(true);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, cardDismissed]);

  // Reset card dismiss state when swiped away
  useEffect(() => {
    if (!isActive) {
      setCardDismissed(false);
      setShowOrderCard(false);
    }
  }, [isActive]);

  const handleShare = async () => {
    try {
      let baseUrl = window.location.href.split('#')[0];
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      const shareUrl = `${baseUrl}#/reel/${reel.id}`;
      await navigator.clipboard.writeText(shareUrl);
      triggerToast('🔗 Reel link copied to clipboard!');
    } catch {
      triggerToast('❌ Copy to clipboard failed.');
    }
  };

  const displayTitle = reel.dishName || 'Gourmet Special';
  const displayCaption = reel.caption || '';
  const price = reel.price || 99;
  const isFollowing = followingList.includes(reel.username);

  return (
    <div
      id={`reel-item-${reel.id}`}
      className="relative w-full h-full shrink-0 snap-start bg-[#050505] flex flex-col justify-end"
    >
      
      {/* 1. Full Screen Video Layer */}
      <ReelVideo
        videoUrl={reel.videoUrl}
        isActive={isActive}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onDoubleTap={onLikeToggle}
      />

      {/* 2. Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10 pointer-events-none" />

      {/* 3. Action Sidebar (Right Floating) */}
      <div className="absolute right-4 bottom-22 z-20 flex flex-col items-center">
        {/* Creator profile avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center shrink-0 mb-5">
          <img
            src={reel.profilePic}
            alt={reel.username}
            className="w-full h-full rounded-full object-cover border border-black"
          />
        </div>

        <ActionBar
          reel={reel}
          onLikeToggle={onLikeToggle}
          onSaveToggle={onSaveToggle}
          onShare={handleShare}
          triggerToast={triggerToast}
        />
      </div>

      {/* 4. Bottom-Left Details Overlay */}
      <div className="absolute bottom-22 left-4 right-18 z-20 space-y-2 pointer-events-none">
        
        {/* Creator Username, Interactive Follow */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white tracking-wide">@{reel.username}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle(reel.username);
              }}
              className={`px-3 py-1 text-[9px] font-black rounded-lg transition duration-250 active:scale-95 flex items-center gap-1 ${
                isFollowing
                  ? 'bg-white/10 hover:bg-white/15 text-neutral-300 border border-white/5'
                  : 'bg-orange-500 hover:bg-orange-600 text-neutral-950 shadow-md uppercase tracking-wider'
              }`}
              type="button"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Dish title */}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-black text-orange-400 text-shadow tracking-wide leading-none uppercase">
            {displayTitle}
          </h3>
        </div>

        {/* Description caption */}
        <p className="text-[11px] text-neutral-200 leading-relaxed text-shadow max-w-[90%] font-medium">
          {displayCaption}
        </p>

        {/* Original audio tag */}
        <div className="flex items-center gap-1.5 text-[8px] text-neutral-400 font-extrabold tracking-wider uppercase">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>Original sound - {reel.restaurantName.split(',')[0]}</span>
        </div>
      </div>

      {/* 5. Floating Compact "Order Now" Card on the right side near Action Buttons */}
      <OrderNowCard
        reel={reel}
        isVisible={showOrderCard && !cardDismissed}
        onClose={() => setCardDismissed(true)}
      />

    </div>
  );
}
