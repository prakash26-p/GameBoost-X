import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ExternalLink, Play } from 'lucide-react';
import { levelPlayManager } from '../services/levelPlayManager';

interface LevelPlayInterstitialModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  destinationTitle?: string;
  placementName?: string;
}

export const LevelPlayInterstitialModal: React.FC<LevelPlayInterstitialModalProps> = ({
  isOpen,
  onDismiss,
  destinationTitle = 'Next Screen',
  placementName = 'DefaultInterstitial'
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    levelPlayManager.onInterstitialDisplayed();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const config = levelPlayManager.getConfig();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unity LevelPlay Interstitial Advertisement"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-[#101712] border border-[#285C38] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#0B110D] px-4 py-3 border-b border-[#285C38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#39FF70]/10 text-[#39FF70] border border-[#39FF70]/30 rounded font-bold">
              Unity LevelPlay
            </span>
            <span className="text-xs text-[#B7C6BA] font-mono truncate max-w-[130px]">
              {config.testMode ? 'Test Mode' : 'Production'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!canSkip ? (
              <span className="text-xs font-mono text-[#B7C6BA] bg-[#151F18] px-2.5 py-1 rounded-md border border-[#285C38]">
                Skip in {countdown}s
              </span>
            ) : (
              <button
                onClick={onDismiss}
                className="flex items-center gap-1 text-xs font-bold bg-[#39FF70] text-black px-3 py-1 rounded-md hover:bg-[#20C65A] transition-colors cursor-pointer"
                aria-label="Close advertisement and continue"
              >
                <span>Continue</span>
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Ad Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#151F18] to-[#285C38]/40 border border-[#39FF70]/40 flex items-center justify-center text-3xl shadow-lg mb-4">
            🚀
          </div>

          <div className="text-[11px] font-mono text-[#39FF70] font-bold tracking-wider mb-1">
            UNITY LEVELPLAY AD INTERSTITIAL
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            High-Performance Mobile Gaming
          </h3>
          <p className="text-xs text-[#B7C6BA] leading-relaxed mb-5">
            Demonstrating Unity LevelPlay mediation lifecycle with official frequency capping, session budgeting, and non-blocking screen progression.
          </p>

          <div className="w-full bg-[#050806] rounded-xl p-3 border border-[#285C38] mb-5 text-left text-xs font-mono">
            <div className="text-[10px] text-[#6B7C70] mb-0.5">LEVELPLAY CONFIGURATION</div>
            <div className="text-white truncate">App Key: {config.appKey}</div>
            <div className="text-[#39FF70] truncate mt-0.5">Ad Unit: {placementName}</div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#20C65A] font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Complies with Google Play & Unity Policies</span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            disabled={!canSkip}
            className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canSkip
                ? 'bg-[#39FF70] text-black hover:bg-[#20C65A] shadow-lg shadow-[#39FF70]/20'
                : 'bg-[#151F18] text-[#6B7C70] border border-[#285C38] cursor-not-allowed'
            }`}
          >
            {canSkip ? `Proceed to ${destinationTitle}` : `Please wait (${countdown}s)`}
          </button>
        </div>

        {/* Ad Footer */}
        <div className="bg-[#0B110D] px-4 py-2 border-t border-[#285C38] text-center">
          <span className="text-[10px] text-[#6B7C70]">
            Official test ad placement. Live production ads require native Android LevelPlay mediation SDK.
          </span>
        </div>
      </div>
    </div>
  );
};
