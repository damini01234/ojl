import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { SAMPLE_REELS } from './data/sampleData';

/**
 * Main App Container
 * Wraps HashRouter to support client-side routing within a mobile simulator casing.
 */
export default function App() {
  // 1. Session state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem('mukbites_session');
      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });

  // 2. Following state (List of creator handles currently followed)
  const [followingList, setFollowingList] = useState(() => {
    try {
      const saved = localStorage.getItem('mukbites_following');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Reels dataset state
  const [reelsDataset, setReelsDataset] = useState([]);

  // 4. Order History transactions state
  const [orderHistory, setOrderHistory] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('mukbites_orders');
      if (savedOrders) {
        return JSON.parse(savedOrders);
      } else {
        const defaultOrders = [
          {
            id: 'ord-past-1',
            dishTitle: 'Cheesy Lava Burger',
            price: 249,
            quantity: 1,
            restaurantName: 'The Burger Palace, Boring Road',
            paymentMode: 'Online (UPI)',
            grandTotal: 296,
            timestamp: 'Yesterday, 9:15 PM',
            deliveryAddress: 'Boring Road, Patna',
            contactNumber: '9876543210',
            customerName: currentUser?.fullName || 'Patna Foodie'
          },
          {
            id: 'ord-past-2',
            dishTitle: 'Fluffy Honey Pancakes',
            price: 189,
            quantity: 2,
            restaurantName: "Fluffy's Cafe, Kankarbagh",
            paymentMode: 'Cash on Delivery (COD)',
            grandTotal: 433,
            timestamp: '2 days ago',
            deliveryAddress: 'Kankarbagh, Patna',
            contactNumber: '9988776655',
            customerName: currentUser?.fullName || 'Patna Foodie'
          }
        ];
        localStorage.setItem('mukbites_orders', JSON.stringify(defaultOrders));
        return defaultOrders;
      }
    } catch {
      return [];
    }
  });

  // Fetch reels (Frontend-Only data load)
  const fetchReels = () => {
    try {
      const localReels = JSON.parse(localStorage.getItem('mukbites_local_reels') || '[]');
      // Filter SAMPLE_REELS to exclude any that might duplicate IDs
      const combined = [...localReels, ...SAMPLE_REELS.filter(sr => !localReels.some(lr => lr.id === sr.id))];
      setReelsDataset(combined);
    } catch (err) {
      console.error("Error loading local reels:", err);
      setReelsDataset(SAMPLE_REELS);
    }
  };

  useEffect(() => {
    fetchReels();

    // Check active session strictly from local storage for offline operation
    try {
      const savedSession = localStorage.getItem('mukbites_session');
      if (savedSession) {
        setCurrentUser(JSON.parse(savedSession));
      }
    } catch (err) {
      console.error("Failed to load local session:", err);
    }
  }, []);

  const handlePublishReel = () => {
    fetchReels();
  };

  const handleLikeToggle = (reelId) => {
    const updated = reelsDataset.map(r => {
      if (r.id === reelId) {
        const nextIsLiked = !r.isLiked;
        return {
          ...r,
          isLiked: nextIsLiked,
          likesCount: nextIsLiked ? (r.likesCount || 0) + 1 : Math.max(0, (r.likesCount || 0) - 1)
        };
      }
      return r;
    });
    setReelsDataset(updated);
  };

  const handleSaveToggle = (reelId) => {
    const updated = reelsDataset.map(r => {
      if (r.id === reelId) {
        return {
          ...r,
          isSaved: !r.isSaved
        };
      }
      return r;
    });
    setReelsDataset(updated);
  };

  const handleFollowToggle = (username) => {
    let updated;
    const isFollowing = followingList.includes(username);
    
    if (isFollowing) {
      updated = followingList.filter(u => u !== username);
    } else {
      updated = [...followingList, username];
    }
    
    setFollowingList(updated);
    localStorage.setItem('mukbites_following', JSON.stringify(updated));

    const updatedReels = reelsDataset.map(r => {
      if (r.username === username) {
        const currentCount = r.followersCount || 1000;
        return {
          ...r,
          followersCount: isFollowing ? Math.max(0, currentCount - 1) : currentCount + 1
        };
      }
      return r;
    });
    setReelsDataset(updatedReels);
  };

  const handleAddOrderToHistory = (newOrder) => {
    const updated = [newOrder, ...orderHistory];
    setOrderHistory(updated);
    try {
      localStorage.setItem('mukbites_orders', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (session) => {
    setCurrentUser(session);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setFollowingList([]);
    localStorage.removeItem('mukbites_session');
    localStorage.removeItem('mukbites_following');
  };

  const handleUpdateProfile = (updatedProfile) => {
    try {
      const localReels = JSON.parse(localStorage.getItem('mukbites_local_reels') || '[]');
      const updatedLocalReels = localReels.map(r => {
        if (r.userId === updatedProfile.id || r.username.toLowerCase() === (currentUser?.creatorHandle || '').toLowerCase()) {
          return {
            ...r,
            username: updatedProfile.creatorHandle,
            profilePic: updatedProfile.profilePic
          };
        }
        return r;
      });
      localStorage.setItem('mukbites_local_reels', JSON.stringify(updatedLocalReels));
    } catch (err) {
      console.error("Failed to sync local reels with updated profile:", err);
    }

    setCurrentUser(updatedProfile);
    localStorage.setItem('mukbites_session', JSON.stringify(updatedProfile));
    fetchReels(); // Refresh handles and profile pictures in the feed
  };

  return (
    <div className="min-h-screen w-full bg-black md:bg-[#0a0a0b] flex flex-col items-center justify-center md:p-4 selection:bg-orange-500/20 selection:text-orange-400">
      
      {/* Centered High-Fidelity Smartphone Casing on desktop, full-screen on mobile */}
      <div className="relative w-full h-[100dvh] md:h-[852px] md:max-h-[90dvh] max-w-none md:max-w-md bg-black md:rounded-[40px] shadow-none md:shadow-2xl border-0 md:border-[8px] border-neutral-900 overflow-hidden flex flex-col">
        
        {/* Router Context wrapper inside the phone screen */}
        <HashRouter>
          <AppRoutes
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            reels={reelsDataset}
            followingList={followingList}
            onFollowToggle={handleFollowToggle}
            onLikeToggle={handleLikeToggle}
            onSaveToggle={handleSaveToggle}
            orderHistory={orderHistory}
            onAddOrderToHistory={handleAddOrderToHistory}
            onPublish={handlePublishReel}
          />
        </HashRouter>

      </div>

    </div>
  );
}
