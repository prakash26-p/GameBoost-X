export type ScreenId =
  | 'home'
  | 'add-game'
  | 'my-games'
  | 'game-details'
  | 'analysis'
  | 'battery'
  | 'network-test'
  | 'performance'
  | 'safe-boost'
  | 'history'
  | 'settings'
  | 'about'
  | 'permissions'
  | 'native-guide'
  | 'subscription';

export type GameCategory =
  | 'Battle Royale'
  | 'Action'
  | 'Shooter'
  | 'MOBA'
  | 'RPG'
  | 'Racing'
  | 'Arcade'
  | 'Strategy'
  | 'Casual'
  | 'Tools'
  | 'Social'
  | 'Media'
  | 'Productivity'
  | 'Communication'
  | 'System';

export type LibraryItemType = 'game' | 'app';

export interface GameRecord {
  id: string;
  name: string;
  packageName: string | null;
  category: GameCategory;
  itemType?: LibraryItemType; // 'game' or 'app'
  icon: string; // Emoji, SVG icon identifier, or image URL
  iconBase64?: string | null; // Real Base64 PNG data URI from Android PackageManager
  accentColor: string;
  isVerifiedInstalled: boolean;
  isLaunchSupported: boolean;
  addedAt: string; // ISO-8601
  lastLaunchedAt: string | null;
  playCount: number;
  packageSizeEstimate?: string;
  developer?: string;
  region?: string;
}

export type SubscriptionPlanId =
  | '1_day'
  | '2_days'
  | '7_days'
  | '1_month'
  | '2_months'
  | '3_months'
  | '6_months'
  | '12_months';

export type PlaySubscriptionProductId =
  | 'gameboostx_adfree_daily'
  | 'gameboostx_adfree_weekly'
  | 'gameboostx_adfree_monthly'
  | 'gameboostx_adfree_annual'
  | 'gameboostx_adfree_quarterly';

export interface PlayBillingPlan {
  productId: PlaySubscriptionProductId;
  title: string;
  priceFormatted: string;
  priceInr: number;
  billingPeriod: string;
  durationDays: number;
  productType?: 'subs' | 'inapp';
  popular?: boolean;
  bestValue?: boolean;
  savingsBadge?: string;
  renewalTerms: string;
  cancellationPolicy: string;
  isConfiguredInPlayConsole?: boolean;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  title: string;
  durationDays: number;
  priceInr: number;
  description: string;
  popular?: boolean;
  bestValue?: boolean;
  savingsBadge?: string;
}

export interface SubscriptionRecord {
  isActive: boolean;
  planId: SubscriptionPlanId | string | null;
  productId?: string | null;
  planTitle: string | null;
  activatedAt: string | null; // ISO-8601
  expiresAt: string | null; // ISO-8601
  transactionRef: string | null;
  verificationMethod: 'google_play' | 'bank_webhook' | 'utr_confirmation' | 'qa_sandbox';
  merchantUpi: string;
  billingProvider?: 'google_play' | 'merchant_upi' | 'qa_sandbox';
  purchaseToken?: string | null;
  orderId?: string | null;
  purchaseState?: 'PURCHASED' | 'PENDING' | 'CANCELLED' | 'UNSPECIFIED';
  isAcknowledged?: boolean;
  renewalTerms?: string;
}

export type LatencyQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Not measured';

export interface NetworkMeasurement {
  id: string;
  latencyMs: number | null;
  jitterMs: number | null;
  minLatencyMs?: number | null;
  maxLatencyMs?: number | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  connectionType: string;
  effectiveType?: string;
  status: 'idle' | 'testing' | 'success' | 'failed' | 'cancelled';
  quality: LatencyQuality;
  measuredAt: string | null;
  endpoint: string;
  errorMessage?: string;
  source: 'GameBoost X HTTP Probe' | 'Native Ping ICMP' | 'WebRTC RTT';
}

export interface DeviceMetrics {
  // RAM
  ramTotalGb: number | null;
  ramAvailableGb: number | null;
  ramUsedGb: number | null;
  ramUsagePercent: number | null;
  ramStatusLabel: string;
  isRamEstimated: boolean;

  // Storage
  storageTotalGb: number | null;
  storageAvailableGb: number | null;
  storageUsedGb: number | null;
  storageUsagePercent: number | null;
  storageScopeLabel: string;

  // Battery
  batteryPercent: number | null;
  isCharging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
  batteryTempC: number | null; // Honest: null on web
  batteryHealthLabel: string;

  // Display & Performance
  displayRefreshRateHz: number | null;
  gameFps: null; // Honest: always null on web
  isOnline: boolean;
  connectionType: string;
  downlinkSpeedMbps: number | null;
  roundTripTimeMs: number | null;
}

export interface OptimizationStepResult {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'skipped' | 'unsupported';
  detail: string;
  category: 'cache' | 'process' | 'network' | 'oem-guidance';
}

export interface OptimizationSummary {
  id: string;
  timestamp: string;
  steps: OptimizationStepResult[];
  successCount: number;
  skippedCount: number;
  unsupportedCount: number;
  tempDataFreedBytes: number;
  gameModeNotice: string;
}

export interface HistoryRecord {
  id: string;
  type: 'network_test' | 'safe_boost' | 'game_launch' | 'system_analysis';
  title: string;
  timestamp: string;
  details: string;
  badge?: string;
  badgeColor?: 'green' | 'yellow' | 'red' | 'blue';
}

export interface BatteryHistoryEntry {
  timestamp: string;
  percent: number;
  isCharging: boolean;
}

export interface LevelPlayConfig {
  appKey: string;
  packageName: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  nativeAdUnitId: string;
  testMode: boolean;
  bannerEnabled: boolean;
  appOpenInterstitialEnabled: boolean;
  minIntervalSeconds: number;
  maxPerSession: number;
}

export interface AppSettings {
  refreshIntervalMs: number; // 2000, 4000, 8000, 0 (disabled)
  enableActiveMonitoring: boolean;
  pingEndpointUrl: string;
  pingEndpointName: string;
  pingTimeoutMs: number;
  reducedMotion: boolean;
  deviceFrameMode: 'mobile-frame' | 'responsive-fluid';
  showNativeBridgeSimulator: boolean;
  levelPlay: LevelPlayConfig;
}

export interface InterstitialAdState {
  status: 'idle' | 'loading' | 'ready' | 'showing' | 'dismissed' | 'failed';
  lastShownAt: number;
  adUnitId: string;
  networkName: string;
  countdownRemaining: number;
}
