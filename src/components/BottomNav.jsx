import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Plus, User } from 'lucide-react';

export default function BottomNav() {
  const getLinkClass = ({ isActive }) => {
    const baseClass = "flex flex-col items-center justify-center p-2.5 transition rounded-xl flex-1 duration-200 active:scale-95";
    return isActive 
      ? `${baseClass} text-orange-500 font-bold scale-105` 
      : `${baseClass} text-neutral-500 hover:text-neutral-300`;
  };

  return (
    <div className="absolute bottom-0 inset-x-0 h-16 bg-neutral-950 border-t border-neutral-900/60 flex justify-around items-center z-50 px-4">
      {/* Tab 1: Feed */}
      <NavLink 
        to="/" 
        className={getLinkClass}
        aria-label="Feed"
      >
        <Compass className="w-5.5 h-5.5" />
        <span className="text-[9px] mt-0.5 font-bold">Feed</span>
      </NavLink>

      {/* Tab 2: Create Reel */}
      <NavLink 
        to="/upload" 
        className={getLinkClass}
        aria-label="Create Post"
      >
        <Plus className="w-5.5 h-5.5 bg-neutral-900 border border-neutral-800 rounded-lg w-7 h-7 flex items-center justify-center text-white" />
        <span className="text-[9px] mt-0.5 font-bold">Create</span>
      </NavLink>

      {/* Tab 3: Profile */}
      <NavLink 
        to="/profile" 
        className={getLinkClass}
        aria-label="Profile"
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[9px] mt-0.5 font-bold">Profile</span>
      </NavLink>
    </div>
  );
}
