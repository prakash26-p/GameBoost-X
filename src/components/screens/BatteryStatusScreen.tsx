import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Info
} from 'lucide-react';
import { DeviceMetrics } from '../../types';

interface BatteryStatusScreenProps {
  metrics: DeviceMetrics;
  onBack: () => void;
  onRefreshMetrics: () => void;
}

interface BatteryLogEntry {
  timestamp: string;
  level: number;
  charging: boolean;
}

export const BatteryStatusScreen: React.FC<BatteryStatusScreenProps> = ({
  metrics,
  onBack,
  onRefreshMetrics
}) => {
  const [historyLogs, setHistoryLogs] = useState<BatteryLogEntry[]>(() => {
    if (metrics.batteryPercent !== null) {
      return [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          level: metrics.batteryPercent,
          charging: metrics.isCharging ?? false
        }
      ];
    }
    return [];
  });

  useEffect(() => {
    if (metrics.batteryPercent !== null) {
      setHistoryLogs((prev) => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (prev.length > 0 && prev[0].level === metrics.batteryPercent && prev[0].charging === metrics.isCharging) {
          return prev;
        }
        return [
          {
            timestamp: timeStr,
            level: metrics.batteryPercent as number,
            charging: metrics.isCharging ?? false
          },
          ...prev.slice(0, 7)
        ];
      });
    }
  }, [metrics.batteryPercent, metrics.isCharging]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-[#101712] border border-[#285C38] flex items-center justify-center text-[#B7C6BA] hover:text-white transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold font-display text-white">
              Battery Status
            </h1>
            <p className="text-[11px] text-[#6B7C70]">
              Real-time battery diagnostics and charging power monitoring
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshMetrics}
          className="w-8 h-8 rounded-xl bg-[#101712] border border-[#285C38] flex items-center justify-center text-[#39FF70] hover:text-white transition-colors cursor-pointer"
          title="Refresh Battery State"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Large Neon Battery Gauge Hero Card */}
      <div className="bg-gradient-to-br from-[#0B110D] via-[#101712] to-[#151F18] border border-[#285C38] rounded-2xl p-6 text-center shadow-xl space-y-4 relative overflow-hidden">
        <div className="relative inline-flex items-center justify-center">
          {/* Outer circular glowing frame */}
          <div className="w-44 h-44 rounded-full border-4 border-[#285C38] flex flex-col items-center justify-center p-4 relative">
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-700 ${
                metrics.isCharging
                  ? 'border-[#FFC857] shadow-[0_0_20px_rgba(255,200,87,0.3)]'
                  : metrics.batteryPercent !== null && metrics.batteryPercent < 20
                  ? 'border-[#FF5C68] shadow-[0_0_20px_rgba(255,92,104,0.3)]'
                  : 'border-[#39FF70] shadow-[0_0_20px_rgba(57,255,112,0.3)]'
              }`}
            />

            {metrics.isCharging ? (
              <BatteryCharging className="w-8 h-8 text-[#FFC857] mb-1 animate-pulse" />
            ) : (
              <Battery className="w-8 h-8 text-[#39FF70] mb-1" />
            )}

            <div className="text-4xl font-extrabold font-mono text-white">
              {metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : 'N/A'}
            </div>

            <div className="text-[11px] font-mono text-[#B7C6BA] mt-0.5">
              {metrics.isCharging ? 'FAST CHARGING' : 'DISCHARGING'}
            </div>
          </div>
        </div>

        {/* Battery Details Row */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#285C38]">
          <div className="bg-[#050806] border border-[#285C38] rounded-xl p-2.5">
            <div className="text-[9px] font-mono text-[#6B7C70]">POWER SOURCE</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {metrics.isCharging ? 'USB / AC Adapter' : 'Internal Cell'}
            </div>
          </div>

          <div className="bg-[#050806] border border-[#285C38] rounded-xl p-2.5">
            <div className="text-[9px] font-mono text-[#6B7C70]">HEALTH STATUS</div>
            <div className="text-xs font-bold text-[#39FF70] mt-0.5">
              Good
            </div>
          </div>

          <div className="bg-[#050806] border border-[#285C38] rounded-xl p-2.5">
            <div className="text-[9px] font-mono text-[#6B7C70]">TEMPERATURE</div>
            <div className="text-xs font-mono text-[#6B7C70] mt-0.5">
              Unavailable
            </div>
          </div>
        </div>
      </div>

      {/* Honest Battery Limits Transparency */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-2">
        <div className="text-xs font-bold font-display text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#39FF70]" />
          <span>Battery Transparency Note</span>
        </div>
        <p className="text-xs text-[#B7C6BA] leading-relaxed">
          Battery percentage is device-wide. Standard browser Web APIs do not expose exact battery drain per individual game. Temperature reading requires Android native <code className="text-[#39FF70] font-mono text-[11px]">Intent.ACTION_BATTERY_CHANGED (EXTRA_TEMPERATURE)</code>.
        </p>
      </div>

      {/* Battery Measurement Log History */}
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-display text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#39FF70]" />
            Recent Session Measurements
          </span>
          <span className="text-[10px] font-mono text-[#6B7C70]">Local Log</span>
        </div>

        {historyLogs.length === 0 ? (
          <div className="text-xs text-[#6B7C70] text-center py-4 bg-[#050806] rounded-xl border border-[#285C38]">
            Battery history will appear after measurements are collected.
          </div>
        ) : (
          <div className="space-y-1.5">
            {historyLogs.map((log, index) => (
              <div
                key={index}
                className="bg-[#050806] border border-[#285C38] rounded-xl px-3 py-2 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#6B7C70] text-[10px]">{log.timestamp}</span>
                  <span className="text-white font-bold">{log.level}%</span>
                </div>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded border ${
                    log.charging
                      ? 'text-[#FFC857] bg-[#FFC857]/10 border-[#FFC857]/30'
                      : 'text-[#39FF70] bg-[#39FF70]/10 border-[#39FF70]/30'
                  }`}
                >
                  {log.charging ? 'Charging' : 'Discharging'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
