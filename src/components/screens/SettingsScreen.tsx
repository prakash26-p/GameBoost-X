import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Moon,
  Clock,
  Wifi,
  Database,
  Shield,
  Smartphone,
  Info,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Battery,
  Bell,
  FlaskConical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppSettings, ScreenId } from '../../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetLibrary: () => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenNativeGuide: () => void;
  isDevMode?: boolean;
  onToggleDevMode?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetLibrary,
  onNavigate,
  onOpenNativeGuide,
  isDevMode = false,
  onToggleDevMode
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setNotificationPermission(result);
      } catch (e) {
        console.warn('Could not request notification permission:', e);
      }
    }
  };

  const updateLevelPlay = (patch: Partial<AppSettings['levelPlay']>) => {
    onUpdateSettings({
      levelPlay: {
        ...settings.levelPlay,
        ...patch
      }
    });
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-white">
          Advanced Settings
        </h1>
        <p className="text-[11px] text-[#6B7C70]">
          Hardware telemetry, Unity LevelPlay advertising, and interface configuration
        </p>
      </div>

      {/* 1. Interface & Viewport */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-display text-white">
          <Moon className="w-4 h-4 text-[#39FF70]" />
          <span>Interface & Gaming Theme</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Neon Green & OLED Black</div>
              <div className="text-[10px] text-[#6B7C70]">High contrast gaming theme</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#39FF70] border border-black shadow-[0_0_8px_#39FF70]" />
              <span className="w-4 h-4 rounded-full bg-[#050806] border border-[#285C38]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Reduced Motion</div>
              <div className="text-[10px] text-[#6B7C70]">Disables ring pulsing and non-essential transitions</div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => onUpdateSettings({ reducedMotion: e.target.checked })}
              className="accent-[#39FF70] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Android Phone Bezel Framing</div>
              <div className="text-[10px] text-[#6B7C70]">Render inside mobile bezel on desktop displays</div>
            </div>
            <select
              value={settings.deviceFrameMode}
              onChange={(e) => onUpdateSettings({ deviceFrameMode: e.target.value as any })}
              className="bg-[#101712] border border-[#285C38] rounded-lg px-2 py-1 text-xs text-[#B7C6BA] outline-none"
            >
              <option value="mobile-frame">Phone Frame</option>
              <option value="responsive-fluid">Fluid Responsive</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Hardware Monitoring Frequency */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-display text-white">
          <Clock className="w-4 h-4 text-[#69B7FF]" />
          <span>Device Monitoring Interval</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Active Polling Loop</div>
              <div className="text-[10px] text-[#6B7C70]">Pause polling when in-game to conserve battery</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableActiveMonitoring}
              onChange={(e) => onUpdateSettings({ enableActiveMonitoring: e.target.checked })}
              className="accent-[#39FF70] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Telemetry Interval</div>
              <div className="text-[10px] text-[#6B7C70]">Higher interval conserves battery on Android</div>
            </div>
            <select
              value={settings.refreshIntervalMs}
              onChange={(e) => onUpdateSettings({ refreshIntervalMs: Number(e.target.value) })}
              className="bg-[#101712] border border-[#285C38] rounded-lg px-2 py-1 text-xs text-[#B7C6BA] outline-none"
            >
              <option value={2000}>2 seconds (High)</option>
              <option value={4000}>4 seconds (Balanced)</option>
              <option value={8000}>8 seconds (Battery Saver)</option>
              <option value={0}>Disabled (Manual only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Go Ad-Free VIP Subscription Section */}
      <div className="bg-gradient-to-r from-[#1A2E1F] to-[#101712] border border-[#FFD700]/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-display text-white">
            <span className="text-[#FFD700]">★</span>
            <span>GameBoost X VIP Ad-Free</span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-bold">
            UPI PLANS FROM ₹9
          </span>
        </div>

        <p className="text-[11px] text-[#B7C6BA] leading-relaxed">
          Upgrade to remove all Unity LevelPlay banner and interstitial advertisements. 8 flexible duration passes available with instant UPI intent integration.
        </p>

        <button
          onClick={() => onNavigate('subscription')}
          className="w-full py-2.5 px-3 rounded-xl bg-[#FFD700] hover:bg-[#FFE04D] text-black font-display font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.25)] cursor-pointer"
        >
          <span>VIEW AD-FREE SUBSCRIPTION PLANS</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Unity LevelPlay Advertising Architecture */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold font-display text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#39FF70]" />
            <span>Unity LevelPlay Mediation Settings</span>
          </div>
          <span
            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
              settings.levelPlay.testMode
                ? 'text-[#FFC857] bg-[#FFC857]/10 border-[#FFC857]/30'
                : 'text-[#39FF70] bg-[#39FF70]/10 border-[#39FF70]/30'
            }`}
          >
            {settings.levelPlay.testMode ? 'TEST MODE' : 'PRODUCTION'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#050806] border border-[#285C38] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#6B7C70]">PACKAGE IDENTIFIER</span>
              <span className="font-mono text-[#39FF70] text-xs">com.prakashrox.gameboostx</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#285C38]/40 pt-1">
              <span className="text-[10px] font-mono text-[#6B7C70]">BANNER AD UNIT</span>
              <span className="font-mono text-white text-[11px]">rm9wn28m9hwlk81n</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#285C38]/40 pt-1">
              <span className="text-[10px] font-mono text-[#6B7C70]">INTERSTITIAL AD UNIT</span>
              <span className="font-mono text-white text-[11px]">a41guoa3mv1ridan</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#285C38]/40 pt-1">
              <span className="text-[10px] font-mono text-[#6B7C70]">NATIVE AD UNIT</span>
              <span className="font-mono text-[#B7C6BA] text-[11px]">uljl02ubr3jc5xu8 (Verified)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Test Mode vs Production</div>
              <div className="text-[10px] text-[#6B7C70]">Use official test ads during development</div>
            </div>
            <input
              type="checkbox"
              checked={settings.levelPlay.testMode}
              onChange={(e) => updateLevelPlay({ testMode: e.target.checked })}
              className="accent-[#39FF70] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Bottom Banner Ad Container</div>
              <div className="text-[10px] text-[#6B7C70]">Adaptive banner above navigation bar</div>
            </div>
            <input
              type="checkbox"
              checked={settings.levelPlay.bannerEnabled}
              onChange={(e) => updateLevelPlay({ bannerEnabled: e.target.checked })}
              className="accent-[#39FF70] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">App-Open Interstitial</div>
              <div className="text-[10px] text-[#6B7C70]">Display eligible ad on app entrance</div>
            </div>
            <input
              type="checkbox"
              checked={settings.levelPlay.appOpenInterstitialEnabled}
              onChange={(e) => updateLevelPlay({ appOpenInterstitialEnabled: e.target.checked })}
              className="accent-[#39FF70] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#050806] border border-[#285C38]">
            <div>
              <div className="font-medium text-white">Interstitial Cooldown</div>
              <div className="text-[10px] text-[#6B7C70]">Frequency cap to prevent user fatigue</div>
            </div>
            <select
              value={settings.levelPlay.minIntervalSeconds}
              onChange={(e) => updateLevelPlay({ minIntervalSeconds: Number(e.target.value) })}
              className="bg-[#101712] border border-[#285C38] rounded-lg px-2 py-1 text-xs text-[#B7C6BA] outline-none"
            >
              <option value={60}>60 seconds</option>
              <option value={120}>120 seconds (Default)</option>
              <option value={180}>180 seconds</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Notifications & Alerts */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-display text-white">
          <Bell className="w-4 h-4 text-[#FFC857]" />
          <span>System Alerts & Notifications</span>
        </div>

        <div className="p-3 rounded-xl bg-[#050806] border border-[#285C38] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-white flex items-center gap-1.5">
              <span>Notification Permission:</span>
              <span
                className={`font-mono text-[10px] uppercase px-1.5 py-0.2 rounded ${
                  notificationPermission === 'granted'
                    ? 'text-[#39FF70] bg-[#39FF70]/10 border border-[#39FF70]/30'
                    : notificationPermission === 'denied'
                    ? 'text-[#FF5C68] bg-[#FF5C68]/10 border border-[#FF5C68]/30'
                    : 'text-[#FFC857] bg-[#FFC857]/10 border border-[#FFC857]/30'
                }`}
              >
                {notificationPermission}
              </span>
            </div>
            <div className="text-[10px] text-[#6B7C70] mt-0.5">
              Used for latency spike warnings and safe boost summary reports
            </div>
          </div>

          {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
            <button
              onClick={handleRequestNotification}
              className="px-2.5 py-1 bg-[#151F18] hover:bg-[#1C2D22] border border-[#39FF70]/40 text-[#39FF70] text-xs font-display rounded-lg transition-colors cursor-pointer"
            >
              Request
            </button>
          )}
        </div>
      </div>

      {/* 5. Developer Sample Mode (Strict Isolation) */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold font-display text-white">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#FFC857]" />
            <span>Developer Sample Mode</span>
          </div>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
              isDevMode
                ? 'text-[#FFC857] bg-[#FFC857]/10 border-[#FFC857]/30'
                : 'text-[#6B7C70] bg-[#151F18] border-[#285C38]'
            }`}
          >
            {isDevMode ? 'ENABLED' : 'STRICT EMPTY'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#050806] border border-[#285C38] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white font-medium">
              Load Sample Gaming Catalog
            </div>
            <input
              type="checkbox"
              checked={isDevMode}
              onChange={onToggleDevMode}
              className="accent-[#FFC857] w-4 h-4 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-[#6B7C70] leading-relaxed">
            Per the strict no-fake-data policy, production mode begins with an empty game library. Enable this toggle to preview the UI layout with sample games without pre-seeding the production database.
          </p>
        </div>
      </div>

      {/* 6. Quick Links */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-2 divide-y divide-[#285C38]">
        <button
          onClick={onOpenNativeGuide}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-[#151F18] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-[#39FF70]" />
            <div>
              <div className="text-xs font-bold text-white font-display">
                Native Android Kotlin Architecture & LevelPlay SDK
              </div>
              <div className="text-[10px] text-[#6B7C70]">
                MainActivity.kt, IronSource.init, and LevelPlayBannerAdView
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7C70]" />
        </button>

        <button
          onClick={() => onNavigate('permissions')}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-[#151F18] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#69B7FF]" />
            <div>
              <div className="text-xs font-bold text-white font-display">
                Android Permissions & Privacy
              </div>
              <div className="text-[10px] text-[#6B7C70]">
                PACKAGE_USAGE_STATS and scoped package queries
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7C70]" />
        </button>

        <button
          onClick={() => onNavigate('about')}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-[#151F18] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-[#FFC857]" />
            <div>
              <div className="text-xs font-bold text-white font-display">
                About GameBoost X & FAQs
              </div>
              <div className="text-[10px] text-[#6B7C70]">
                Version 2.4.0 and zero-deception manifesto
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#6B7C70]" />
        </button>
      </div>

      {/* 7. Reset Library */}
      <div className="pt-2">
        <button
          onClick={onResetLibrary}
          className="w-full py-3 bg-[#FF5C68]/10 hover:bg-[#FF5C68]/20 text-[#FF5C68] border border-[#FF5C68]/30 font-display font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Database className="w-4 h-4" />
          <span>RESET GAME LIBRARY (CLEAR SAVED GAMES)</span>
        </button>
      </div>
    </div>
  );
};
