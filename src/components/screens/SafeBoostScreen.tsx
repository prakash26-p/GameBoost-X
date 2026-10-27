import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Activity,
  Wifi,
  Smartphone,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { OptimizationStepResult, OptimizationSummary, ScreenId } from '../../types';
import { runSafeOptimizationPipeline } from '../../utils/optimizationUtils';

interface SafeBoostScreenProps {
  currentPingMs: number | null;
  onNavigate: (screen: ScreenId) => void;
  onOptimizationFinished: (summary: OptimizationSummary) => void;
}

export const SafeBoostScreen: React.FC<SafeBoostScreenProps> = ({
  currentPingMs,
  onNavigate,
  onOptimizationFinished
}) => {
  const [isBoosting, setIsBoosting] = useState(false);
  const [currentStep, setCurrentStep] = useState<OptimizationStepResult | null>(null);
  const [summary, setSummary] = useState<OptimizationSummary | null>(null);

  const [options, setOptions] = useState({
    clearAppCache: true,
    throttleTelemetry: true,
    preflightPingCheck: true,
    checkOemGameMode: true
  });

  const handleStartSafeBoost = async () => {
    setIsBoosting(true);
    setSummary(null);
    setCurrentStep(null);

    try {
      const result = await runSafeOptimizationPipeline(
        {
          ...options,
          onStepProgress: (step) => {
            setCurrentStep({ ...step });
          }
        },
        currentPingMs
      );

      setSummary(result);
      onOptimizationFinished(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBoosting(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="text-[11px] font-mono text-[#39FF88] uppercase tracking-wider">
          AUTHENTIC & SAFE UTILITY
        </div>
        <h1 className="text-xl font-bold font-display text-white">
          BOOST & OPTIMIZE
        </h1>
        <p className="text-[11px] text-[#7E8B82]">
          Execute real, safe operations without fake RAM cleaners or root permissions
        </p>
      </div>

      {/* Safety Manifesto Card */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#39FF88]/10 text-[#39FF88] border border-[#39FF88]/30 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-white font-display">
            Google Play & Android Safe Policy
          </div>
          <p className="text-[#B7C4BC] leading-relaxed">
            GameBoost X performs only legitimate, authorized device optimizations. We never attempt to forcibly terminate unrelated system apps, overclock your chipset, or make fake "200% faster" claims.
          </p>
        </div>
      </div>

      {/* Checklist Configuration */}
      {!summary && !isBoosting && (
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold font-display text-white flex items-center justify-between">
            <span>Optimization Checklist</span>
            <span className="text-[10px] font-mono text-[#7E8B82]">Customizable</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#101512] border border-[#29382F] cursor-pointer hover:border-[#39FF88]/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-[#39FF88]" />
                <div>
                  <div className="text-xs font-medium text-white">Clear GameBoost X Caches</div>
                  <div className="text-[10px] text-[#7E8B82]">Reclaims temporary storage from local app sessions</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.clearAppCache}
                onChange={(e) => setOptions({ ...options, clearAppCache: e.target.checked })}
                className="accent-[#39FF88] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#101512] border border-[#29382F] cursor-pointer hover:border-[#39FF88]/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#69B7FF]" />
                <div>
                  <div className="text-xs font-medium text-white">Throttle Background Telemetry</div>
                  <div className="text-[10px] text-[#7E8B82]">Suspends active UI timers to prevent CPU contention</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.throttleTelemetry}
                onChange={(e) => setOptions({ ...options, throttleTelemetry: e.target.checked })}
                className="accent-[#39FF88] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#101512] border border-[#29382F] cursor-pointer hover:border-[#39FF88]/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-[#FFC857]" />
                <div>
                  <div className="text-xs font-medium text-white">Pre-flight Latency & Route Check</div>
                  <div className="text-[10px] text-[#7E8B82]">Verifies baseline connection reachability</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.preflightPingCheck}
                onChange={(e) => setOptions({ ...options, preflightPingCheck: e.target.checked })}
                className="accent-[#39FF88] w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#101512] border border-[#29382F] cursor-pointer hover:border-[#39FF88]/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#39FF88]" />
                <div>
                  <div className="text-xs font-medium text-white">Android OEM Game Profiles</div>
                  <div className="text-[10px] text-[#7E8B82]">Provides hardware-specific Samsung/Xiaomi/OnePlus guides</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={options.checkOemGameMode}
                onChange={(e) => setOptions({ ...options, checkOemGameMode: e.target.checked })}
                className="accent-[#39FF88] w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          <button
            onClick={handleStartSafeBoost}
            className="w-full py-3.5 bg-[#39FF88] hover:bg-[#20C76B] text-black font-display font-extrabold text-sm tracking-wider rounded-xl transition-all shadow-lg shadow-[#39FF88]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>START SAFE BOOST</span>
          </button>
        </div>
      )}

      {/* Live Boosting Progress State */}
      {isBoosting && (
        <div className="bg-[#151C18] border border-[#39FF88]/40 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1B241F] border border-[#39FF88] flex items-center justify-center text-[#39FF88]">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div>
            <div className="text-sm font-bold font-display text-white">
              {currentStep?.title || 'Executing Safe Operations...'}
            </div>
            <p className="text-xs text-[#39FF88] font-mono mt-1">
              {currentStep?.detail || 'Applying parameters...'}
            </p>
          </div>

          <div className="w-full bg-[#101512] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#39FF88] h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* Completion Summary Card */}
      {summary && (
        <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4.5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#29382F]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#39FF88]" />
              <div>
                <h3 className="font-bold text-white text-sm font-display">
                  Safe Boost Completed
                </h3>
                <span className="text-[10px] font-mono text-[#7E8B82]">
                  {new Date(summary.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#39FF88]">{summary.successCount} passed</span>
              <span className="text-[#7E8B82]">·</span>
              <span className="text-[#FFC857]">{summary.unsupportedCount} restricted</span>
            </div>
          </div>

          {/* Detailed Steps Outcomes */}
          <div className="space-y-2">
            {summary.steps.map((step) => (
              <div
                key={step.id}
                className="bg-[#101512] border border-[#29382F] rounded-xl p-2.5 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-white flex items-center gap-1.5">
                    {step.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF88]" />
                    ) : step.status === 'unsupported' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-[#FFC857]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#7E8B82]" />
                    )}
                    <span>{step.title}</span>
                  </div>
                  <div className="text-[11px] text-[#7E8B82] mt-0.5 pl-5">
                    {step.detail}
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${
                    step.status === 'success'
                      ? 'text-[#39FF88] bg-[#39FF88]/10 border-[#39FF88]/30'
                      : step.status === 'unsupported'
                      ? 'text-[#FFC857] bg-[#FFC857]/10 border-[#FFC857]/30'
                      : 'text-[#7E8B82] bg-[#29382F] border-[#29382F]'
                  }`}
                >
                  {step.status}
                </span>
              </div>
            ))}
          </div>

          {/* OEM Phone Manufacturer Guidance */}
          <div className="bg-[#101512] rounded-xl p-3 border border-[#29382F] space-y-2">
            <div className="text-xs font-bold font-display text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#39FF88]" />
              Android OEM Priority Gaming Modes
            </div>
            <p className="text-xs text-[#B7C4BC] leading-relaxed">
              {summary.gameModeNotice}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-[#151C18] p-2 rounded-lg border border-[#29382F]">
                <strong className="text-white block">Samsung Galaxy:</strong>
                <span className="text-[#7E8B82]">Open Game Booster &rarr; Priority Mode</span>
              </div>
              <div className="bg-[#151C18] p-2 rounded-lg border border-[#29382F]">
                <strong className="text-white block">Xiaomi / POCO:</strong>
                <span className="text-[#7E8B82]">Security App &rarr; Game Turbo</span>
              </div>
              <div className="bg-[#151C18] p-2 rounded-lg border border-[#29382F]">
                <strong className="text-white block">OnePlus / Realme:</strong>
                <span className="text-[#7E8B82]">Games App &rarr; Pro Gamer Mode</span>
              </div>
              <div className="bg-[#151C18] p-2 rounded-lg border border-[#29382F]">
                <strong className="text-white block">iQOO / Vivo:</strong>
                <span className="text-[#7E8B82]">Ultra Game Mode &rarr; Monster Mode</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setSummary(null)}
              className="flex-1 py-2.5 bg-[#1B241F] text-[#B7C4BC] hover:text-white rounded-xl text-xs font-medium border border-[#29382F] transition-colors cursor-pointer"
            >
              Re-run Boost
            </button>
            <button
              onClick={() => onNavigate('my-games')}
              className="flex-1 py-2.5 bg-[#39FF88] text-black rounded-xl text-xs font-bold font-display hover:bg-[#20C76B] transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <span>GO TO GAMES</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
