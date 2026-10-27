import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  XCircle,
  Download,
  Upload,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Gauge
} from 'lucide-react';
import { NetworkMeasurement, LatencyQuality } from '../../types';
import { NetworkTesterService } from '../../services/networkTester';
import {
  getQualityColorClass,
  getLatencyDescription,
  formatSpeed
} from '../../utils/networkUtils';

interface NetworkTestScreenProps {
  currentTest: NetworkMeasurement | null;
  onTestComplete: (test: NetworkMeasurement) => void;
  configuredEndpoint: string;
  configuredEndpointName: string;
  isOnline: boolean;
}

const PRESET_ENDPOINTS = [
  { name: 'App Origin Gateway (Ultra Fast)', url: '/index.html' },
  { name: 'Google DNS Cloud Anycast', url: 'https://dns.google/resolve?name=example.com' },
  { name: 'Cloudflare DNS Anycast', url: 'https://cloudflare-dns.com/dns-query?name=example.com' }
];

export const NetworkTestScreen: React.FC<NetworkTestScreenProps> = ({
  currentTest,
  onTestComplete,
  configuredEndpoint,
  configuredEndpointName,
  isOnline
}) => {
  const [selectedUrl, setSelectedUrl] = useState(configuredEndpoint || '/index.html');
  const [isTesting, setIsTesting] = useState(false);
  const [testStage, setTestStage] = useState<'idle' | 'latency' | 'throughput' | 'complete'>('idle');
  const [currentProgress, setCurrentProgress] = useState({ sampleIndex: 0, currentLatency: 0 });
  const [testerService] = useState(() => new NetworkTesterService());

  const qualityColors = currentTest
    ? getQualityColorClass(currentTest.quality)
    : { text: 'text-[#7E8B82]', bg: 'bg-[#29382F]/20', border: 'border-[#29382F]' };

  const handleRunTest = async () => {
    if (!isOnline) return;
    setIsTesting(true);
    setTestStage('latency');
    setCurrentProgress({ sampleIndex: 0, currentLatency: 0 });

    try {
      // Step 1: Run 5 monotonic ping probes
      const result = await testerService.testLatency({
        endpoint: selectedUrl,
        sampleCount: 5,
        timeoutMs: 5000,
        onProgress: (idx, lat) => {
          setCurrentProgress({ sampleIndex: idx, currentLatency: Math.round(lat) });
        }
      });

      // Step 2: Measure download/upload throughput
      setTestStage('throughput');
      const speeds = await testerService.testThroughput();
      result.downloadMbps = speeds.downloadMbps;
      result.uploadMbps = speeds.uploadMbps;

      setTestStage('complete');
      onTestComplete(result);
    } catch {
      // Error is encapsulated within testerService
    } finally {
      setIsTesting(false);
    }
  };

  const handleCancelTest = () => {
    testerService.cancelCurrentTest();
    setIsTesting(false);
    setTestStage('idle');
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-white">
          Network Quality Analyzer
        </h1>
        <p className="text-[11px] text-[#7E8B82]">
          Measure real latency, packet jitter, and throughput for mobile gaming
        </p>
      </div>

      {/* Offline Alert if disconnected */}
      {!isOnline && (
        <div className="bg-[#FF5C68]/10 border border-[#FF5C68]/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#FF5C68]">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-bold">Device is Offline</div>
            <div className="text-[11px] text-[#B7C4BC] mt-0.5">
              Please connect to 4G LTE, 5G, or Wi-Fi to execute network diagnostics.
            </div>
          </div>
        </div>
      )}

      {/* Endpoint Selector Card */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5 font-display">
            <Globe className="w-4 h-4 text-[#39FF88]" />
            Test Endpoint
          </span>
          <span className="text-[10px] font-mono text-[#7E8B82]">HTTP Probe</span>
        </div>

        <select
          value={selectedUrl}
          onChange={(e) => setSelectedUrl(e.target.value)}
          disabled={isTesting}
          className="w-full bg-[#101512] border border-[#29382F] focus:border-[#39FF88] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
        >
          {PRESET_ENDPOINTS.map((ep) => (
            <option key={ep.url} value={ep.url}>
              {ep.name}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Latency HUD Dial / Card */}
      <div className="bg-gradient-to-br from-[#101512] via-[#151C18] to-[#1B241F] border border-[#29382F] rounded-2xl p-6 text-center shadow-xl space-y-4">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular Indicator */}
          <div className="w-40 h-40 rounded-full border-4 border-[#29382F] flex flex-col items-center justify-center p-4 relative">
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
                isTesting
                  ? 'border-t-[#39FF88] border-r-transparent border-b-[#39FF88] border-l-transparent animate-spin'
                  : currentTest?.quality === 'Excellent'
                  ? 'border-[#39FF88]'
                  : currentTest?.quality === 'Good'
                  ? 'border-[#20C76B]'
                  : currentTest?.quality === 'Fair'
                  ? 'border-[#FFC857]'
                  : currentTest?.quality === 'Poor'
                  ? 'border-[#FF5C68]'
                  : 'border-[#29382F]'
              }`}
            />

            <div className="text-[10px] font-mono text-[#7E8B82] uppercase tracking-wider mb-1">
              {isTesting ? (testStage === 'latency' ? 'PROBING...' : 'SPEED TEST...') : 'LATENCY'}
            </div>

            <div className="text-3xl font-bold font-mono text-white">
              {isTesting ? (
                currentProgress.currentLatency > 0 ? (
                  currentProgress.currentLatency
                ) : (
                  '...'
                )
              ) : currentTest?.latencyMs !== null && currentTest?.latencyMs !== undefined ? (
                currentTest.latencyMs
              ) : (
                '—'
              )}
            </div>

            <div className="text-xs font-mono text-[#7E8B82]">
              {isTesting ? `Sample ${currentProgress.sampleIndex}/5` : 'Milliseconds'}
            </div>
          </div>
        </div>

        {/* Quality status Pill */}
        <div>
          <span
            className={`inline-block text-xs font-bold font-mono px-3 py-1 rounded-full border ${qualityColors.text} ${qualityColors.bg} ${qualityColors.border}`}
          >
            {isTesting ? 'MEASURING NETWORK...' : currentTest ? currentTest.quality : 'NOT MEASURED'}
          </span>
          <p className="text-xs text-[#B7C4BC] mt-2 max-w-sm mx-auto leading-relaxed">
            {currentTest ? getLatencyDescription(currentTest.quality) : 'Press start to test ping, stability, and speed.'}
          </p>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#29382F]">
          <div className="bg-[#101512] rounded-xl p-2 border border-[#29382F]">
            <div className="text-[9px] font-mono text-[#7E8B82]">JITTER</div>
            <div className="text-xs font-bold font-mono text-white mt-0.5">
              {currentTest?.jitterMs !== null && currentTest?.jitterMs !== undefined
                ? `±${currentTest.jitterMs}ms`
                : '—'}
            </div>
          </div>

          <div className="bg-[#101512] rounded-xl p-2 border border-[#29382F]">
            <div className="text-[9px] font-mono text-[#7E8B82]">MIN / MAX</div>
            <div className="text-[11px] font-mono text-white mt-0.5 truncate">
              {currentTest?.minLatencyMs !== null && currentTest?.maxLatencyMs !== null && currentTest?.minLatencyMs !== undefined
                ? `${currentTest.minLatencyMs}/${currentTest.maxLatencyMs}ms`
                : '—'}
            </div>
          </div>

          <div className="bg-[#101512] rounded-xl p-2 border border-[#29382F]">
            <div className="text-[9px] font-mono text-[#7E8B82]">DOWNLOAD</div>
            <div className="text-xs font-bold font-mono text-[#69B7FF] mt-0.5">
              {formatSpeed(currentTest?.downloadMbps ?? null)}
            </div>
          </div>

          <div className="bg-[#101512] rounded-xl p-2 border border-[#29382F]">
            <div className="text-[9px] font-mono text-[#7E8B82]">UPLOAD</div>
            <div className="text-xs font-bold font-mono text-[#39FF88] mt-0.5">
              {formatSpeed(currentTest?.uploadMbps ?? null)}
            </div>
          </div>
        </div>

        {/* Start / Cancel Action Buttons */}
        <div className="pt-2">
          {isTesting ? (
            <button
              onClick={handleCancelTest}
              className="w-full py-3 bg-[#FF5C68]/15 hover:bg-[#FF5C68]/25 text-[#FF5C68] border border-[#FF5C68]/40 font-display font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>CANCEL TEST</span>
            </button>
          ) : (
            <button
              onClick={handleRunTest}
              disabled={!isOnline}
              className={`w-full py-3.5 bg-[#39FF88] hover:bg-[#20C76B] text-black font-display font-bold text-sm tracking-wide rounded-xl transition-all shadow-lg shadow-[#39FF88]/20 flex items-center justify-center gap-2 cursor-pointer ${
                !isOnline ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>START NETWORK DIAGNOSTIC</span>
            </button>
          )}
        </div>
      </div>

      {/* Network Quality Standards Reference */}
      <div className="bg-[#151C18] border border-[#29382F] rounded-2xl p-4 space-y-2.5">
        <div className="text-xs font-bold font-display text-white">
          Mobile Gaming Latency Tiers
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101512] border border-[#29382F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#39FF88]" />
              <span className="text-white font-medium">Excellent</span>
            </div>
            <span className="font-mono text-[#39FF88]">&lt; 30 ms (Tournament)</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101512] border border-[#29382F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#20C76B]" />
              <span className="text-white font-medium">Good</span>
            </div>
            <span className="font-mono text-[#20C76B]">30 – 50 ms (Smooth)</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101512] border border-[#29382F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFC857]" />
              <span className="text-white font-medium">Fair</span>
            </div>
            <span className="font-mono text-[#FFC857]">51 – 100 ms (Playable)</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#101512] border border-[#29382F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5C68]" />
              <span className="text-white font-medium">Poor</span>
            </div>
            <span className="font-mono text-[#FF5C68]">&gt; 100 ms (Lag spikes)</span>
          </div>
        </div>

        <div className="text-[10px] text-[#7E8B82] leading-relaxed pt-1 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0 mt-0.5" />
          <span>
            Test runs on local and regional anycast networks. Packet loss is only reported when physical drops occur. We never fabricate packet loss from normal HTTP requests.
          </span>
        </div>
      </div>
    </div>
  );
};
