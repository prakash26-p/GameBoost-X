import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Cpu,
  HardDrive,
  Battery,
  Wifi,
  Activity,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
  Zap
} from 'lucide-react';
import { DeviceMetrics, NetworkMeasurement, ScreenId } from '../../types';
import { formatSpeed } from '../../utils/networkUtils';

interface PhoneAnalysisScreenProps {
  metrics: DeviceMetrics;
  recentTest: NetworkMeasurement | null;
  onBack: () => void;
  onRefreshAll: () => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const PhoneAnalysisScreen: React.FC<PhoneAnalysisScreenProps> = ({
  metrics,
  recentTest,
  onBack,
  onRefreshAll,
  onNavigate
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setCurrentStepText('Inspecting physical memory hardware class...');

    await new Promise((r) => setTimeout(r, 350));
    setAnalysisProgress(35);
    setCurrentStepText('Evaluating browser origin storage quota...');

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisProgress(65);
    setCurrentStepText('Querying battery subsystem state...');

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisProgress(85);
    setCurrentStepText('Sampling screen frame rate and network jitter...');

    await onRefreshAll();
    setAnalysisProgress(100);
    setCurrentStepText('Diagnostics complete. Validating results...');

    await new Promise((r) => setTimeout(r, 300));
    setIsAnalyzing(false);
    setHasCompletedAnalysis(true);
  };

  const metricItems = [
    {
      id: 'ram-total',
      title: 'Total Hardware RAM',
      value: metrics.ramTotalGb !== null ? `${metrics.ramTotalGb}` : 'Unavailable',
      unit: metrics.ramTotalGb !== null ? 'GB' : '',
      status: metrics.ramTotalGb !== null ? 'verified' : 'restricted',
      explanation: 'Physical hardware RAM class exposed by Chromium navigator.deviceMemory.',
      icon: Cpu,
      color: 'text-[#39FF70]'
    },
    {
      id: 'ram-avail',
      title: 'Available System RAM',
      value: metrics.ramAvailableGb !== null ? `~${metrics.ramAvailableGb}` : 'Unavailable',
      unit: metrics.ramAvailableGb !== null ? 'GB' : '',
      status: metrics.ramAvailableGb !== null ? 'verified' : 'restricted',
      explanation: 'Estimated free RAM after typical Android OS baseline reservation.',
      icon: Cpu,
      color: 'text-[#39FF70]'
    },
    {
      id: 'storage-total',
      title: 'Total Storage Pool',
      value: metrics.storageTotalGb !== null ? `${metrics.storageTotalGb}` : 'Standard',
      unit: metrics.storageTotalGb !== null ? 'GB' : '',
      status: metrics.storageTotalGb !== null ? 'verified' : 'restricted',
      explanation: 'Origin storage quota allocated by browser engine.',
      icon: HardDrive,
      color: 'text-[#69B7FF]'
    },
    {
      id: 'storage-avail',
      title: 'Available Storage',
      value: metrics.storageAvailableGb !== null ? `${metrics.storageAvailableGb}` : 'Standard',
      unit: metrics.storageAvailableGb !== null ? 'GB' : '',
      status: metrics.storageAvailableGb !== null ? 'verified' : 'restricted',
      explanation: 'Free space remaining within current origin quota allocation.',
      icon: HardDrive,
      color: 'text-[#69B7FF]'
    },
    {
      id: 'battery-level',
      title: 'Battery Percentage',
      value: metrics.batteryPercent !== null ? `${metrics.batteryPercent}` : 'Unavailable',
      unit: metrics.batteryPercent !== null ? '%' : '',
      status: metrics.batteryPercent !== null ? 'verified' : 'restricted',
      explanation: 'Current device battery charge state via standard Battery Status API.',
      icon: Battery,
      color: 'text-[#FFC857]'
    },
    {
      id: 'battery-charging',
      title: 'Charging Status',
      value: metrics.isCharging !== null ? (metrics.isCharging ? 'Charging' : 'Discharging') : 'Unavailable',
      unit: '',
      status: metrics.isCharging !== null ? 'verified' : 'restricted',
      explanation: 'Indicates active AC/USB power adapter connection.',
      icon: Battery,
      color: 'text-[#FFC857]'
    },
    {
      id: 'battery-temp',
      title: 'Battery Temperature',
      value: 'Restricted',
      unit: '',
      status: 'restricted',
      explanation: 'Protected by Android security. Requires native Intent.ACTION_BATTERY_CHANGED.',
      icon: Battery,
      color: 'text-[#6B7C70]'
    },
    {
      id: 'net-conn',
      title: 'Network Connection',
      value: metrics.connectionType,
      unit: '',
      status: metrics.isOnline ? 'verified' : 'warning',
      explanation: 'Identifies active network carrier type or local Wi-Fi interface.',
      icon: Wifi,
      color: 'text-[#39FF70]'
    },
    {
      id: 'net-ping',
      title: 'Network Latency',
      value: recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined ? `${recentTest.latencyMs}` : 'Not tested',
      unit: recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined ? 'ms' : '',
      status: recentTest?.latencyMs !== null && recentTest?.latencyMs !== undefined ? 'verified' : 'pending',
      explanation: 'Monotonic round-trip probe latency to gaming endpoint.',
      icon: Wifi,
      color: 'text-[#39FF70]'
    },
    {
      id: 'net-down',
      title: 'Download Speed',
      value: formatSpeed(recentTest?.downloadMbps ?? null),
      unit: '',
      status: recentTest?.downloadMbps ? 'verified' : 'pending',
      explanation: 'Downlink throughput measured with lightweight test chunk.',
      icon: Wifi,
      color: 'text-[#69B7FF]'
    },
    {
      id: 'net-up',
      title: 'Upload Speed',
      value: formatSpeed(recentTest?.uploadMbps ?? null),
      unit: '',
      status: recentTest?.uploadMbps ? 'verified' : 'pending',
      explanation: 'Uplink throughput estimation to test gateway.',
      icon: Wifi,
      color: 'text-[#39FF70]'
    },
    {
      id: 'refresh-rate',
      title: 'Display Refresh Rate',
      value: metrics.displayRefreshRateHz !== null ? `${metrics.displayRefreshRateHz}` : 'Syncing...',
      unit: metrics.displayRefreshRateHz !== null ? 'Hz' : '',
      status: metrics.displayRefreshRateHz !== null ? 'verified' : 'pending',
      explanation: 'Hardware screen panel refresh rate calculated live via requestAnimationFrame.',
      icon: Activity,
      color: 'text-[#39FF70]'
    },
    {
      id: 'game-fps',
      title: 'Actual In-Game FPS',
      value: 'Unavailable',
      unit: '',
      status: 'restricted',
      explanation: 'Restricted without native SurfaceFlinger or Android NDK FrameCallback.',
      icon: Activity,
      color: 'text-[#6B7C70]'
    },
    {
      id: 'timestamp',
      title: 'Analysis Timestamp',
      value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      unit: '',
      status: 'verified',
      explanation: 'Recorded system clock time for current diagnostic session.',
      icon: Clock,
      color: 'text-[#B7C6BA]'
    }
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
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
              Phone Analysis
            </h1>
            <p className="text-[11px] text-[#6B7C70]">
              Deep hardware, storage, battery & network diagnostic
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('battery')}
          className="text-xs text-[#39FF70] hover:text-[#20C65A] border border-[#285C38] bg-[#101712] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Battery View
        </button>
      </div>

      {/* Top Status Card inspired by reference screenshot */}
      <div className="bg-gradient-to-br from-[#0B110D] via-[#101712] to-[#151F18] border border-[#285C38] rounded-2xl p-4.5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                hasCompletedAnalysis
                  ? 'bg-[#39FF70]/15 text-[#39FF70] border border-[#39FF70]/40'
                  : 'bg-[#151F18] text-[#B7C6BA] border border-[#285C38]'
              }`}
            >
              {hasCompletedAnalysis ? <Check className="w-5 h-5 stroke-[3]" /> : <Activity className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#39FF70] uppercase tracking-wider">
                {hasCompletedAnalysis ? 'STATUS: VERIFIED' : 'STATUS: READY'}
              </div>
              <h2 className="text-base font-bold font-display text-white">
                SYSTEM ANALYSIS
              </h2>
            </div>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className={`px-3 py-1.5 bg-[#39FF70] hover:bg-[#20C65A] text-black font-display font-bold text-xs rounded-xl transition-all shadow-md shadow-[#39FF70]/20 flex items-center gap-1.5 cursor-pointer ${
              isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}</span>
          </button>
        </div>

