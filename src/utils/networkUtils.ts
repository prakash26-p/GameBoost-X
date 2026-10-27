import { LatencyQuality } from '../types';

/**
 * Classifies latency into standardized gaming tiers based on prompt requirements:
 * - Excellent: < 30 ms
 * - Good: 30 – 50 ms
 * - Fair: 51 – 100 ms
 * - Poor: > 100 ms
 * - Not measured: if null or failed
 */
export function classifyLatency(latencyMs: number | null): LatencyQuality {
  if (latencyMs === null || isNaN(latencyMs) || latencyMs < 0) {
    return 'Not measured';
  }
  if (latencyMs < 30) {
    return 'Excellent';
  }
  if (latencyMs <= 50) {
    return 'Good';
  }
  if (latencyMs <= 100) {
    return 'Fair';
  }
  return 'Poor';
}

/**
 * Returns human-readable guidance for each quality level
 */
export function getLatencyDescription(quality: LatencyQuality): string {
  switch (quality) {
    case 'Excellent':
      return 'Tournament Grade (<30ms). Smooth competitive gameplay in Free Fire & shooters with minimal input delay.';
    case 'Good':
      return 'Great Gaming Quality (30–50ms). Stable multiplayer experience with minimal hit-registration jitter.';
    case 'Fair':
      return 'Playable (51–100ms). Casual play acceptable, minor bullet lag or character repositioning may occur.';
    case 'Poor':
      return 'High Latency (>100ms). Noticeable delay, rubber-banding, or audio sync drift.';
    case 'Not measured':
    default:
      return 'No active network measurement recorded yet. Run a network test to verify your connection quality.';
  }
}

/**
 * Returns CSS color class associated with latency quality
 */
export function getQualityColorClass(quality: LatencyQuality): {
  text: string;
  bg: string;
  border: string;
} {
  switch (quality) {
    case 'Excellent':
      return { text: 'text-[#39FF88]', bg: 'bg-[#39FF88]/10', border: 'border-[#39FF88]/30' };
    case 'Good':
      return { text: 'text-[#20C76B]', bg: 'bg-[#20C76B]/10', border: 'border-[#20C76B]/30' };
    case 'Fair':
      return { text: 'text-[#FFC857]', bg: 'bg-[#FFC857]/10', border: 'border-[#FFC857]/30' };
    case 'Poor':
      return { text: 'text-[#FF5C68]', bg: 'bg-[#FF5C68]/10', border: 'border-[#FF5C68]/30' };
    case 'Not measured':
    default:
      return { text: 'text-[#7E8B82]', bg: 'bg-[#29382F]/20', border: 'border-[#29382F]' };
  }
}

/**
 * Calculates RFC 3550 standard packet jitter from consecutive latency samples
 * Jitter = average absolute difference between consecutive delays
 */
export function calculateJitter(samples: number[]): number {
  if (!samples || samples.length < 2) return 0;
  let totalDelta = 0;
  for (let i = 1; i < samples.length; i++) {
    totalDelta += Math.abs(samples[i] - samples[i - 1]);
  }
  const jitter = totalDelta / (samples.length - 1);
  return Math.round(jitter * 10) / 10;
}

/**
 * Calculates average latency
 */
export function calculateAverage(samples: number[]): number {
  if (!samples || samples.length === 0) return 0;
  const sum = samples.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / samples.length);
}

/**
 * Formats speed in Mbps with 1 decimal place
 */
export function formatSpeed(mbps: number | null): string {
  if (mbps === null || isNaN(mbps)) return '—';
  if (mbps < 0.1) return '< 0.1 Mbps';
  return `${mbps.toFixed(1)} Mbps`;
}

/**
 * Formats bytes into human-readable B, KB, MB, GB
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
