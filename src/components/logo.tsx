/**
 * 🏰 BestTutorEver Logo
 * 
 * Disney-inspired magical branding with:
 * - Graduation cap (education)
 * - Sparkle stars (magic & achievement)
 * - White text for sidebar visibility
 */

import { GraduationCap, Star, Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-3 font-bold group-data-[collapsible=icon]:justify-center p-4">
      {/* Magical icon with stars */}
      <div className="relative">
        {/* Main circle with gradient - white/gold for visibility on purple sidebar */}
        <div className="relative flex items-center justify-center w-16 h-16 
                        bg-gradient-to-br from-yellow-400 to-orange-400 
                        rounded-full shadow-xl shadow-black/20">
          <GraduationCap className="w-8 h-8 text-purple-700 drop-shadow-lg" />
        </div>
        
        {/* Sparkle stars around the logo */}
        <Star className="absolute -top-1 -right-1 w-5 h-5 text-white fill-white drop-shadow-lg" />
        <Star className="absolute -bottom-0 -left-1 w-3 h-3 text-yellow-200 fill-yellow-200 drop-shadow" />
      </div>
      
      {/* Brand name - WHITE text for purple sidebar visibility */}
      <div className="text-center group-data-[collapsible=icon]:hidden">
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-white">Best</span>
          <span className="text-yellow-300">Tutor</span>
          <span className="text-white">Ever</span>
        </span>
        <div className="text-[9px] text-white/80 font-semibold tracking-wider uppercase mt-0.5">
          ✨ Learning is Magic ✨
        </div>
      </div>
    </div>
  );
}

/**
 * Compact logo for header/navbar (light backgrounds)
 */
export function LogoCompact() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="flex items-center justify-center w-10 h-10 
                        bg-gradient-to-br from-purple-500 to-pink-500 
                        rounded-full shadow-lg">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-yellow-400" />
      </div>
      <span className="text-lg font-extrabold">
        <span className="text-purple-600">Best</span>
        <span className="text-yellow-500">Tutor</span>
        <span className="text-purple-600">Ever</span>
      </span>
    </div>
  );
}
