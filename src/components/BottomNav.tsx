import React from 'react';
import { Home, Gamepad2, Activity, Battery, Settings } from 'lucide-react';
import { ScreenId } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  gamesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  gamesCount
}) => {
  const navItems = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'my-games' as ScreenId, label: 'Games', icon: Gamepad2, badge: gamesCount },
    { id: 'analysis' as ScreenId, label: 'Analysis', icon: Activity },
    { id: 'battery' as ScreenId, label: 'Battery', icon: Battery },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings }
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#050806]/95 backdrop-blur-md border-t border-[#285C38] px-2 py-1.5 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#39FF70]'
                  : 'text-[#6B7C70] hover:text-[#B7C6BA]'
              }`}
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#39FF70] text-black text-[9px] font-bold font-mono flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-semibold text-[#39FF70]' : 'font-normal'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#39FF70] shadow-[0_0_8px_#39FF70]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
