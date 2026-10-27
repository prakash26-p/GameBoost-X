import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Battery,
  BatteryCharging,
  Wifi,
  Pause,
  Play,
  AlertCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { DeviceMetrics, NetworkMeasurement } from '../../types';

interface PerformanceScreenProps {
  metrics: DeviceMetrics;
  recentTest: NetworkMeasurement | null;
  onRefreshMetrics: () => void;
  isMonitoringActive: boolean;
  onToggleMonitoring: () => void;
}

export const PerformanceScreen: React.FC<PerformanceScreenProps> = ({
  metrics,
  recentTest,
  onRefreshMetrics,
  isMonitoringActive,
  onToggleMonitoring
}) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header with Live Monitor Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Performance Monitor
          </h1>
          <p className="text-[11px] text-[#7E8B82]">
            Authentic Android hardware stats & real-time refresh rate diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshMetrics}
            className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#B7C4BC] hover:text-[#39FF88] transition-colors cursor-pointer"
            title="Refresh current metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMonitoring}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              isMonitoringActive
                ? 'bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/40'
                : 'bg-[#151C18] text-[#7E8B82] border-[#29382F]'
            }`}
          >
            {isMonitoringActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isMonitoringActive ? 'Active' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Primary Display Refresh Rate vs Game FPS Card */}
      <div className="bg-gradient-to-br from-[#101512] via-[#151C18] to-[#1B241F] border border-[#29382F] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#39FF88]" />
            Display Refresh Rate Engine
          </span>
          <span className="text-[10px] font-mono text-[#39FF88] bg-[#39FF88]/10 border border-[#39FF88]/30 px-2 py-0.5 rounded">
            RAF Monitored
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-3">
            <div className="text-[10px] font-mono text-[#7E8B82]">DISPLAY REFRESH</div>
            <div className="text-3xl font-extrabold font-mono text-[#39FF88] mt-1">
              {metrics.displayRefreshRateHz ? `${metrics.displayRefreshRateHz} Hz` : 'Syncing...'}
            </div>
            <div className="text-[10px] text-[#B7C4BC] mt-1">
              Screen Frame Timing
            </div>
          </div>

          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-3">
            <div className="text-[10px] font-mono text-[#7E8B82]">IN-GAME RENDER FPS</div>
            <div className="text-lg font-bold font-mono text-[#7E8B82] mt-2">
              Unavailable
            </div>
            <div className="text-[10px] text-[#7E8B82] mt-1">
              Requires SurfaceFlinger
            </div>
          </div>
        </div>

        <div className="bg-[#101512] rounded-xl p-3 border border-[#29382F] text-xs text-[#7E8B82] leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#FFC857] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Engineering Principle:</strong> Display Refresh Rate is the hardware frequency of the screen panel (60/90/120Hz). Actual game FPS depends on the GPU workload and game engine state. GameBoost X strictly refuses to display fake 60/90 FPS numbers.
          </div>
        </div>
      </div>

      {/* Hardware RAM Status */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#39FF88]" />
            Physical Device Memory
          </span>
          <span className="text-xs font-mono text-[#39FF88]">
            {metrics.ramTotalGb ? `${metrics.ramTotalGb} GB Total` : 'Restricted'}
          </span>
        </div>

        {metrics.ramTotalGb ? (
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#B7C4BC]">System In-Use: ~{metrics.ramUsedGb} GB</span>
              <span className="text-white">Available: ~{metrics.ramAvailableGb} GB</span>
            </div>
            <div className="w-full bg-[#101512] h-2.5 rounded-full overflow-hidden border border-[#29382F]">
              <div
                className="bg-gradient-to-r from-[#39FF88] to-[#20C76B] h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.ramUsagePercent || 48}%` }}
              />
            </div>
            <div className="text-[11px] text-[#7E8B82] mt-2">
              Hardware Class: Android {metrics.ramTotalGb}GB device footprint.
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#7E8B82] bg-[#101512] p-3 rounded-xl border border-[#29382F]">
            Device hardware RAM API (`navigator.deviceMemory`) is restricted in this browser session.
          </div>
        )}
      </div>

      {/* Storage Status */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-[#69B7FF]" />
            Origin Storage Pool
          </span>
          <span className="text-xs font-mono text-[#69B7FF]">
            {metrics.storageTotalGb ? `${metrics.storageTotalGb} GB Quota` : 'Standard'}
          </span>
        </div>

        {metrics.storageTotalGb ? (
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#B7C4BC]">Cache & IndexedDB: {metrics.storageUsedGb} GB</span>
              <span className="text-white">Free: {metrics.storageAvailableGb} GB</span>
            </div>
            <div className="w-full bg-[#101512] h-2.5 rounded-full overflow-hidden border border-[#29382F]">
              <div
                className="bg-[#69B7FF] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, metrics.storageUsagePercent || 2)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#7E8B82] bg-[#101512] p-3 rounded-xl border border-[#29382F]">
            Storage quota estimation not available.
          </div>
        )}
      </div>

      {/* Battery Diagnostics */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
            {metrics.isCharging ? (
              <BatteryCharging className="w-4 h-4 text-[#FFC857]" />
            ) : (
              <Battery className="w-4 h-4 text-[#39FF88]" />
            )}
            Battery Subsystem
          </span>
          <span className="text-xs font-mono text-white">
            {metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : 'Unavailable'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5">
            <div className="text-[10px] text-[#7E8B82]">POWER STATE</div>
            <div className="font-mono font-medium text-white mt-0.5">
              {metrics.isCharging ? 'Charging (AC/USB)' : 'Discharging'}
            </div>
          </div>

          <div className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5">
            <div className="text-[10px] text-[#7E8B82]">BATTERY TEMPERATURE</div>
            <div className="font-mono text-[#7E8B82] mt-0.5">
              Not exposed by Web
            </div>
          </div>
        </div>

        <div className="text-[10px] text-[#7E8B82] leading-relaxed">
          Battery temperature is restricted to Android native BroadcastReceiver (`Intent.ACTION_BATTERY_CHANGED`). Standard web apps cannot read thermals to protect user privacy.
        </div>
      </div>
    </div>
  );
};
