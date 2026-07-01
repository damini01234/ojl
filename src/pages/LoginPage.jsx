import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Flame, Lock, Mail, User, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve redirect target location (default to '/')
  const from = location.state?.from?.pathname || '/';

  // Seed demo accounts database in localStorage if empty
  useEffect(() => {
    try {
      const existingUsers = localStorage.getItem('mukbites_users');
      if (!existingUsers) {
        const defaultUsers = [
          {
            username: '@patna_chef',
            email: 'patnachef.mukbites@gmail.com',
            password: 'password123',
            fullName: 'Patna Chef',
            bio: '🍳 Cooking up Bihar\'s best street food. Tap on my reels to order!',
            profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
          }
        ];
        localStorage.setItem('mukbites_users', JSON.stringify(defaultUsers));
      }
    } catch (err) {
      console.warn("Could not seed users: ", err);
    }
  }, []);

  const DEMO_ACCOUNTS = [
    { username: '@patna_chef', email: 'patnachef.mukbites@gmail.com', password: 'password123', fullName: 'Patna Chef', bio: '🍳 Cooking up Bihar\'s best street food. Tap on my reels to order!', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    { username: '@burger_king', email: 'burgerking.mukbites@gmail.com', password: 'password123', fullName: 'Burger King', bio: '🍔 Burger specialty house. Fresh ingredients daily.', profilePic: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150&h=150&fit=crop' },
    { username: '@pizza_queen', email: 'pizzaqueen.mukbites@gmail.com', password: 'password123', fullName: 'Pizza Queen', bio: '🍕 Woodfired Italian pizzas direct to Fraser Road.', profilePic: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop' },
    { username: '@chai_wala', email: 'chaiwala.mukbites@gmail.com', password: 'password123', fullName: 'Chai Wala', bio: '☕ Patna\'s famous Kulhad tea and crispy samosas.', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' }
  ];

  const resolveIdentifierToEmail = (ident) => {
    let check = ident.trim().toLowerCase();
    if (!check.startsWith('@')) {
      check = `@${check}`;
    }
    const match = DEMO_ACCOUNTS.find(acc => acc.username.toLowerCase() === check);
    if (match) {
      return match.email;
    }
    try {
      const usersList = JSON.parse(localStorage.getItem('mukbites_users') || '[]');
      const localMatch = usersList.find(u => u.username.toLowerCase() === check);
      if (localMatch) {
        return localMatch.email;
      }
    } catch {}
    return ident;
  };

  const handleGuestLogin = () => {
    const guestSession = {
      id: 'local-guest',
      fullName: 'Guest User',
      creatorHandle: '@guest_mukbites',
      email: 'guest@mukbites.com',
      bio: '🍔 Just exploring Patna\'s shoppable food reels on MukBites!',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'
    };
    try {
      localStorage.setItem('mukbites_session', JSON.stringify(guestSession));
      if (onLoginSuccess) {
        onLoginSuccess(guestSession);
      }
      setSuccessMsg('Logged in as Guest! Entering feed...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError('Guest login failed.');
    }
  };

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

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = fullName.trim();
    let trimmedUser = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const pwd = password;

    if (!trimmedName || !trimmedUser || !trimmedEmail || !pwd) {
      setError('Please fill in all fields.');
      return;
    }

    if (!trimmedUser.startsWith('@')) {
      trimmedUser = `@${trimmedUser}`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (pwd.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      // Load user list
      const usersList = JSON.parse(localStorage.getItem('mukbites_users') || '[]');
      
      // Check if username/email is already registered
      const isTaken = usersList.some(u => u.email.toLowerCase() === trimmedEmail || u.username.toLowerCase() === trimmedUser.toLowerCase()) || 
                      DEMO_ACCOUNTS.some(u => u.email.toLowerCase() === trimmedEmail || u.username.toLowerCase() === trimmedUser.toLowerCase());
      
      if (isTaken) {
        setError('This username or email is already registered.');
        return;
      }

      const newUser = {
        id: `local-user-${Date.now()}`,
        fullName: trimmedName,
        username: trimmedUser,
        email: trimmedEmail,
        password: pwd,
        bio: '🍔 Eating my way through life. Double tap to order instantly on MukBites!',
        profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
      };

      usersList.push(newUser);
      localStorage.setItem('mukbites_users', JSON.stringify(usersList));

      const sessionData = {
        id: newUser.id,
        fullName: newUser.fullName,
        creatorHandle: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic
      };

      localStorage.setItem('mukbites_session', JSON.stringify(sessionData));
      if (onLoginSuccess) {
        onLoginSuccess(sessionData);
      }

      setSuccessMsg('Account created successfully! Welcome to MukBites.');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  const handleLogIn = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    let ident = loginIdentifier.trim().toLowerCase();
    const pwd = loginPassword;

    if (!ident || !pwd) {
      setError('Please enter your credentials.');
      return;
    }

    let resolvedEmail = ident;
    if (ident.includes('@') && !ident.includes('.') && ident.indexOf('@') === 0) {
      resolvedEmail = resolveIdentifierToEmail(ident);
    } else if (!ident.includes('@') && !ident.includes('.')) {
      resolvedEmail = resolveIdentifierToEmail(`@${ident}`);
    }

    try {
      // Search in Demo Accounts first
      const matchedDemo = DEMO_ACCOUNTS.find(
        acc => acc.email.toLowerCase() === resolvedEmail.toLowerCase() || acc.username.toLowerCase() === ident.toLowerCase()
      );

      // Search in Local storage users list
      const usersList = JSON.parse(localStorage.getItem('mukbites_users') || '[]');
      const matchedLocal = usersList.find(
        u => u.email.toLowerCase() === resolvedEmail.toLowerCase() || u.username.toLowerCase() === ident.toLowerCase()
      );

      const targetUser = matchedDemo || matchedLocal;

      if (!targetUser) {
        setError('No account found with this username or email. Please sign up.');
        return;
      }

      if (targetUser.password !== pwd) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Login success
      const sessionData = {
        id: targetUser.id || `local-demo-${targetUser.username}`,
        fullName: targetUser.fullName,
        creatorHandle: targetUser.username,
        email: targetUser.email,
        bio: targetUser.bio || '🍔 Eating my way through life. Double tap to order instantly on MukBites!',
        profilePic: targetUser.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
      };

      localStorage.setItem('mukbites_session', JSON.stringify(sessionData));
      if (onLoginSuccess) {
        onLoginSuccess(sessionData);
      }

      setSuccessMsg(`Welcome back, ${targetUser.fullName}! Redirecting...`);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError('Authentication failed. Please check your credentials.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Check if user exists
    const usersList = JSON.parse(localStorage.getItem('mukbites_users') || '[]');
    const userExists = usersList.some(u => u.email.toLowerCase() === targetEmail) || 
                       DEMO_ACCOUNTS.some(u => u.email.toLowerCase() === targetEmail);

    if (!userExists) {
      setError('No account found with this email address.');
      return;
    }

    setSuccessMsg(`A simulated password reset link was sent to: ${targetEmail}`);
    setForgotEmail('');
    setTimeout(() => {
      setSuccessMsg('');
      setAuthMode('login');
    }, 3500);
  };

  return (
    <div className="absolute inset-0 bg-[#070708] text-white p-6 flex flex-col justify-between h-full overflow-y-auto scrollbar-none animate-fadeIn select-none z-50">
      {/* Top spacer */}
      <div className="py-2" />

      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* MukBites Centralized Branding */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 mb-1">
            <Flame className="w-7 h-7 text-neutral-950 fill-neutral-950" />
          </div>
          <h1 
            className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            MukBites
          </h1>
          <p className="text-[10px] text-neutral-400 font-medium px-6">
            Scroll. Crave. Order instantly.
          </p>
        </div>

        {/* Dynamic tabs toggle (only shown when not in forgot password mode) */}
        {authMode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                authMode === 'login' ? 'bg-neutral-800 text-orange-400 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              type="button"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                authMode === 'signup' ? 'bg-neutral-800 text-orange-400 border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              type="button"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-[11px] font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-[11px] font-semibold animate-fadeIn">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOG IN PANEL */}
        {authMode === 'login' && (
          <form onSubmit={handleLogIn} className="space-y-4">
            <div className="space-y-3 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> Username or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. patna_chef"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>
            </div>

            <div className="text-right px-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('forgot');
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-[10px] font-bold text-neutral-450 hover:text-orange-400 transition"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-orange-500/5 transition active:scale-[0.98]"
            >
              Sign In
            </button>

            {/* Test accounts helper */}
            <div className="bg-neutral-950/65 border border-neutral-900 rounded-2xl p-3">
              <p className="text-[9px] text-neutral-550 font-black uppercase tracking-widest text-center mb-2">
                Quick Test Users (Click to login)
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-none">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => {
                      setLoginIdentifier(acc.username);
                      setLoginPassword(acc.password);
                    }}
                    className="py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-805 rounded-lg text-[9px] font-bold text-neutral-300 hover:text-orange-400 transition text-center truncate"
                  >
                    {acc.username}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* SIGN UP PANEL */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-3 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. patna_chef"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. chef@mukbites.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Create Password (min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-orange-500/5 transition active:scale-[0.98]"
            >
              Register & Login
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD PANEL */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-3 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center mx-auto text-orange-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase text-neutral-200">Reset Password</h3>
                <p className="text-[9px] text-neutral-500">
                  Enter your email address and we'll simulate sending you a reset link.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. chef@mukbites.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-500/30 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none placeholder-neutral-600 transition"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-neutral-950 font-black rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-orange-500/5 transition active:scale-[0.98]"
              >
                Send Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="py-3 px-5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Guest Login Footer */}
      <div className="text-center pt-3 border-t border-neutral-900 shrink-0">
        <p className="text-[11px] text-neutral-500">
          Just looking around?{' '}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="font-bold text-orange-400 hover:underline active:scale-95 transition"
          >
            Explore as Guest
          </button>
        </p>
      </div>
    </div>
  );
}
