import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Wifi,
  Cpu,
  HelpCircle,
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ScreenId } from '../../types';

interface AboutScreenProps {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenNativeGuide: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  onBack,
  onNavigate,
  onOpenNativeGuide
}) => {
  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-[#151C18] border border-[#29382F] flex items-center justify-center text-[#B7C4BC] hover:text-white transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display text-white">
            About GameBoost X
          </h1>
          <p className="text-[11px] text-[#7E8B82]">
            Smart Gaming Performance Utility · Version 2.4.0
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#101512] via-[#151C18] to-[#1B241F] border border-[#29382F] rounded-2xl p-5 text-center shadow-xl space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#1B241F] border border-[#39FF88]/40 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-[#39FF88]/10">
          ⚡
        </div>

        <div>
          <h2 className="text-xl font-bold font-display text-white">
            GameBoost <span className="text-[#39FF88]">X</span>
          </h2>
          <div className="text-xs font-mono text-[#39FF88] mt-0.5">
            com.gameboostx.gaming
          </div>
        </div>

        <p className="text-xs text-[#B7C4BC] max-w-sm mx-auto leading-relaxed">
          "GameBoost X helps you organize your games, inspect available device information, monitor network quality, and access supported gaming utilities from one convenient dashboard."
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101512] text-[#39FF88] border border-[#39FF88]/30">
            Android 11+ Ready
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101512] text-[#69B7FF] border border-[#69B7FF]/30">
            4G / 5G / Wi-Fi
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101512] text-[#FFC857] border border-[#FFC857]/30">
            Zero Deception
          </span>
        </div>
      </div>

      {/* Honest Principles & Anti-Slop Charter */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="text-xs font-bold font-display text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#39FF88]" />
          <span>Engineering Integrity Guarantees</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F] flex items-start gap-2">
            <span className="text-[#39FF88] font-bold">1.</span>
            <div className="text-[#B7C4BC]">
              <strong className="text-white block">No Fabricated Metrics:</strong> We never display fake "60 FPS" or "90 FPS" counters. If in-game frame rates are unavailable, we state it explicitly.
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F] flex items-start gap-2">
            <span className="text-[#39FF88] font-bold">2.</span>
            <div className="text-[#B7C4BC]">
              <strong className="text-white block">No Fake RAM Boosters:</strong> Modern Android handles memory management authoritatively. GameBoost X does not promise impossible RAM cleaning or CPU overclocking.
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F] flex items-start gap-2">
            <span className="text-[#39FF88] font-bold">3.</span>
            <div className="text-[#B7C4BC]">
              <strong className="text-white block">Real Network Diagnostics:</strong> Ping and throughput tests execute genuine monotonic HTTP probes with RFC 3550 jitter calculation.
            </div>
          </div>
        </div>
      </div>

      {/* FAQ & Troubleshooting */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-3">
        <div className="text-xs font-bold font-display text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#FFC857]" />
          <span>Frequently Asked Questions</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F]">
            <div className="font-bold text-white mb-1">
              Why doesn't the web preview automatically detect every game installed on my phone?
            </div>
            <p className="text-[#7E8B82] leading-relaxed">
              For security, web browsers operate in an isolated sandbox and cannot inspect Android's internal `PackageManager`. In native APK mode, GameBoost X queries installed games directly.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F]">
            <div className="font-bold text-white mb-1">
              How does the Play button work?
            </div>
            <p className="text-[#7E8B82] leading-relaxed">
              When running on an Android browser, tapping PLAY GAME dispatches an Android application launch intent (`intent://...#Intent;package=...;end;`). We also provide an ADB launcher command.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#101512] border border-[#29382F]">
            <div className="font-bold text-white mb-1">
              Will removing a game from GameBoost X uninstall it?
            </div>
            <p className="text-[#7E8B82] leading-relaxed">
              No. Removing a game from GameBoost X merely removes its shortcut from your launcher library. Your game installation and save data remain completely untouched on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-2">
        <div className="text-xs font-bold font-display text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#69B7FF]" />
          <span>Privacy & Data Protection</span>
        </div>

        <p className="text-xs text-[#B7C4BC] leading-relaxed">
          GameBoost X operates strictly on-device. All game library entries, network history logs, and preferences are stored exclusively in your local storage. No device serials, IMEI numbers, or gameplay telemetry are transmitted to remote servers.
        </p>
      </div>

      {/* Button to open Native APK Kotlin Bridge Guide */}
      <button
        onClick={onOpenNativeGuide}
        className="w-full py-3 bg-[#1B241F] hover:bg-[#20C76B]/15 text-[#39FF88] border border-[#39FF88]/40 font-display font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Smartphone className="w-4 h-4" />
        <span>VIEW NATIVE ANDROID APK & KOTLIN SOURCE</span>
      </button>
    </div>
  );
};
