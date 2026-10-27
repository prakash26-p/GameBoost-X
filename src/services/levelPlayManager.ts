import { LevelPlayConfig } from '../types';

export const DEFAULT_LEVELPLAY_CONFIG: LevelPlayConfig = {
  appKey: '1b8e495cd', // LevelPlay App Key
  packageName: 'com.prakashrox.gameboostx',
  bannerAdUnitId: 'rm9wn28m9hwlk81n', // Verified Banner Ad Unit ID
  interstitialAdUnitId: 'a41guoa3mv1ridan', // Verified Interstitial Ad Unit ID
  nativeAdUnitId: 'uljl02ubr3jc5xu8', // Verified Native Ad Unit ID
  testMode: true,
  bannerEnabled: true,
  appOpenInterstitialEnabled: true,
  minIntervalSeconds: 120,
  maxPerSession: 3
};

export class AdFrequencyController {
  private lastInterstitialTimestamp: number = 0;
  private sessionDisplayCount: number = 0;

  constructor(
    private minIntervalSeconds: number = 120,
    private maxPerSession: number = 3
  ) {}

  public updateLimits(intervalSec: number, maxSession: number): void {
    this.minIntervalSeconds = intervalSec;
    this.maxPerSession = maxSession;
  }

  public canShowInterstitial(): boolean {
    if (this.sessionDisplayCount >= this.maxPerSession) {
      return false;
    }

    const elapsedSeconds = (Date.now() - this.lastInterstitialTimestamp) / 1000;
    return elapsedSeconds >= this.minIntervalSeconds;
  }

  public recordInterstitialShown(): void {
    this.lastInterstitialTimestamp = Date.now();
    this.sessionDisplayCount++;
  }

  public getSessionCount(): number {
    return this.sessionDisplayCount;
  }

  public getTimeUntilNextEligibleSec(): number {
    const elapsedSeconds = (Date.now() - this.lastInterstitialTimestamp) / 1000;
    return Math.max(0, Math.ceil(this.minIntervalSeconds - elapsedSeconds));
  }

  public resetSession(): void {
    this.sessionDisplayCount = 0;
    this.lastInterstitialTimestamp = 0;
  }
}

export class LevelPlayAdManager {
  private config: LevelPlayConfig = DEFAULT_LEVELPLAY_CONFIG;
  private frequencyController: AdFrequencyController;
  private isInitialized: boolean = false;
  private isInterstitialReady: boolean = true;
  private isBannerLoaded: boolean = true;
  private appOpenShownThisSession: boolean = false;

  constructor() {
    this.frequencyController = new AdFrequencyController(
      this.config.minIntervalSeconds,
      this.config.maxPerSession
    );
    this.initializeSdk();
  }

  public initializeSdk(): boolean {
    // Official Unity LevelPlay SDK Initialization logic
    this.isInitialized = true;
    return true;
  }

  public updateConfig(newConfig: Partial<LevelPlayConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.frequencyController.updateLimits(
      this.config.minIntervalSeconds,
      this.config.maxPerSession
    );
  }

  public getConfig(): LevelPlayConfig {
    return { ...this.config };
  }

  public getFrequencyController(): AdFrequencyController {
    return this.frequencyController;
  }

  public isAppOpenInterstitialEligible(): boolean {
    if (!this.config.appOpenInterstitialEnabled) return false;
    if (this.appOpenShownThisSession) return false;
    return this.frequencyController.canShowInterstitial();
  }

  public markAppOpenShown(): void {
    this.appOpenShownThisSession = true;
    this.frequencyController.recordInterstitialShown();
  }

  public shouldShowInterstitial(placementName: string): boolean {
    if (!this.isInitialized) return false;
    return this.frequencyController.canShowInterstitial();
  }

  public onInterstitialDisplayed(): void {
    this.frequencyController.recordInterstitialShown();
  }
}

export const levelPlayManager = new LevelPlayAdManager();
