import React, { useState, useEffect } from 'react';
import { Compass, Plus, User } from 'lucide-react';
import ReelsFeed, { DEFAULT_REELS } from './components/ReelsFeed';
import UploadModule from './components/UploadModule';
import OrderSummaryPanel from './components/OrderSummaryPanel';
import AuthModule from './components/AuthModule';

/**
 * App Component - The central state controller.
 * Implements Global Route Gating behind a high-fidelity Instagram Signup Screen.
 */
export default function App() {
  // --- STATES ---
  // Active Navigation Tab: 'home' | 'upload' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Creator Session Details: { fullName, creatorHandle, bio }
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem('creator_session');
      return savedSession ? JSON.parse(savedSession) : null;
    } catch {
      return null;
    }
  });

  // Top Bar Search Address query - passed down to ReelsFeed for top badge
  const [userAddress, setUserAddress] = useState("Boring Road, Patna");

  // Reels feed dataset loaded from localStorage key 'patna_shorts_db'
  const [reelsDataset, setReelsDataset] = useState(() => {
    try {
      const saved = localStorage.getItem('patna_shorts_db');
      if (saved) {
        return JSON.parse(saved);
      } else {
        localStorage.setItem('patna_shorts_db', JSON.stringify(DEFAULT_REELS));
        return DEFAULT_REELS;
      }
    } catch {
      return DEFAULT_REELS;
    }
  });

  // Active checkout drawer item trigger
  const [currentOrder, setCurrentOrder] = useState(null);

  // Swiggy/Zomato style past order history logs loaded from localStorage key 'order_history_log'
  const [orderHistoryList, setOrderHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('order_history_log');
      if (saved) {
        return JSON.parse(saved);
      } else {
        const defaults = [
          {
            id: 'past-1',
            dishTitle: 'Spicy Chilli Samosa',
            price: 99,
            quantity: 2,
            restaurantName: "Kapildev's Elevens, Boring Road",
            distance: '• 3.4 km away',
            paymentMode: 'Online UPI / Card',
            grandTotal: 247.90,
            timestamp: 'Yesterday, 8:45 PM',
            deliveryAddress: 'Boring Road, Patna',
            contactNumber: '9876543210'
          },
          {
            id: 'past-2',
            dishTitle: 'Steaming Veg Momos',
            price: 79,
            quantity: 1,
            restaurantName: 'The Local Bistro',
            distance: '• 4.8 km away',
            paymentMode: 'Cash on Delivery (COD)',
            grandTotal: 122.95,
            timestamp: '3 days ago',
            deliveryAddress: 'Fraser Road, Patna',
            contactNumber: '9988776655'
          }
        ];
        localStorage.setItem('order_history_log', JSON.stringify(defaults));
        return defaults;
      }
    } catch {
      return [];
    }
  });

  // Persist session updates to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('creator_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('creator_session');
      }
    } catch (err) {
      console.warn("Failed to persist creator session to localStorage: ", err);
    }
  }, [currentUser]);

  /**
   * Action to prepend a new creator reel to the feed database.
   */
  const handlePublishReel = (newReel) => {
    const updated = [newReel, ...reelsDataset];
    setReelsDataset(updated);
    try {
      localStorage.setItem('patna_shorts_db', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to commit new reel to patna_shorts_db pool: ", err);
    }
  };

  /**
   * Toggle Like state for a specific reel and sync back to database
   */
  const handleLikeToggle = (reelId) => {
    const updated = reelsDataset.map(reel => {
      if (reel.id === reelId) {
        const nextIsLiked = !reel.isLiked;
        return {
          ...reel,
          isLiked: nextIsLiked,
          likesCount: nextIsLiked ? (reel.likesCount || 0) + 1 : Math.max(0, (reel.likesCount || 0) - 1)
        };
      }
      return reel;
    });
    setReelsDataset(updated);
    try {
      localStorage.setItem('patna_shorts_db', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to commit like toggle to patna_shorts_db: ", err);
    }
  };

  const handleOrderSelect = (orderItem) => {
    setCurrentOrder(orderItem);
  };

  const handleAddOrderToHistory = (newOrder) => {
    const updated = [newOrder, ...orderHistoryList];
    setOrderHistoryList(updated);
    try {
      localStorage.setItem('order_history_log', JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save order to history log: ", err);
    }
  };

  const handleCloseDrawer = () => {
    setCurrentOrder(null);
  };

  // --- REQUIREMENT 1: GLOBAL ROUTE GATING ---
  // If no creator session exists, strictly lock the screen to render AuthModule signup.
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#0e0e0e] flex flex-col items-center justify-center p-4 selection:bg-neutral-800 selection:text-white">
        
        {/* Strict smartphone centered casing */}
        <div className="relative w-full max-w-md h-[852px] bg-black rounded-[40px] shadow-2xl border-[8px] border-neutral-900 overflow-hidden flex flex-col justify-center">
          
          {/* Notch bezel */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-55 pointer-events-none flex items-center justify-center border border-neutral-850">
            <div className="w-3 h-3 bg-neutral-900 rounded-full ml-auto mr-4 border border-neutral-800" />
          </div>

          {/* Full Screen Gate Overlay */}
          <AuthModule setCurrentUser={setCurrentUser} />
          
        </div>

        {/* Info text */}
        <div className="mt-4 text-center max-w-sm pointer-events-none">
          <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">MukBites Simulator</p>
          <p className="text-[9px] text-neutral-700">Please authenticate to access Patna Shoppable Food Reels.</p>
        </div>

      </div>
    );
  }

  // --- UNLOCKED FULL SYSTEM ---
  return (
    <div className="min-h-screen w-full bg-[#0e0e0e] flex flex-col items-center justify-center p-4 selection:bg-neutral-850 selection:text-white">
      
      {/* Strict smartphone centered casing */}
      <div className="relative w-full max-w-md h-[852px] bg-black rounded-[40px] shadow-2xl border-[8px] border-neutral-900 overflow-hidden flex flex-col">
        
        {/* Notch bezel */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 pointer-events-none flex items-center justify-center border border-neutral-850">
          <div className="w-3 h-3 bg-neutral-900 rounded-full ml-auto mr-4 border border-neutral-850" />
        </div>

        {/* MAIN COMPONENT STREAM VIEWER */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black">
          {activeTab === 'home' && (
            <ReelsFeed
              userAddress={userAddress}
              setUserAddress={setUserAddress}
              onOrderSelect={handleOrderSelect}
              reelsDataset={reelsDataset}
              onLikeToggle={handleLikeToggle}
            />
          )}

          {activeTab === 'upload' && (
            <UploadModule
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onPublish={handlePublishReel}
              onNavigateHome={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'profile' && (
            <OrderSummaryPanel
              isStandalone={true}
              isOpen={true}
              currentOrder={null}
              orderHistoryList={orderHistoryList}
              onClose={() => {}}
              onAddOrderToHistory={handleAddOrderToHistory}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              reelsDataset={reelsDataset}
            />
          )}
        </div>

        {/* 
          MODAL DRAWER BILLING (SLIDE SHEETS OVERLAY)
          Active when ordering from Home or Upload tabs.
        */}
        {activeTab !== 'profile' && (
          <OrderSummaryPanel
            isStandalone={false}
            isOpen={currentOrder !== null}
            currentOrder={currentOrder}
            orderHistoryList={orderHistoryList}
            onClose={handleCloseDrawer}
            onAddOrderToHistory={handleAddOrderToHistory}
          />
        )}

        {/* FIXED BOTTOM NAVIGATION PANEL WRAPPER */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-neutral-950 border-t border-neutral-900 flex justify-around items-center z-50">
          
          {/* Tab 1: Home Feed */}
          <button
            onClick={() => {
              setActiveTab('home');
              handleCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center p-2.5 transition rounded-xl ${
              activeTab === 'home' ? 'text-orange-500 scale-105' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            type="button"
            aria-label="Home Feed"
          >
            <Compass className="w-5.5 h-5.5" />
            <span className="text-[9px] mt-0.5 font-bold">Feed</span>
          </button>

          {/* Tab 2: Create Post */}
          <button
            onClick={() => {
              setActiveTab('upload');
              handleCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center p-2.5 transition rounded-xl ${
              activeTab === 'upload' ? 'text-orange-500 scale-105' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            type="button"
            aria-label="Create Post"
          >
            <Plus className="w-5.5 h-5.5" />
            <span className="text-[9px] mt-0.5 font-bold">Create</span>
          </button>

          {/* Tab 3: Profile */}
          <button
            onClick={() => {
              setActiveTab('profile');
              handleCloseDrawer();
            }}
            className={`flex flex-col items-center justify-center p-2.5 transition rounded-xl ${
              activeTab === 'profile' ? 'text-orange-500 scale-105' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            type="button"
            aria-label="Profile"
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[9px] mt-0.5 font-bold">Profile</span>
          </button>

        </div>

      </div>

      {/* FOOTER INFO BANNER */}
      <div className="mt-4 text-center space-y-0.5 max-w-sm pointer-events-none">
        <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">MukBites Smartphone Simulator</p>
        <p className="text-[9px] text-neutral-700">Immersive Reels feed, fast publishing, & automated food orders.</p>
      </div>

    </div>
  );
}
