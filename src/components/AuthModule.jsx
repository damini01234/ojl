import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * AuthModule Component.
 * High-fidelity Instagram-style Signup Screen.
 * 
 * @param {object} props
 * @param {function} props.setCurrentUser - Callback to update parent App.jsx currentUser state
 */
export default function AuthModule({ setCurrentUser }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Automatically pre-pends '@' if omitted by the user, dynamically as they type
  const handleUsernameChange = (e) => {
    let val = e.target.value.trim();
    if (val === '@') {
      setUsername('');
      return;
    }
    if (val && !val.startsWith('@')) {
      val = `@${val}`;
    }
    setUsername(val);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const nameText = fullName.trim();
    let handleText = username.trim();

    if (!nameText) {
      setAuthError('Please enter your Full Name.');
      return;
    }
    if (!handleText) {
      setAuthError('Please enter your Username / User ID.');
      return;
    }

    if (!handleText.startsWith('@')) {
      handleText = `@${handleText}`;
    }

    const sessionUser = {
      fullName: nameText,
      creatorHandle: handleText
    };

    try {
      // Persist to localStorage under 'creator_session' immediately
      localStorage.setItem('creator_session', JSON.stringify(sessionUser));
      
      // Update global auth state to instantly transition to feed
      setCurrentUser(sessionUser);
    } catch (err) {
      setAuthError('Failed to save session.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black text-white p-8 flex flex-col justify-between h-full animate-fadeIn select-none">
      {/* Top spacing to push center content down */}
      <div />

      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Instagram Centralized Branding */}
        <div className="text-center space-y-1 mb-4">
          <h1 
            className="text-4xl font-serif text-neutral-100 tracking-wide mb-2 italic"
            style={{ 
              fontFamily: "'Grand Hotel', 'Brush Script MT', 'Comfortaa', cursive, serif",
              fontStyle: 'italic',
              fontWeight: 'normal'
            }}
          >
            Instagram
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Sign up to see photos and videos of food from your creators.
          </p>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          
          {/* Explicit label and clean input for Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 pl-1 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl py-3.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-500 transition focus:ring-1 focus:ring-neutral-700"
            />
          </div>

          {/* Explicit label and clean input for Username / User ID */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 pl-1 block">
              Username / User ID
            </label>
            <input
              type="text"
              placeholder="e.g. patna_chef"
              value={username}
              onChange={handleUsernameChange}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl py-3.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-500 transition focus:ring-1 focus:ring-neutral-700"
            />
          </div>

          {/* Explicit label and clean input for Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 pl-1 block">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl py-3.5 px-4 text-xs font-semibold text-white outline-none placeholder-neutral-500 transition focus:ring-1 focus:ring-neutral-700"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0095F6] text-white font-bold rounded-xl transition duration-200 text-xs tracking-wider uppercase shadow-md"
          >
            Sign Up
          </button>
        </form>
      </div>

      {/* Footer login link container */}
      <div className="text-center pt-4 border-t border-neutral-900">
        <p className="text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              // Pre-fill a demo user for testing and trigger log in
              const demoUser = {
                fullName: 'Patna Foodie',
                creatorHandle: '@patna_chef'
              };
              localStorage.setItem('creator_session', JSON.stringify(demoUser));
              setCurrentUser(demoUser);
            }}
            className="font-bold text-[#0095F6] hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
