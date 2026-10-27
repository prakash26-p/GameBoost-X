import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Cpu,
  HardDrive,
  Battery,
  Wifi,
  Activity,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { GameRecord, DeviceMetrics, NetworkMeasurement, ScreenId } from '../../types';
import { getQualityColorClass, getLatencyDescription } from '../../utils/networkUtils';

interface GameDetailsScreenProps {
  game: GameRecord;
  metrics: DeviceMetrics;
  recentTest: NetworkMeasurement | null;
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  onRunNetworkTest: () => Promise<void>;
  isTestingNetwork: boolean;
  onPlayGame: (game: GameRecord) => void;
}

export const GameDetailsScreen: React.FC<GameDetailsScreenProps> = ({
  game,
  metrics,
  recentTest,
  onBack,
  onNavigate,
  onRunNetworkTest,
  isTestingNetwork,
  onPlayGame
}) => {
  const [copiedAdb, setCopiedAdb] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const qualityColors = recentTest
    ? getQualityColorClass(recentTest.quality)
    : { text: 'text-[#7E8B82]', bg: 'bg-[#29382F]/20', border: 'border-[#29382F]' };

  const adbCommand = game.packageName
    ? `adb shell monkey -p ${game.packageName} -c android.intent.category.LAUNCHER 1`
    : `adb shell am start -n com.example.game/.MainActivity`;

  const copyAdbCommand = () => {
    navigator.clipboard.writeText(adbCommand);
    setCopiedAdb(true);
    setTimeout(() => setCopiedAdb(false), 2000);
  };

  const handlePlayClick = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setLaunchMessage(`Preparing Android launch intent for ${game.name}...`);

    setTimeout(() => {
      onPlayGame(game);
      setIsLaunching(false);
      setLaunchMessage(`Launch signal dispatched for package: ${game.packageName || 'com.example.game'}`);
    }, 600);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
          aria-label="Back to library"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-[11px] font-mono text-[#7E8B82]">
          GAME PROFILE
        </div>

        <button
          onClick={() => onNavigate('safe-boost')}
          className="flex items-center gap-1 text-xs text-[#39FF88] bg-[#39FF88]/10 border border-[#39FF88]/30 px-2.5 py-1 rounded-lg hover:bg-[#39FF88]/20 transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Boost</span>
        </button>
      </div>

      {/* Game Identity Hero */}
      <div className="bg-gradient-to-br from-[#101512] via-[#151C18] to-[#1B241F] border border-[#29382F] rounded-2xl p-4.5 flex items-center gap-4 shadow-xl">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-[#39FF88]/40 shadow-lg shadow-[#39FF88]/10"
          style={{ backgroundColor: `${game.accentColor}25` }}
        >
          {game.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-display text-white truncate">
              {game.name}
            </h1>
          </div>

          <div className="text-xs font-mono text-[#39FF88] truncate mt-0.5">
            {game.packageName || 'Custom Package'}
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#7E8B82]">
            <span className="text-[#B7C4BC]">{game.category}</span>
            <span>·</span>
            <span>{game.developer || 'Verified Mobile Developer'}</span>
          </div>
        </div>
      </div>

      {/* Launch Feedback Banner */}
      {launchMessage && (
        <div className="p-3 bg-[#39FF88]/10 border border-[#39FF88]/30 rounded-xl text-xs text-[#39FF88] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{launchMessage}</span>
          </div>
          <button
            onClick={() => setLaunchMessage(null)}
            className="text-[#7E8B82] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. RAM Information Card */}
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#39FF88]" />
              Device & Game Memory
            </span>
            <span className="text-[10px] font-mono text-[#7E8B82]">
              {metrics.ramTotalGb ? `${metrics.ramTotalGb}GB Total` : 'Web API'}
            </span>
          </div>

          <div className="bg-[#101512] rounded-xl p-2.5 border border-[#29382F] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Device Hardware RAM</span>
              <span className="font-mono text-white">
                {metrics.ramTotalGb ? `${metrics.ramTotalGb} GB` : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Estimated System Available</span>
              <span className="font-mono text-[#39FF88]">
                {metrics.ramAvailableGb ? `~${metrics.ramAvailableGb} GB free` : 'Hardware sandbox'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#7E8B82] leading-relaxed flex items-start gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
            <span>
              <strong>RAM Transparency:</strong> Exact game RAM usage is not exposed by this device or app configuration without Android root or privileged OEM telemetry.
            </span>
          </div>
        </div>

        {/* 2. Storage Information Card */}
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#69B7FF]" />
              Storage Footprint
            </span>
            <span className="text-[10px] font-mono text-[#7E8B82]">Package Profile</span>
          </div>

          <div className="bg-[#101512] rounded-xl p-2.5 border border-[#29382F] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Package Size Estimate</span>
              <span className="font-mono text-white">
                {game.packageSizeEstimate || '~500 MB typical'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Origin Storage Quota</span>
              <span className="font-mono text-[#69B7FF]">
                {metrics.storageTotalGb ? `${metrics.storageTotalGb} GB` : 'Standard quota'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#7E8B82] leading-relaxed flex items-start gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Storage Scope:</strong> Exact game storage usage unavailable without Android StorageStatsManager API.
            </span>
          </div>
        </div>

        {/* 3. Battery Information Card */}
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-[#FFC857]" />
              Battery Status
            </span>
            <span className="text-[10px] font-mono text-[#7E8B82]">
              {metrics.isCharging ? 'Power Connected' : 'Battery'}
            </span>
          </div>

          <div className="bg-[#101512] rounded-xl p-2.5 border border-[#29382F] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Current Charge Level</span>
              <span className="font-mono font-bold text-white">
                {metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Charging State</span>
              <span className="font-mono text-[#FFC857]">
                {metrics.isCharging ? 'Active Charging' : 'Discharging'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#7E8B82] leading-relaxed flex items-start gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Battery Note:</strong> Displayed battery percentage is device-wide. GameBoost X does not fabricate per-game battery consumption figures.
            </span>
          </div>
        </div>

        {/* 4. FPS & Display Refresh Rate Card */}
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#39FF88]" />
              Frame Rate & Display
            </span>
            <span className="text-[10px] font-mono text-[#39FF88]">Live Test</span>
          </div>

          <div className="bg-[#101512] rounded-xl p-2.5 border border-[#29382F] space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">Display Refresh Rate</span>
              <span className="font-mono font-bold text-[#39FF88]">
                {metrics.displayRefreshRateHz ? `${metrics.displayRefreshRateHz} Hz` : 'Measuring...'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#B7C4BC]">In-Game Realtime FPS</span>
              <span className="font-mono text-[#7E8B82]">
                Not available
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#7E8B82] leading-relaxed flex items-start gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Display Refresh vs FPS:</strong> Actual game FPS is not available through browser monitoring. We never substitute display refresh rate as game FPS.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Live Network Latency & Quality Card */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#39FF88]" />
              Network Latency & Game Quality
            </span>
            <p className="text-[11px] text-[#7E8B82]">
              Connection: {metrics.connectionType}
            </p>
          </div>

          <button
            onClick={onRunNetworkTest}
            disabled={isTestingNetwork}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-display border transition-all cursor-pointer ${
              isTestingNetwork
                ? 'bg-[#1B241F] text-[#7E8B82] border-[#29382F]'
                : 'bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/40 hover:bg-[#39FF88]/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingNetwork ? 'animate-spin' : ''}`} />
            <span>{isTestingNetwork ? 'Testing...' : 'TEST NETWORK'}</span>
          </button>
        </div>

        {/* Network Metrics Display */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5">
            <div className="text-[10px] text-[#7E8B82] font-mono">LATENCY</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined ? (
                `${recentTest.latencyMs} ms`
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5">
            <div className="text-[10px] text-[#7E8B82] font-mono">JITTER</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {recentTest?.jitterMs !== null && recentTest?.jitterMs !== undefined ? (
                `±${recentTest.jitterMs} ms`
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5">
            <div className="text-[10px] text-[#7E8B82] font-mono">QUALITY</div>
            <div className={`text-xs font-bold font-mono mt-1 ${qualityColors.text}`}>
              {recentTest ? recentTest.quality : 'Not tested'}
            </div>
          </div>
        </div>

        <div className="bg-[#101512] border border-[#29382F] rounded-xl p-3 text-xs text-[#B7C4BC] leading-relaxed">
          {recentTest ? (
            getLatencyDescription(recentTest.quality)
          ) : (
            'Tap "Test Network" to measure real monotonic ping to the configured gaming endpoint.'
          )}
        </div>

        <div className="text-[10px] text-[#7E8B82] leading-relaxed flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Routing Scope:</strong> An internet test endpoint may not use the same route as the game's actual multiplayer game server. Measured internet latency is an indicator of baseline network health, not identical to internal game ping.
          </span>
        </div>
      </div>

      {/* Android Launch Intent & ADB Bridge Helper */}
      <div className="bg-[#101512] border border-[#29382F] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#39FF88]" />
            Android Launcher Integration
          </span>
          <button
            onClick={copyAdbCommand}
            className="flex items-center gap-1 text-[10px] font-mono text-[#39FF88] hover:underline cursor-pointer"
          >
            {copiedAdb ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedAdb ? 'Copied' : 'Copy ADB'}</span>
          </button>
        </div>

        <div className="bg-[#080B0A] border border-[#29382F] rounded-lg p-2 font-mono text-[10px] text-[#B7C4BC] truncate">
          {adbCommand}
        </div>
      </div>

      {/* Bottom Sticky Main PLAY GAME Button */}
      <div className="fixed bottom-14 left-0 right-0 max-w-lg mx-auto px-4 z-40">
        <div className="bg-[#080B0A]/90 backdrop-blur-md border border-[#29382F] p-2.5 rounded-2xl shadow-2xl">
          <button
            onClick={handlePlayClick}
            disabled={isLaunching}
            className="w-full py-3.5 px-6 bg-[#39FF88] hover:bg-[#20C76B] text-black font-display font-extrabold text-base tracking-wider rounded-xl transition-all shadow-lg shadow-[#39FF88]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            aria-label={`Play ${game.name}`}
          >
            <Play className="w-5 h-5 fill-black" />
            <span>{isLaunching ? 'LAUNCHING GAME...' : 'PLAY GAME'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
