import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { LevelPlayConfig } from '../types';

interface LevelPlayBannerViewProps {
  config: LevelPlayConfig;
  onAdDismiss?: () => void;
  isAdFreeActive?: boolean;
}

export const LevelPlayBannerView: React.FC<LevelPlayBannerViewProps> = ({
  config,
  onAdDismiss,
  isAdFreeActive = false
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [loadError, setLoadError] = useState(false);

  if (isAdFreeActive || !config.bannerEnabled || isDismissed || loadError) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Unity LevelPlay Banner Advertisement"
      className="w-full my-2 px-1 transition-all animate-in fade-in duration-300"
    >
      <div className="relative bg-[#101712] border border-[#285C38] rounded-xl p-2.5 flex items-center justify-between shadow-lg shadow-[#050806]/80 overflow-hidden">
        {/* Neon accent left indicator */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#39FF70]" />

        <div className="flex items-center gap-3 min-w-0 pl-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#151F18] border border-[#285C38] flex items-center justify-center text-sm font-bold text-[#39FF70] flex-shrink-0">
            LP
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[#39FF70]/10 text-[#39FF70] border border-[#39FF70]/30 font-bold">
                {config.testMode ? 'LevelPlay Test Banner' : 'Sponsored'}
              </span>
              <span className="text-[10px] text-[#B7C6BA] font-mono truncate">
                {config.bannerAdUnitId}
              </span>
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              Unity LevelPlay Mediation Engine
            </div>
          </div>
        </div>

        {/* Action / Dismiss */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <button
            onClick={() => {
              setIsDismissed(true);
              onAdDismiss?.();
            }}
            className="w-6 h-6 rounded-md bg-[#151F18] hover:bg-[#285C38] text-[#B7C6BA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss banner advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
