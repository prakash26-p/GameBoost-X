import React from 'react';
import { Settings, Shield, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { ScreenId } from '../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isOnline: boolean;
  connectionType: string;
  frameMode: 'mobile-frame' | 'responsive-fluid';
  onToggleFrameMode: () => void;
  onOpenNativeGuide: () => void;
  isAdFreeActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  isOnline,
  connectionType,
  frameMode,
  onToggleFrameMode,
  onOpenNativeGuide,
  isAdFreeActive = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#080B0A]/95 backdrop-blur-md border-b border-[#29382F] px-4 py-3 flex items-center justify-between">
      {/* Brand & Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => onNavigate('home')}
        title="Return to Home Dashboard"
      >
        {/* Custom SVG Gaming Logo */}
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B241F] to-[#151C18] border border-[#39FF88]/40 flex items-center justify-center shadow-lg shadow-[#39FF88]/10 group">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-[#39FF88] transform group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#39FF88] animate-ping" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-base tracking-wide text-white">
              GameBoost <span className="text-[#39FF88]">X</span>
            </span>
            {isAdFreeActive ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 rounded font-bold">
                VIP
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#1B241F] text-[#39FF88] border border-[#39FF88]/30 rounded">
                PRO
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7E8B82] leading-tight">
            Smart Gaming Performance
          </p>
        </div>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-2">
        {/* Connection status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            isOnline
              ? 'bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/30'
              : 'bg-[#FF5C68]/10 text-[#FF5C68] border-[#FF5C68]/30'
          }`}
          title={`Network status: ${connectionType}`}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px] truncate max-w-[70px]">
            {isOnline ? connectionType : 'Offline'}
          </span>
        </div>

        {/* Desktop Frame Switcher */}
        <button
          onClick={onToggleFrameMode}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-[#151C18] border border-[#29382F] text-[#B7C4BC] hover:text-[#39FF88] hover:border-[#39FF88]/40 transition-colors cursor-pointer"
          title={frameMode === 'mobile-frame' ? 'Switch to Fluid Desktop View' : 'Switch to Android Phone Viewport'}
          aria-label="Toggle screen frame mode"
        >
          {frameMode === 'mobile-frame' ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>

        {/* Native Android APK Architecture Info */}
        <button
          onClick={onOpenNativeGuide}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#151C18] border border-[#29382F] text-[#B7C4BC] hover:text-[#39FF88] hover:border-[#39FF88]/40 transition-colors cursor-pointer"
          title="Android Native Architecture & APK Bridge Guide"
          aria-label="Open Android Native Integration Guide"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Go Ad-Free Crown Button */}
        <button
          onClick={() => onNavigate('subscription')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
            currentScreen === 'subscription'
              ? 'bg-[#FFD700] text-black border-[#FFD700]'
              : isAdFreeActive
              ? 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700]'
              : 'bg-[#151C18] border-[#285C38] text-[#FFD700] hover:border-[#FFD700]/60'
          }`}
          title={isAdFreeActive ? 'VIP Ad-Free Active' : 'Go Ad-Free (UPI Plans)'}
          aria-label="Go Ad-Free"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-current"
          >
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer ${
            currentScreen === 'settings'
              ? 'bg-[#39FF88] text-black border-[#39FF88]'
              : 'bg-[#151C18] border-[#29382F] text-[#B7C4BC] hover:text-[#39FF88] hover:border-[#39FF88]/40'
          }`}
          title="Open Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
