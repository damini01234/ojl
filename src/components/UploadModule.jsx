import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, Film, DollarSign } from 'lucide-react';

const ASSET_TEMPLATES = [
  {
    id: 'momos',
    label: 'Steaming Momos',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chili-pepper-falling-into-red-powder-28392-large.mp4',
    defaultTitle: 'Steaming Veg Momos',
    color: 'from-orange-500 to-red-650'
  },
  {
    id: 'jalebi',
    label: 'Desi Jalebi',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-hands-decorating-a-handmade-soap-2803-large.mp4',
    defaultTitle: 'Desi Ghee Jalebi',
    color: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'dosa',
    label: 'Crispy Dosa',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    defaultTitle: 'Patna Special Crispy Dosa',
    color: 'from-yellow-600 to-orange-500'
  }
];

/**
 * UploadModule Component.
 * High-fidelity Instagram "New Reel" creator screen.
 */
export default function UploadModule({
  currentUser,
  onPublish,
  onNavigateHome
}) {
  const [caption, setCaption] = useState('');
  const [dishName, setDishName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [price, setPrice] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(ASSET_TEMPLATES[0].id);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStep, setPublishingStep] = useState('');

  // Default initialize form fields on mount
  useEffect(() => {
    if (ASSET_TEMPLATES.length > 0) {
      setVideoUrl(ASSET_TEMPLATES[0].videoUrl);
      setDishName(ASSET_TEMPLATES[0].defaultTitle);
      setRestaurantName("Kapildev's Elevens, Boring Road");
    }
  }, []);

  const handleSelectPreset = (template) => {
    setSelectedAssetId(template.id);
    setVideoUrl(template.videoUrl);
    setDishName(template.defaultTitle);
  };

  const handlePublishSubmit = (e) => {
    if (e) e.preventDefault();

    const finalDish = dishName.trim() || 'Delicious Food Item';
    const finalRestaurant = restaurantName.trim() || 'Local Food Joint';
    const finalPrice = Math.round(parseFloat(price)) || 99;
    const finalCaption = caption.trim() || `Must try this amazing ${finalDish} at ${finalRestaurant}!`;
    const finalUrl = videoUrl.trim() || ASSET_TEMPLATES[0].videoUrl;

    // Start publishing sequence animation
    setIsPublishing(true);
    setPublishingStep('transcribing');

    setTimeout(() => {
      setPublishingStep('done');

      setTimeout(() => {
        // Construct the new reel object mapping all required database fields
        const newReel = {
          id: `reel-user-${Date.now()}`,
          username: currentUser?.creatorHandle?.replace('@', '') || 'patna_chef',
          profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          videoUrl: finalUrl,
          caption: finalCaption,
          likesCount: 0,
          sharesCount: 0,
          isLiked: false,
          dishName: finalDish,
          restaurantName: finalRestaurant,
          price: finalPrice,
          isFoodRelated: true
        };

        // Prepend and commit to database
        onPublish(newReel);
        setIsPublishing(false);
        setPublishingStep('');

        // Reset inputs
        setCaption('');
        setDishName('');
        setRestaurantName('');
        setPrice('');
        setSelectedAssetId(ASSET_TEMPLATES[0].id);
        if (ASSET_TEMPLATES.length > 0) {
          setVideoUrl(ASSET_TEMPLATES[0].videoUrl);
        }

        onNavigateHome();
      }, 600);
    }, 1200);
  };

  const selectedTemplate = ASSET_TEMPLATES.find(t => t.id === selectedAssetId) || ASSET_TEMPLATES[0];

  return (
    <div className="flex-1 bg-black text-white flex flex-col h-full relative overflow-hidden pt-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-black sticky top-0 z-10 shrink-0">
        <button 
          onClick={onNavigateHome}
          className="text-sm font-semibold text-neutral-400 hover:text-white"
          type="button"
        >
          Cancel
        </button>
        <span className="font-bold text-sm tracking-tight text-neutral-100">
          New Reel
        </span>
        <button 
          onClick={handlePublishSubmit}
          className="text-sm font-bold text-[#0095F6] hover:text-[#1877F2]"
          type="button"
        >
          Share
        </button>
      </div>

      {/* COMPOSER FORM AREA */}
      <form onSubmit={handlePublishSubmit} className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none pb-20">
        
        {/* Caption and Video Preview Row */}
        <div className="flex gap-4 border-b border-neutral-900 pb-5">
          {/* Circular avatar + Write a caption */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] font-black uppercase text-white select-none">
                {currentUser?.creatorHandle ? currentUser.creatorHandle.substring(1, 3).toUpperCase() : 'ME'}
              </div>
              <span className="text-xs font-bold text-neutral-200">
                {currentUser?.creatorHandle || '@creator'}
              </span>
            </div>
            <textarea
              required
              rows="3"
              placeholder="Write a caption or description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs font-medium text-white placeholder-neutral-550 focus:ring-0 p-0 resize-none"
            />
          </div>
          
          {/* Selected Video Preview Thumbnail */}
          <div className="w-18 h-24 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden relative shrink-0 flex items-center justify-center">
            <div className={`absolute inset-0 bg-gradient-to-tr ${selectedTemplate.color} opacity-40 z-0`} />
            <div className="absolute inset-0 bg-black/30 z-5" />
            <Film className="w-5 h-5 text-neutral-400 z-10 animate-pulse" />
            <span className="absolute bottom-1 inset-x-1 text-[7px] text-center font-bold text-white z-10 truncate leading-none">
              Preview
            </span>
          </div>
        </div>

        {/* Dish Name Field */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-450 pl-0.5">
            Dish Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Special Chicken Biryani"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-850 focus:border-neutral-750 rounded-xl py-3 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-550 transition focus:ring-1 focus:ring-neutral-700"
          />
        </div>

        {/* Restaurant Name Field */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-450 pl-0.5">
            Restaurant Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kapildev's Elevens, Boring Road"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-850 focus:border-neutral-750 rounded-xl py-3 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-550 transition focus:ring-1 focus:ring-neutral-700"
          />
        </div>

        {/* Price Field */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-450 pl-0.5">
            Price Tag (₹)
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 199"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-850 focus:border-neutral-750 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white outline-none placeholder-neutral-550 transition focus:ring-1 focus:ring-neutral-700"
            />
            <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
          </div>
        </div>

        {/* Video URL Link */}
        <div className="space-y-1.5">
          <label className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-450 pl-0.5">
            Sample MP4 Video URL Link
          </label>
          <input
            type="url"
            required
            placeholder="e.g. https://assets.mixkit.co/...mp4"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-850 focus:border-neutral-750 rounded-xl py-3 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-550 transition focus:ring-1 focus:ring-neutral-700"
          />
        </div>

        {/* Media Asset Template Selector Presets */}
        <div className="space-y-2">
          <label className="text-[9.5px] uppercase font-bold tracking-widest text-neutral-450 pl-0.5 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-neutral-450" />
            <span>Select Media Loop Preset (Auto-fills URL)</span>
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {ASSET_TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className={`relative h-20 rounded-xl overflow-hidden border p-2 flex flex-col justify-end text-left transition duration-200 ${
                  selectedAssetId === item.id
                    ? 'border-[#0095F6] ring-1 ring-[#0095F6]/40'
                    : 'border-neutral-850 hover:border-neutral-800 bg-neutral-900/60'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-tr ${item.color} opacity-20 z-0`} />
                <div className="absolute inset-0 bg-black/40 z-5" />
                
                <span className="text-[9px] font-black z-10 leading-tight text-white line-clamp-2">
                  {item.label}
                </span>

                {selectedAssetId === item.id && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0095F6] z-10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-[#0095F6] hover:bg-[#1877F2] text-white font-black rounded-xl transition duration-200 text-xs tracking-wider uppercase shadow-md"
          >
            Publish Post
          </button>
        </div>

      </form>

      {/* AI Loader Sequence Panel Overlay */}
      {isPublishing && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-center p-6 animate-fadeIn animate-duration-200">
          {publishingStep === 'transcribing' ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-100 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span>AI transcribing food frames...</span>
                </h3>
                <p className="text-xs text-neutral-500">Compiling metadata tag files...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-emerald-400">Reel Successfully Published!</h3>
                <p className="text-xs text-neutral-500">Transitioning to Reels Feed...</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
