import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { SAMPLE_REELS } from './data/sampleData';
import { supabase } from './utils/supabaseClient';

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

  // Fetch reels from Supabase
  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          user_id,
          video_url,
          food_name,
          price,
          caption,
          restaurant_name,
          profiles (
            username,
            profile_image
          )
        `)
        .order('id', { ascending: false });

      if (error) throw error;

      const mapped = data.map(v => {
        let handle = v.profiles?.username || 'anonymous';
        if (!handle.startsWith('@')) {
          handle = `@${handle}`;
        }
        return {
          id: v.id,
          userId: v.user_id,
          username: handle,
          profilePic: v.profiles?.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
          videoUrl: v.video_url,
          caption: v.caption || '',
          likesCount: 154,
          sharesCount: 38,
          isLiked: false,
          isSaved: false,
          dishName: v.food_name,
          restaurantName: v.restaurant_name || 'Gourmet Kitchen',
          price: Number(v.price) || 99,
          rating: 4.5,
          deliveryTime: '25 mins',
          deliveryFee: 30,
          followersCount: 1200
        };
      });

      // Merge Supabase reels with SAMPLE_REELS so feed is never blank
      const combined = [...mapped, ...SAMPLE_REELS.filter(sr => !mapped.some(mv => mv.id === sr.id))];
      setReelsDataset(combined);
    } catch (err) {
      console.error("Error fetching reels from Supabase:", err);
      // Fallback
      setReelsDataset(SAMPLE_REELS);
    }
  };

  const fetchUserProfile = async (user) => {
    try {
      let profileData = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error) {
          profileData = data;
        } else if (error.code !== 'PGRST116') {
          console.warn("Supabase profiles query error:", error);
        }
      } catch (dbErr) {
        console.warn("Exception fetching user profile from Supabase:", dbErr);
      }

      if (profileData) {
        let handle = profileData.username || `user_${user.id.slice(0, 5)}`;
        if (!handle.startsWith('@')) {
          handle = `@${handle}`;
        }
        const sessionData = {
          id: user.id,
          fullName: user.user_metadata?.full_name || handle.replace('@', ''),
          creatorHandle: handle,
          email: user.email,
          bio: profileData.bio || '🍔 Just exploring Patna\'s shoppable food reels on MukBites!',
          profilePic: profileData.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'
        };
        setCurrentUser(sessionData);
        localStorage.setItem('mukbites_session', JSON.stringify(sessionData));
      } else {
        const defaultHandle = `@user_${user.id.slice(0, 5)}`;
        const sessionData = {
          id: user.id,
          fullName: user.user_metadata?.full_name || 'MukBites User',
          creatorHandle: defaultHandle,
          email: user.email,
          bio: '🍔 Just exploring Patna\'s shoppable food reels on MukBites!',
          profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'
        };
        setCurrentUser(sessionData);
        localStorage.setItem('mukbites_session', JSON.stringify(sessionData));

        // Attempt background insert of default profile
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            username: defaultHandle,
            bio: sessionData.bio,
            profile_image: sessionData.profilePic
          });
        } catch (dbUpsertErr) {
          console.warn("Failed background upsert of default profile:", dbUpsertErr);
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  useEffect(() => {
    fetchReels();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        // Protect Guest and Local Offline sessions from being wiped out by null sessions from Supabase init
        const savedSessionStr = localStorage.getItem('mukbites_session');
        if (savedSessionStr) {
          try {
            const savedSession = JSON.parse(savedSessionStr);
            const isLocal = savedSession.id?.startsWith('local-') || savedSession.email === 'guest@mukbites.com';
            if (isLocal) {
              // Retain active Guest or Local Offline sessions
              return;
            }
          } catch (e) {}
        }
        setCurrentUser(null);
        localStorage.removeItem('mukbites_session');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setFollowingList([]);
    localStorage.removeItem('mukbites_session');
    localStorage.removeItem('mukbites_following');
  };

  const handleUpdateProfile = (updatedProfile) => {
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
