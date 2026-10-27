import { InterstitialAdState } from '../types';

export class AdManagerService {
  private lastAdShownTimestamp: number = 0;
  private minIntervalSeconds: number = 60;
  private testAdUnitId: string = 'ca-app-pub-3940256099942544/1033173712'; // Google official AdMob test interstitial ID

  public setMinInterval(seconds: number): void {
    this.minIntervalSeconds = seconds;
  }

  public shouldShowAd(): boolean {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastAdShownTimestamp) / 1000;
    return elapsedSeconds >= this.minIntervalSeconds;
  }

  public recordAdShown(): void {
    this.lastAdShownTimestamp = Date.now();
  }

  public getTestAdDetails(): { adUnitId: string; network: string; format: string } {
    return {
      adUnitId: this.testAdUnitId,
      network: 'Google Mobile Ads (AdMob)',
      format: 'Full-Screen Interstitial'
    };
  }
}

export const adManager = new AdManagerService();
