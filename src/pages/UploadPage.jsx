import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function UploadPage({ onPublish }) {
  const navigate = useNavigate();
  const [dishName, setDishName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [price, setPrice] = useState('');
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');

  // Ready templates for fast testing
  const SAMPLE_TEMPLATES = [
    {
      dishName: 'Crispy Veg Spring Rolls',
      restaurantName: 'Express Food Hub, Boring Road',
      price: '149',
      caption: 'Super crispy veg spring rolls served with spicy schezwan dip! 🥢🔥 #springrolls #chinesefood #mukbites',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' // Fallback loop
    },
    {
      dishName: 'Gourmet Chocolate Waffles',
      restaurantName: 'The Chocolate Heaven, Kankarbagh',
      price: '199',
      caption: 'Warm waffles drenched in dark Belgian chocolate and sprinkles! 🧇🍫 #waffles #dessert #chocolatelove',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-womans-hands-decorating-a-handmade-soap-2803-large.mp4' // Fallback loop
    }
  ];

  const handleAutofill = (template) => {
    setDishName(template.dishName);
    setRestaurantName(template.restaurantName);
    setPrice(template.price);
    setCaption(template.caption);
    setVideoUrl(template.videoUrl);
    setValidationError('');
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setUploadProgressMsg('');

    const cleanDish = dishName.trim();
    const cleanRest = restaurantName.trim();
    const cleanPrice = parseFloat(price);
    const cleanCap = caption.trim();

    if (!cleanDish) {
      setValidationError('Dish name is required.');
      return;
    }
    if (!cleanRest) {
      setValidationError('Restaurant name is required.');
      return;
    }
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      setValidationError('Please enter a valid price greater than 0.');
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;
      if (!session) {
        throw new Error("You must be logged in to upload food reels.");
      }

      const userId = session.user.id;
      let finalVideoUrl = videoUrl.trim();

      if (videoFile) {
        setUploadProgressMsg('Uploading video file to Supabase...');
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `videos/${userId}/${fileName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('food-videos')
          .upload(filePath, videoFile);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('food-videos')
          .getPublicUrl(filePath);

        finalVideoUrl = publicUrl;
      }

      if (!finalVideoUrl) {
        finalVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-dish-in-a-professional-kitchen-44591-large.mp4';
      }

      setUploadProgressMsg('Saving reel details to Supabase...');

      const { error: insertErr } = await supabase
        .from('videos')
        .insert({
          user_id: userId,
          video_url: finalVideoUrl,
          food_name: cleanDish,
          price: cleanPrice,
          caption: cleanCap,
          restaurant_name: cleanRest
        });

      if (insertErr) throw insertErr;

      setUploadProgressMsg('Reel published successfully!');

      if (onPublish) {
        onPublish();
      }

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setValidationError(err.message || 'Failed to publish reel.');
    } finally {
      setIsPublishing(false);
      setUploadProgressMsg('');
    }
  };

  return (
    <div className="w-full h-full bg-[#0b0b0c] text-white flex flex-col overflow-hidden pt-12">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-10 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition"
          type="button"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-black text-neutral-100 tracking-tight">Create Food Reel</h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none pb-20">
        
        {/* Autofill helper */}
        <div className="bg-neutral-950/65 border border-neutral-900 rounded-2xl p-3.5 space-y-2">
          <span className="text-[9px] uppercase font-bold tracking-widest text-orange-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Testing Assistant
          </span>
          <p className="text-[10px] text-neutral-400 leading-normal">
            Select a template below to auto-fill the forms instantly and test the feed.
          </p>
          <div className="flex gap-2 pt-1">
            {SAMPLE_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAutofill(tpl)}
                className="flex-1 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-[9px] font-bold text-neutral-250 truncate active:scale-95 transition"
              >
                {tpl.dishName}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handlePublishSubmit} className="space-y-4">
          <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4 space-y-3">
            {/* Dish Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-450 font-bold uppercase pl-0.5">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Schezwan Noodles"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-600 transition"
              />
            </div>

            {/* Restaurant Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-450 font-bold uppercase pl-0.5">Restaurant Details</label>
              <input
                type="text"
                placeholder="e.g. Royal Kitchen, Boring Road"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-600 transition"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-450 font-bold uppercase pl-0.5">Item Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 199"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-600 transition"
              />
            </div>

            {/* Video File / URL Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-450 font-bold uppercase pl-0.5">Upload MP4 Video File</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-750 file:cursor-pointer"
              />
              
              <div className="flex items-center gap-2 py-1">
                <hr className="flex-1 border-neutral-900" />
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-wider">Or Paste URL</span>
                <hr className="flex-1 border-neutral-900" />
              </div>

              <input
                type="url"
                placeholder="Paste MP4 URL (optional)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-600 transition"
              />
              <span className="text-[9px] text-neutral-500 block leading-normal pl-0.5">
                Leave blank/no-file to use our high-definition chef loop fallbacks.
              </span>
            </div>

            {/* Caption */}
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-450 font-bold uppercase pl-0.5">Reel Caption</label>
              <textarea
                rows="2"
                placeholder="Write a tasty caption and add hashtags..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-600 transition resize-none"
              />
            </div>

            {validationError && (
              <p className="text-[10px] text-red-500 font-bold animate-pulse pl-0.5">
                ⚠️ {validationError}
              </p>
            )}
            {uploadProgressMsg && (
              <p className="text-[10px] text-orange-400 font-bold animate-pulse pl-0.5">
                ⏳ {uploadProgressMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPublishing}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-95 duration-150"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span className="text-neutral-950">Publishing to Feed...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Reel</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
