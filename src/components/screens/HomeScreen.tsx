import React from 'react';
import {
  Zap,
  Activity,
  Wifi,
  Plus,
  Play,
  Cpu,
  HardDrive,
  BatteryCharging,
  Battery,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Rocket,
  Shield,
  ArrowRight
} from 'lucide-react';
import { DeviceMetrics, GameRecord, NetworkMeasurement, ScreenId, LibraryItemType } from '../../types';
import { getQualityColorClass } from '../../utils/networkUtils';

interface HomeScreenProps {
  metrics: DeviceMetrics;
  recentTest: NetworkMeasurement | null;
  games: GameRecord[];
  selectedGame: GameRecord | null;
  isDevMode?: boolean;
  isAdFreeActive?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSelectGame: (game: GameRecord) => void;
  onStartClicked: () => void;
  onOpenAddMode?: (mode: LibraryItemType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  metrics,
  recentTest,
  games,
  selectedGame,
  isDevMode = false,
  isAdFreeActive = false,
  onNavigate,
  onSelectGame,
  onStartClicked,
  onOpenAddMode
}) => {
  const qualityColors = recentTest
    ? getQualityColorClass(recentTest.quality)
    : { text: 'text-[#6B7C70]', bg: 'bg-[#1C2D22]/40', border: 'border-[#285C38]' };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Dev Mode Banner if active */}
      {isDevMode && (
        <div className="bg-[#FFC857]/10 border border-[#FFC857]/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFC857] animate-ping" />
            <span className="font-mono font-bold text-[#FFC857]">DEVELOPER PREVIEW MODE</span>
            <span className="text-[11px] text-[#B7C6BA] hidden sm:inline">— Sample catalog loaded</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-[10px] text-[#FFC857] hover:underline font-mono"
          >
            Settings
          </button>
        </div>
      )}

      {/* 1. Large Circular START Button Section (Upper-Middle Hero) */}
      <div className="relative py-4 flex flex-col items-center justify-center text-center">
        {/* Concentric glowing rings */}
        <div className="relative flex items-center justify-center">
          {/* Outermost subtle pulse ring */}
          <div className="absolute w-52 h-52 rounded-full border border-[#39FF70]/15 animate-ring-pulse pointer-events-none" />
          {/* Middle decorative outline ring */}
          <div className="absolute w-44 h-44 rounded-full border border-[#285C38] pointer-events-none" />
          {/* Inner ring */}
          <div className="absolute w-36 h-36 rounded-full border-2 border-[#39FF70]/40 pointer-events-none" />

          {/* Core Interactive START Button */}
          <button
            onClick={onStartClicked}
            className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#39FF70] to-[#20C65A] text-black shadow-[0_0_35px_rgba(57,255,112,0.45)] hover:shadow-[0_0_45px_rgba(57,255,112,0.65)] hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer group z-10"
            aria-label={selectedGame ? `Start ${selectedGame.name}` : 'Start selected game launcher'}
          >
            {/* Inline Gaming Rocket SVG Icon */}
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 fill-black transform group-hover:-translate-y-1 transition-transform"
            >
              <path d="M12 2.5C9.5 5 7 9.5 7 13.5c0 2 .5 3.5 1 4.5l-2.5 2 2 1 2.5-1.5c1 .5 2 1 2 1s1-.5 2-1l2.5 1.5 2-1-2.5-2c.5-1 1-2.5 1-4.5 0-4-2.5-8.5-5-11zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
            <span className="font-display font-extrabold text-sm tracking-wider mt-0.5">
              START
            </span>
          </button>
        </div>

        {/* Caption below button */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-white tracking-wide">
            {selectedGame ? (
              <span className="flex items-center justify-center gap-1.5 text-[#39FF70]">
                <span>Ready: {selectedGame.name}</span>
                <span className="text-[10px] text-[#B7C6BA] font-normal font-sans">
                  ({selectedGame.category})
                </span>
              </span>
            ) : (
              'Launch your selected game'
            )}
          </p>
          <p className="text-[10px] text-[#6B7C70] mt-0.5">
            {selectedGame
              ? 'Tap START to open details & dispatch launch intent'
              : games.length === 0
              ? 'No game selected — tap START to add your first game'
              : 'Select a game below or tap START to launch'}
          </p>
        </div>
      </div>

      {/* 2. Device Status Indicators (Compact Strip) */}
      <div className="grid grid-cols-4 gap-2">
        {/* RAM Indicator */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-2 text-center">
          <div className="text-[9px] font-mono text-[#6B7C70] flex items-center justify-center gap-1">
            <Cpu className="w-2.5 h-2.5 text-[#39FF70]" />
            RAM
          </div>
          <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
            {metrics.ramAvailableGb ? `${metrics.ramAvailableGb}GB` : 'N/A'}
          </div>
          <div className="text-[8px] text-[#6B7C70] truncate">Free</div>
        </div>

        {/* Storage Indicator */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-2 text-center">
          <div className="text-[9px] font-mono text-[#6B7C70] flex items-center justify-center gap-1">
            <HardDrive className="w-2.5 h-2.5 text-[#69B7FF]" />
            STORAGE
          </div>
          <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
            {metrics.storageAvailableGb ? `${metrics.storageAvailableGb}GB` : 'Quota'}
          </div>
          <div className="text-[8px] text-[#6B7C70] truncate">Free</div>
        </div>

        {/* Battery Indicator */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-2 text-center">
          <div className="text-[9px] font-mono text-[#6B7C70] flex items-center justify-center gap-1">
            <Battery className="w-2.5 h-2.5 text-[#FFC857]" />
            BATTERY
          </div>
          <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
            {metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : 'N/A'}
          </div>
          <div className="text-[8px] text-[#6B7C70] truncate">
            {metrics.isCharging ? 'Charging' : 'On Cell'}
          </div>
        </div>

        {/* Network Indicator */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-2 text-center">
          <div className="text-[9px] font-mono text-[#6B7C70] flex items-center justify-center gap-1">
            <Wifi className="w-2.5 h-2.5 text-[#39FF70]" />
            NETWORK
          </div>
          <div className="text-xs font-bold font-mono text-white mt-0.5 truncate">
            {recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined
              ? `${recentTest.latencyMs}ms`
              : metrics.isOnline ? 'Online' : 'Offline'}
          </div>
          <div className="text-[8px] text-[#6B7C70] truncate">
            {recentTest ? recentTest.quality : 'Unchecked'}
          </div>
        </div>
      </div>

      {/* 3. Game Launcher Card */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-display text-white tracking-wider">
              GAME LAUNCHER
            </h2>
            <span className="text-[10px] font-mono text-[#39FF70] bg-[#39FF70]/10 border border-[#39FF70]/30 px-1.5 py-0.2 rounded">
              {games.length} Added
            </span>
          </div>

          {games.length > 0 && (
            <button
              onClick={() => onNavigate('my-games')}
              className="text-xs text-[#B7C6BA] hover:text-[#39FF70] transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Empty State vs Games Carousel */}
        {games.length === 0 ? (
          <div className="py-6 px-4 bg-[#050806] border border-dashed border-[#285C38] rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#151F18] border border-[#285C38] text-[#39FF70] flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-display">
                No games or apps added yet.
              </div>
              <p className="text-xs text-[#6B7C70] max-w-xs mx-auto mt-1">
                Add mobile games or installed applications to launch, monitor latency, and inspect diagnostics.
              </p>
            </div>
            <div className="flex items-center justify-center pt-1">
              <button
                onClick={() => onNavigate('add-game')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#39FF70] to-[#20C65A] text-black font-display font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(57,255,112,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                aria-label="Add installed apps and games"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ ADD</span>
              </button>
            </div>
          </div>
        ) : (
          /* Horizontal Game Selector Carousel */
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {/* Single Unified + ADD Tile */}
            <button
              onClick={() => onNavigate('add-game')}
              className="w-20 h-24 rounded-xl bg-[#050806] border-2 border-dashed border-[#39FF70]/50 hover:border-[#39FF70] flex flex-col items-center justify-center flex-shrink-0 transition-all cursor-pointer group"
              title="Add Installed Apps & Games"
              aria-label="Add installed apps and games"
            >
              <div className="w-8 h-8 rounded-lg bg-[#151F18] text-[#39FF70] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold font-display text-[#39FF70] mt-1.5">
                + ADD
              </span>
            </button>

            {/* Saved Games Tiles */}
            {games.map((game) => {
              const isSelected = selectedGame?.id === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className={`w-20 h-24 rounded-xl p-2 flex flex-col items-center justify-between flex-shrink-0 border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#151F18] border-[#39FF70] shadow-[0_0_12px_rgba(57,255,112,0.25)]'
                      : 'bg-[#050806] border-[#285C38] hover:border-[#39FF70]/40'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1 w-3 h-3 rounded-full bg-[#39FF70] border border-black" />
                  )}

                  <div className="w-8 h-8 flex items-center justify-center mt-1">
                    {game.iconBase64 ? (
                      <img
                        src={game.iconBase64}
                        alt={game.name}
                        className="w-8 h-8 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{game.icon}</span>
                    )}
                  </div>

                  <div className="text-center w-full">
                    <div
                      className={`text-[10px] font-medium truncate ${
                        isSelected ? 'text-[#39FF70] font-bold' : 'text-white'
                      }`}
                    >
                      {game.name}
                    </div>
                    <div className="text-[8px] text-[#6B7C70] truncate mt-0.5">
                      {game.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Go Ad-Free VIP Subscription Banner */}
      <div
        onClick={() => onNavigate('subscription')}
        className={`w-full rounded-2xl p-3 flex items-center justify-between border cursor-pointer transition-all ${
          isAdFreeActive
            ? 'bg-gradient-to-r from-[#1A2E1F] to-[#101712] border-[#39FF70] shadow-[0_0_15px_rgba(57,255,112,0.15)]'
            : 'bg-gradient-to-r from-[#181E15] via-[#101712] to-[#0A100C] border-[#FFD700]/40 hover:border-[#FFD700]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black/60 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display text-white">
                {isAdFreeActive ? 'VIP AD-FREE ACTIVE' : 'UPGRADE TO AD-FREE VIP'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] font-bold">
                {isAdFreeActive ? 'ACTIVE' : 'FROM ₹9'}
              </span>
            </div>
            <p className="text-[10px] text-[#B7C6BA] mt-0.5">
              {isAdFreeActive
                ? 'LevelPlay banner & interstitial ads suppressed'
                : '100% Zero Ads • Google Play Subscriptions & UPI: prakash26pr@axl'}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('subscription');
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-bold transition-all cursor-pointer ${
            isAdFreeActive
              ? 'bg-[#1C2D22] text-[#39FF70] border border-[#39FF70]/40'
              : 'bg-[#FFD700] text-black hover:bg-[#FFE04D]'
          }`}
        >
          {isAdFreeActive ? 'MANAGE' : 'GO AD-FREE'}
        </button>
      </div>

      {/* 4. Phone Analysis Wide Action Button */}
      <button
        onClick={() => onNavigate('analysis')}
        className="w-full bg-[#101712] hover:bg-[#151F18] border border-[#285C38] hover:border-[#39FF70]/40 rounded-2xl p-3.5 flex items-center justify-between transition-all group cursor-pointer shadow-md text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#151F18] border border-[#285C38] text-[#39FF70] flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold font-display text-white group-hover:text-[#39FF70] transition-colors">
              VIEW SYSTEM ANALYSIS
            </div>
            <div className="text-[11px] text-[#6B7C70]">
              Device information and performance metrics
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-[#39FF70] transform group-hover:translate-x-1 transition-transform" />
      </button>

      {/* 5. Network Latency & Battery Status Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Network Card */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-display text-white flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#39FF70]" />
                NETWORK LATENCY
              </span>
            </div>

            <div className="my-2">
              <div className="text-base font-bold font-mono text-white">
                {recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined ? (
                  <>
                    {recentTest.latencyMs} <span className="text-xs text-[#6B7C70]">ms</span>
                  </>
                ) : (
                  <span className="text-xs text-[#6B7C70]">Not tested</span>
                )}
              </div>
              <div className="mt-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${qualityColors.text} ${qualityColors.bg} ${qualityColors.border}`}
                >
                  {recentTest ? recentTest.quality : 'Unchecked'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('network-test')}
            className="w-full py-1.5 bg-[#151F18] hover:bg-[#20C65A]/20 text-[#39FF70] border border-[#285C38] hover:border-[#39FF70]/40 text-[10px] font-bold font-display rounded-lg transition-colors cursor-pointer"
          >
            TEST NETWORK
          </button>
        </div>

        {/* Battery Card */}
        <div className="bg-[#101712] border border-[#285C38] rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold font-display text-white flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-[#FFC857]" />
                BATTERY STATUS
              </span>
            </div>

            <div className="my-2">
              <div className="text-base font-bold font-mono text-white">
                {metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : 'Unavailable'}
              </div>
              <div className="text-[10px] text-[#B7C6BA] mt-1">
                {metrics.isCharging ? 'Active Charging' : 'Discharging'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('battery')}
            className="w-full py-1.5 bg-[#151F18] hover:bg-[#FFC857]/20 text-[#FFC857] border border-[#285C38] hover:border-[#FFC857]/40 text-[10px] font-bold font-display rounded-lg transition-colors cursor-pointer"
          >
            BATTERY DETAILS
          </button>
        </div>
      </div>
    </div>
  );
};