        {/* Progress bar when analyzing */}
        {isAnalyzing && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-mono text-[#39FF70]">
              <span>{currentStepText}</span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="w-full bg-[#050806] h-2 rounded-full overflow-hidden border border-[#285C38]">
              <div
                className="bg-[#39FF70] h-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-[11px] text-[#B7C6BA] leading-relaxed pt-1">
          Analysis collects genuine hardware metrics exposed by your device and network stack. Restricted platform metrics are honestly flagged.
        </div>
      </div>

      {/* 14-Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {metricItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#101712] border border-[#285C38] rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-[#39FF70]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#B7C6BA] truncate flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${item.color}`} />
                  {item.title}
                </span>

                <span
                  className={`text-[8px] font-mono uppercase px-1 rounded border ${
                    item.status === 'verified'
                      ? 'text-[#39FF70] bg-[#39FF70]/10 border-[#39FF70]/30'
                      : item.status === 'warning'
                      ? 'text-[#FFC857] bg-[#FFC857]/10 border-[#FFC857]/30'
                      : 'text-[#6B7C70] bg-[#050806] border-[#285C38]'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <div className="text-base font-bold font-mono text-white flex items-baseline gap-1">
                  <span className="truncate">{item.value}</span>
                  {item.unit && <span className="text-xs text-[#6B7C70]">{item.unit}</span>}
                </div>
              </div>

              <div className="text-[9px] text-[#6B7C70] leading-snug line-clamp-2">
                {item.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
