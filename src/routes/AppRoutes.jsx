import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import FeedPage from '../pages/FeedPage';
import CheckoutPage from '../pages/CheckoutPage';
import ProfilePage from '../pages/ProfilePage';
import UploadPage from '../pages/UploadPage';
import BottomNav from '../components/BottomNav';

// Route Guard Component
function RequireAuth({ children, currentUser }) {
  const location = useLocation();
  if (!currentUser) {
    // Redirect to login page, saving the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function AppRoutes({
  currentUser,
  onLoginSuccess,
  onLogout,
  onUpdateProfile,
  reels,
  followingList,
  onFollowToggle,
  onLikeToggle,
  onSaveToggle,
  orderHistory,
  onAddOrderToHistory,
  onPublish
}) {
  const location = useLocation();

  // Hide bottom navbar on login and checkout pages for a clean full-screen look
  const hideNavbar = ['/login', '/checkout'].includes(location.pathname);

  return (
    <div className="w-full h-full relative bg-black flex flex-col justify-between">
      
      {/* Route Render Space */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <Routes>
          {/* Public Login Route */}
          <Route 
            path="/login" 
            element={
              currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLoginSuccess={onLoginSuccess} />
              )
            } 
          />

          {/* Protected Main Feed Route */}
          <Route
            path="/"
            element={
              <RequireAuth currentUser={currentUser}>
                <FeedPage 
                  reels={reels} 
                  followingList={followingList}
                  onFollowToggle={onFollowToggle}
                  onLikeToggle={onLikeToggle} 
                  onSaveToggle={onSaveToggle} 
                />
              </RequireAuth>
            }
          />

          {/* Protected Dynamic Reel Route */}
          <Route
            path="/reel/:reelId"
            element={
              <RequireAuth currentUser={currentUser}>
                <FeedPage 
                  reels={reels} 
                  followingList={followingList}
                  onFollowToggle={onFollowToggle}
                  onLikeToggle={onLikeToggle} 
                  onSaveToggle={onSaveToggle} 
                />
              </RequireAuth>
            }
          />

          {/* Protected Checkout Route */}
          <Route
            path="/checkout"
            element={
              <RequireAuth currentUser={currentUser}>
                <CheckoutPage onAddOrderToHistory={onAddOrderToHistory} />
              </RequireAuth>
            }
          />

          {/* Protected Profile Route */}
          <Route
            path="/profile"
            element={
              <RequireAuth currentUser={currentUser}>
                <ProfilePage 
                  currentUser={currentUser}
                  orderHistory={orderHistory} 
                  reels={reels} 
                  followingList={followingList}
                  onUpdateProfile={onUpdateProfile}
                  onLogout={onLogout} 
                />
              </RequireAuth>
            }
          />

          {/* Protected Upload Route */}
          <Route
            path="/upload"
            element={
              <RequireAuth currentUser={currentUser}>
                <UploadPage onPublish={onPublish} />
              </RequireAuth>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Persistent Bottom Navbar Navigation (only visible when not on login/checkout) */}
      {!hideNavbar && currentUser && <BottomNav />}

    </div>
  );
}
