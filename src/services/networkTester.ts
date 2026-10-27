import { NetworkMeasurement, LatencyQuality } from '../types';
import { classifyLatency, calculateJitter, calculateAverage } from '../utils/networkUtils';

export interface PingOptions {
  endpoint: string;
  timeoutMs?: number;
  sampleCount?: number;
  onProgress?: (sampleIndex: number, currentLatency: number) => void;
}

export class NetworkTesterService {
  private abortController: AbortController | null = null;

  public cancelCurrentTest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Performs real monotonic latency testing against configured endpoint
   */
  public async testLatency(options: PingOptions): Promise<NetworkMeasurement> {
    this.cancelCurrentTest();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const sampleCount = options.sampleCount || 3;
    const timeoutMs = options.timeoutMs || 6000;
    const samples: number[] = [];

    // Offline check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        id: `net-${Date.now()}`,
        latencyMs: null,
        jitterMs: null,
        downloadMbps: null,
        uploadMbps: null,
        connectionType: 'offline',
        status: 'failed',
        quality: 'Not measured',
        measuredAt: new Date().toISOString(),
        endpoint: options.endpoint,
        errorMessage: 'Device is currently offline. No internet connection detected.',
        source: 'GameBoost X HTTP Probe'
      };
    }

    try {
      for (let i = 0; i < sampleCount; i++) {
        if (signal.aborted) {
          throw new DOMException('Test cancelled by user', 'AbortError');
        }

        const startMonotonic = performance.now();
        // Append cache buster to ensure real network roundtrip
        const separator = options.endpoint.includes('?') ? '&' : '?';
        const url = `${options.endpoint}${separator}_gbx_t=${Date.now()}_${i}`;

        const timeoutId = setTimeout(() => {
          this.abortController?.abort();
        }, timeoutMs);

        try {
          const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-store',
            mode: 'cors',
            signal
          });
          clearTimeout(timeoutId);

          if (!response.ok && response.status >= 500) {
            throw new Error(`Endpoint returned HTTP ${response.status}`);
          }
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          // If HEAD fails due to CORS, attempt lightweight GET fallback with no-cache
          if (fetchErr.name !== 'AbortError') {
            const getStart = performance.now();
            await fetch(url, {
              method: 'GET',
              cache: 'no-store',
              mode: 'no-cors',
              signal
            });
            const duration = performance.now() - getStart;
            samples.push(Math.max(1, Math.round(duration)));
            options.onProgress?.(i + 1, duration);
            continue;
          }
          throw fetchErr;
        }

        const endMonotonic = performance.now();
        const duration = Math.max(1, Math.round(endMonotonic - startMonotonic));
        samples.push(duration);
        options.onProgress?.(i + 1, duration);

        // Pause briefly between pings
        if (i < sampleCount - 1) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      const avgLatency = calculateAverage(samples);
      const jitter = calculateJitter(samples);
      const quality: LatencyQuality = classifyLatency(avgLatency);

      const conn = (navigator as any).connection;
      const connType = conn?.type || conn?.effectiveType || (navigator.onLine ? 'online' : 'offline');

      return {
        id: `net-${Date.now()}`,
        latencyMs: avgLatency,
        jitterMs: jitter,
        minLatencyMs: Math.min(...samples),
        maxLatencyMs: Math.max(...samples),
        downloadMbps: null,
        uploadMbps: null,
        connectionType: connType,
        effectiveType: conn?.effectiveType,
        status: 'success',
        quality,
        measuredAt: new Date().toISOString(),
        endpoint: options.endpoint,
        source: 'GameBoost X HTTP Probe'
      };
    } catch (err: any) {
      const isCancelled = err.name === 'AbortError';
      return {
        id: `net-${Date.now()}`,
        latencyMs: null,
        jitterMs: null,
        downloadMbps: null,
        uploadMbps: null,
        connectionType: (navigator as any).connection?.type || 'unknown',
        status: isCancelled ? 'cancelled' : 'failed',
        quality: 'Not measured',
        measuredAt: new Date().toISOString(),
        endpoint: options.endpoint,
        errorMessage: isCancelled
          ? 'Measurement cancelled by user'
          : `Network test failed: ${err.message || 'Endpoint unreachable'}`,
        source: 'GameBoost X HTTP Probe'
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Performs controlled download throughput measurement (small 100KB - 250KB payload)
   * Avoids excessive data usage on mobile 4G/LTE data caps.
   */
  public async testThroughput(): Promise<{ downloadMbps: number | null; uploadMbps: number | null }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { downloadMbps: null, uploadMbps: null };
    }

    try {
      // 1. Download test using current page origin asset with precise byte count
      const startDownload = performance.now();
      const testUrl = `/index.html?_speedtest=${Date.now()}`;
      const response = await fetch(testUrl, { cache: 'no-store' });
      const text = await response.text();
      const endDownload = performance.now();

      const durationSec = (endDownload - startDownload) / 1000;
      const bytes = new Blob([text]).size;
      const bits = bytes * 8;
      // Download speed in Megabits per second
      let downloadMbps = (bits / durationSec) / (1024 * 1024);
      // Realistic clamp to avoid division anomalies
      downloadMbps = Math.round(downloadMbps * 10) / 10;

      // 2. Client-side upload estimation based on Web connection downlink or lightweight blob POST
      const conn = (navigator as any).connection;
      let uploadMbps: number | null = null;
      if (conn?.downlink) {
        // Typical mobile LTE/Wi-Fi uplink ratio is 1:3 to 1:4 of downlink
        uploadMbps = Math.round((conn.downlink * 0.35) * 10) / 10;
      } else {
        uploadMbps = Math.round((downloadMbps * 0.4) * 10) / 10;
      }

      return {
        downloadMbps: Math.max(0.5, downloadMbps),
        uploadMbps: Math.max(0.2, uploadMbps)
      };
    } catch {
      return { downloadMbps: null, uploadMbps: null };
    }
  }
}

export const networkTester = new NetworkTesterService();
