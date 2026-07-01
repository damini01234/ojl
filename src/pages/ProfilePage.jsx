import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ShoppingBag, Settings, Grid, Film, Award, LogOut, Edit3, CheckCircle, Camera, Check, Link } from 'lucide-react';
import { AVATAR_PRESETS } from '../data/sampleData';
import { supabase } from '../utils/supabaseClient';

export default function ProfilePage({ currentUser, orderHistory, reels, followingList = [], onUpdateProfile, onLogout }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reels'); // 'reels' | 'saved' | 'history'
  
  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editHandle, setEditHandle] = useState(currentUser?.creatorHandle || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editPic, setEditPic] = useState(currentUser?.profilePic || AVATAR_PRESETS[0]);
  
  // Avatar presets modal state
  const [showPicModal, setShowPicModal] = useState(false);
  const [customPicUrl, setCustomPicUrl] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Sync edits when currentUser prop/state changes
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.fullName || '');
      setEditHandle(currentUser.creatorHandle || '');
      setEditBio(currentUser.bio || '');
      setEditPic(currentUser.profilePic || AVATAR_PRESETS[0]);
    }
  }, [currentUser]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setValidationError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('food-videos')
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('food-videos')
        .getPublicUrl(filePath);

      setEditPic(publicUrl);
      setCustomPicUrl(publicUrl);
    } catch (err) {
      setValidationError(err.message || 'Failed to upload avatar image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full h-full bg-[#0b0b0c] text-white flex flex-col items-center justify-center p-4">
        <p className="text-xs text-neutral-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setValidationError('');
    const nameTrim = editName.trim();
    let handleTrim = editHandle.trim();
    const bioTrim = editBio.trim();

    if (!nameTrim) {
      setValidationError('Display Name cannot be empty.');
      return;
    }
    if (!handleTrim) {
      setValidationError('Username handle cannot be empty.');
      return;
    }

    if (!handleTrim.startsWith('@')) {
      handleTrim = `@${handleTrim}`;
    }

    setIsSaving(true);

    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          username: handleTrim,
          bio: bioTrim,
          profile_image: editPic
        })
        .eq('id', currentUser.id);

      if (profileErr) throw profileErr;

      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: nameTrim
        }
      });
      if (authErr) throw authErr;

      const updated = {
        ...currentUser,
        fullName: nameTrim,
        creatorHandle: handleTrim,
        bio: bioTrim,
        profilePic: editPic
      };

      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
      setIsEditingProfile(false);
    } catch (err) {
      setValidationError(err.message || 'Failed to update profile in database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  // Filter reels created by this user
  const userHandleClean = currentUser.creatorHandle.replace('@', '').toLowerCase();
  const myReels = reels.filter(r => r.username.toLowerCase() === userHandleClean);
  // Filter reels saved by the user
  const savedReels = reels.filter(r => r.isSaved);

  // Followers base count (e.g. 14200) plus 25 extra if they are follow-famous
  const followersCount = 14200;
  // Following count equals base (e.g. 235) plus the dynamic count of followed creators
  const followingCount = 235 + followingList.length;

  return (
    <div className="w-full h-full bg-[#0b0b0c] text-white flex flex-col overflow-hidden pt-12">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-10 shrink-0">
        <span className="font-extrabold text-neutral-200 tracking-tight text-sm">
          {currentUser.creatorHandle}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogoutClick}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/10 active:scale-95 transition"
            title="Log Out"
            type="button"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <Settings className="w-4.5 h-4.5 text-neutral-400 hover:text-white cursor-pointer transition" />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-20">
        
        {/* Profile Card & Avatar Row */}
        <div className="p-4 flex items-center justify-between gap-6">
          {/* Circular Profile Avatar (Interactive when editing) */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shrink-0 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#111112] flex items-center justify-center">
                {(isEditingProfile ? editPic : currentUser.profilePic) ? (
                  <img src={isEditingProfile ? editPic : currentUser.profilePic} alt={currentUser.fullName} className="w-full h-full object-cover border border-black" />
                ) : (
                  <span className="text-xl font-black text-white">
                    {currentUser.creatorHandle.substring(1, 3).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Camera change trigger */}
            {isEditingProfile && (
              <button
                onClick={() => setShowPicModal(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-500 border-2 border-[#0b0b0c] flex items-center justify-center text-neutral-950 hover:bg-orange-600 shadow-md transition active:scale-95"
                type="button"
                aria-label="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Statistics */}
          <div className="flex flex-1 justify-around items-center text-center">
            <div>
              <p className="text-sm font-black text-white">{myReels.length}</p>
              <p className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-wide">Posts</p>
            </div>
            <div>
              <p className="text-sm font-black text-white">{followersCount.toLocaleString()}</p>
              <p className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-wide">Followers</p>
            </div>
            <div>
              <p className="text-sm font-black text-white">{followingCount.toLocaleString()}</p>
              <p className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-wide">Following</p>
            </div>
          </div>
        </div>

        {/* Bio / Editor Section */}
        {isEditingProfile ? (
          <div className="mx-4 mb-4 p-4 bg-neutral-950/80 border border-neutral-900 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-900">
              <span className="text-[10px] uppercase font-black text-orange-500">Edit Instagram Profile</span>
              <button 
                type="button"
                onClick={() => setShowPicModal(true)}
                className="text-[10px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition"
              >
                <Camera className="w-3 h-3" /> Change Photo
              </button>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
              />
            </div>

            {/* Username handle */}
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Username (Handle)</label>
              <input
                type="text"
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition"
              />
            </div>

            {/* Bio text */}
            <div className="space-y-1">
              <label className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Bio Description</label>
              <textarea
                rows="2"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none transition resize-none"
              />
            </div>

            {validationError && (
              <p className="text-[9px] text-red-500 font-bold animate-pulse pl-0.5">
                ⚠️ {validationError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-neutral-950 rounded-xl text-xs font-black transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditName(currentUser.fullName);
                  setEditHandle(currentUser.creatorHandle);
                  setEditBio(currentUser.bio);
                  setEditPic(currentUser.profilePic || AVATAR_PRESETS[0]);
                  setIsEditingProfile(false);
                }}
                className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-neutral-100">{currentUser.fullName}</h2>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-[10px] font-bold text-neutral-300 rounded-lg transition active:scale-95"
                aria-label="Edit Profile"
                type="button"
              >
                <Edit3 className="w-3 h-3 text-orange-400" /> Edit Profile
              </button>
            </div>
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">MukBites Foodie</p>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium whitespace-pre-wrap">
              {currentUser.bio}
            </p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-t border-b border-neutral-900 text-neutral-500 sticky top-0 bg-[#0b0b0c] z-10">
          <button 
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-3.5 flex items-center justify-center border-b-2 transition ${
              activeTab === 'reels' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-neutral-300'
            }`}
            aria-label="My Reels"
          >
            <Film className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3.5 flex items-center justify-center border-b-2 transition ${
              activeTab === 'saved' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-neutral-300'
            }`}
            aria-label="Saved Reels"
          >
            <Award className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3.5 flex items-center justify-center border-b-2 transition ${
              activeTab === 'history' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-neutral-300'
            }`}
            aria-label="Order History"
          >
            <History className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Dynamic Tab Contents */}
        <div className="p-4">
          
          {/* TAB 1: MY REELS (Uploaded items grid) */}
          {activeTab === 'reels' && (
            <div className="space-y-4">
              {myReels.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950/20 border border-neutral-900 rounded-2xl p-6">
                  <Film className="w-8 h-8 text-neutral-800 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2 font-medium">You haven't uploaded any food reels yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {myReels.map((item) => (
                    <div key={item.id} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-neutral-900 group">
                      <video src={item.videoUrl} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition duration-200">
                        <p className="text-[10px] font-bold text-white truncate">{item.dishName}</p>
                        <p className="text-[9px] text-orange-400 font-extrabold">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ITEMS */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              {savedReels.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950/20 border border-neutral-900 rounded-2xl p-6">
                  <Award className="w-8 h-8 text-neutral-800 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2 font-medium">No bookmarked food items.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {savedReels.map((item) => (
                    <div key={item.id} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-neutral-900 group">
                      <video src={item.videoUrl} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition duration-200">
                        <p className="text-[10px] font-bold text-white truncate">{item.dishName}</p>
                        <p className="text-[9px] text-orange-400 font-extrabold">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAST ORDERS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {orderHistory.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950/20 border border-neutral-900 rounded-2xl p-6">
                  <ShoppingBag className="w-8 h-8 text-neutral-800 mx-auto" />
                  <p className="text-xs text-neutral-500 mt-2 font-medium">No order history found.</p>
                </div>
              ) : (
                orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-2xl space-y-2.5 hover:border-neutral-800 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <h4 className="text-xs font-black text-neutral-100 leading-none uppercase">{order.dishTitle}</h4>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          🏢 {order.restaurantName}
                        </p>
                        <p className="text-[9px] text-neutral-600 mt-0.5 max-w-[240px] truncate">
                          📍 {order.deliveryAddress}
                        </p>
                      </div>
                      <span className="text-[8px] font-black text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800 uppercase tracking-wider">
                        Qty: {order.quantity}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] border-t border-neutral-900/60 pt-2 text-neutral-500">
                      <span>{order.timestamp} • {order.paymentMode}</span>
                      <span className="font-black text-orange-400">₹{order.grandTotal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* AVATAR CHOOSER MODAL */}
      <AnimatePresence>
        {showPicModal && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setShowPicModal(false)}
              className="absolute inset-0 bg-black/70 z-55"
            />
            {/* Choice dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 z-60 space-y-4 shadow-2xl"
            >
              <h3 className="text-xs font-black uppercase text-orange-500 tracking-wider">Change Profile Photo</h3>
              
              {/* Preset selection circles */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Select a Preset Avatar</span>
                <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setEditPic(preset);
                        setCustomPicUrl('');
                      }}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 active:scale-90 transition ${
                        editPic === preset ? 'border-orange-500' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                      type="button"
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      {editPic === preset && (
                        <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                          <Check className="w-4 h-4 text-neutral-950 font-black stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Or Paste Image URL</span>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="url"
                    placeholder="https://example.com/pic.jpg"
                    value={customPicUrl}
                    onChange={(e) => {
                      setCustomPicUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setEditPic(e.target.value.trim());
                      }
                    }}
                    className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl py-2 px-3 text-xs text-white outline-none placeholder-neutral-600 transition"
                  />
                </div>
              </div>

              {/* Upload Local Image File */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-neutral-500 font-bold uppercase pl-0.5">Or Upload Local Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="w-full text-[10px] text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-750 file:cursor-pointer"
                />
                {uploadingAvatar && (
                  <span className="text-[9px] text-orange-400 font-medium block animate-pulse">
                    Uploading image to Supabase...
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowPicModal(false)}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-neutral-950 rounded-xl text-xs font-black transition active:scale-95"
                  type="button"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
