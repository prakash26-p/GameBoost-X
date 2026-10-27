import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { adManager } from '../services/adManager';

interface InterstitialAdModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  destinationTitle?: string;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({
  isOpen,
  onDismiss,
  destinationTitle = 'Next Screen'
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    adManager.recordAdShown();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const testDetails = adManager.getTestAdDetails();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement Interstitial"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-[#151C18] border border-[#29382F] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Ad Header */}
        <div className="bg-[#101512] px-4 py-3 border-b border-[#29382F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#FFC857]/10 text-[#FFC857] border border-[#FFC857]/30 rounded">
              Test Ad
            </span>
            <span className="text-xs text-[#7E8B82] truncate max-w-[140px]">
              {testDetails.network}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!canSkip ? (
              <span className="text-xs font-mono text-[#B7C4BC] bg-[#1B241F] px-2.5 py-1 rounded-md border border-[#29382F]">
                Reward in {countdown}s
              </span>
            ) : (
              <button
                onClick={onDismiss}
                className="flex items-center gap-1 text-xs font-medium bg-[#39FF88] text-black px-3 py-1 rounded-md hover:bg-[#20C76B] transition-colors cursor-pointer"
                aria-label="Close advertisement and continue"
              >
                <span>Continue</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Ad Creative Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B241F] to-[#29382F] border border-[#39FF88]/30 flex items-center justify-center text-3xl shadow-lg mb-4">
            🎮
          </div>

          <div className="text-[11px] font-mono text-[#39FF88] mb-1">
            GOOGLE MOBILE ADS SDK PLACEHOLDER
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            Next-Gen Android Mobile Gaming
          </h3>
          <p className="text-xs text-[#B7C4BC] leading-relaxed mb-6">
            Supporting official AdMob interstitial lifecycle with frequency capping & safe non-intrusive ad placement.
          </p>

          <div className="w-full bg-[#101512] rounded-xl p-3 border border-[#29382F] mb-6 text-left">
            <div className="text-[10px] font-mono text-[#7E8B82] mb-1">Ad Unit Configuration</div>
            <div className="text-xs font-mono text-[#FFFFFF] truncate">
              ID: {testDetails.adUnitId}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#39FF88]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Complies with Google Play Developer Policy</span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            disabled={!canSkip}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canSkip
                ? 'bg-[#39FF88] text-black hover:bg-[#20C76B] shadow-lg shadow-[#39FF88]/20'
                : 'bg-[#1B241F] text-[#7E8B82] border border-[#29382F] cursor-not-allowed'
            }`}
          >
            {canSkip ? `Proceed to ${destinationTitle}` : `Please wait (${countdown}s)`}
          </button>
        </div>

        {/* Ad Footer notice */}
        <div className="bg-[#101512] px-4 py-2 border-t border-[#29382F] text-center">
          <span className="text-[10px] text-[#7E8B82]">
            Development mode interstitial. Real production ads require native Android AdMob SDK.
          </span>
        </div>
      </div>
    </div>
  );
};
