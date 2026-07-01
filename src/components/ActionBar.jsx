import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionBar({ 
  reel, 
  onLikeToggle, 
  onSaveToggle, 
  onShare, 
  triggerToast 
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load comments from localStorage or generate defaults based on reel ID
  useEffect(() => {
    try {
      const savedComments = localStorage.getItem(`mukbites_comments_${reel.id}`);
      if (savedComments) {
        setCommentsList(JSON.parse(savedComments));
      } else {
        const defaultComments = [
          {
            id: 'c1',
            username: 'patna_foodie_99',
            profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
            text: `This looks absolutely mouthwatering! 🤤 Can't wait to try it from ${reel.restaurantName.split(',')[0]}!`,
            timestamp: '2h ago'
          },
          {
            id: 'c2',
            username: 'street_gourmet',
            profilePic: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50&h=50&fit=crop',
            text: 'MukBites delivered this in just 20 minutes! Super hot and fresh. 🔥🚴',
            timestamp: '5h ago'
          },
          {
            id: 'c3',
            username: 'spicy_delight',
            profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
            text: 'Is this the best dish on their menu? Recommended!',
            timestamp: '1d ago'
          }
        ];
        localStorage.setItem(`mukbites_comments_${reel.id}`, JSON.stringify(defaultComments));
        setCommentsList(defaultComments);
      }
    } catch {
      setCommentsList([]);
    }
  }, [reel]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Get current session details
    let sessionUser = { fullName: 'MukBites User', creatorHandle: '@anonymous', profilePic: '' };
    try {
      const savedSession = localStorage.getItem('mukbites_session');
      if (savedSession) {
        sessionUser = JSON.parse(savedSession);
      }
    } catch (err) {
      console.warn(err);
    }

    const commentObj = {
      id: `c-${Date.now()}`,
      username: (sessionUser.creatorHandle || '@anonymous').replace('@', ''),
      profilePic: sessionUser.profilePic || '',
      text: newComment.trim(),
      timestamp: 'Just now'
    };

    const updated = [commentObj, ...commentsList];
    setCommentsList(updated);
    setNewComment('');
    
    try {
      localStorage.setItem(`mukbites_comments_${reel.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLikeToggle();
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSaveToggle();
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-5 z-20">
        
        {/* Like Action */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLikeClick}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-md transition duration-200 ${
              reel.isLiked 
                ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                : 'bg-black/35 text-white border-white/10 hover:bg-neutral-800/80'
            }`}
            aria-label="Like video"
            type="button"
          >
            <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {reel.likesCount}
          </span>
        </div>

        {/* Comment Action */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(true);
            }}
            className="w-11 h-11 rounded-full bg-black/35 text-white border border-white/10 hover:bg-neutral-800/80 flex items-center justify-center shadow-lg backdrop-blur-md transition duration-200"
            aria-label="Open comments"
            type="button"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {commentsList.length}
          </span>
        </div>

        {/* Share Action */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleShareClick}
            className="w-11 h-11 rounded-full bg-black/35 text-white border border-white/10 hover:bg-neutral-800/80 flex items-center justify-center shadow-lg backdrop-blur-md transition duration-200"
            aria-label="Share reel"
            type="button"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {reel.sharesCount}
          </span>
        </div>

        {/* Save Action */}
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleSaveClick}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg border backdrop-blur-md transition duration-200 ${
              reel.isSaved 
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' 
                : 'bg-black/35 text-white border-white/10 hover:bg-neutral-800/80'
            }`}
            aria-label="Save dish"
            type="button"
          >
            <Bookmark className={`w-5 h-5 ${reel.isSaved ? 'fill-current' : ''}`} />
          </motion.button>
          <span className="text-[10px] font-bold text-white text-shadow tracking-wider">
            {reel.isSaved ? 'Saved' : 'Save'}
          </span>
        </div>

      </div>

      {/* Slide-Up Comments Drawer Overlay */}
      <AnimatePresence>
        {showComments && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/55 z-40"
            />

            {/* Slide up sheet */}
            <motion.div
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 inset-x-0 bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[60%] flex flex-col z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing on inner tap
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-850 bg-neutral-950/80 sticky top-0 shrink-0">
                <span className="text-sm font-extrabold text-neutral-100 tracking-wide">
                  Comments ({commentsList.length})
                </span>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-20">
                {commentsList.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    <p className="text-xs italic">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  commentsList.map((comm) => (
                    <div key={comm.id} className="flex gap-3 items-start animate-fadeIn">
                      {comm.profilePic ? (
                        <img 
                          src={comm.profilePic} 
                          alt={comm.username} 
                          className="w-7 h-7 rounded-full object-cover border border-neutral-800 shrink-0" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black text-[9px] uppercase shrink-0">
                          {comm.username.substring(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-200">@{comm.username}</span>
                          <span className="text-[9px] text-neutral-500">{comm.timestamp}</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                          {comm.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sticky bottom comment bar */}
              <form 
                onSubmit={handlePostComment}
                className="absolute bottom-0 inset-x-0 p-3 bg-neutral-950 border-t border-neutral-850 flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Add a comment for this food..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-700 transition"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="w-10 h-10 rounded-xl bg-orange-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 flex items-center justify-center font-bold active:scale-95 transition"
                  aria-label="Post comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
