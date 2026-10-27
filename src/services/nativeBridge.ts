import { GameRecord, PlaySubscriptionProductId } from '../types';

declare global {
  interface Window {
    GameBoostNative?: {
      isNativeEnvironment(): boolean;
      getInstalledApplications(): string; // JSON array string
      launchApplication(packageName: string): boolean;
      launchPlayBillingFlow(productId: string): boolean;
      queryActivePurchases(): string;
      restorePurchases(): boolean;
      manageSubscription(productId: string): boolean;
      initiateUpiPayment(planId: string, amount: number, txRef: string): boolean;
      showLevelPlayInterstitial(placement: string): boolean;
      setAdFreeStatus(active: boolean): void;
      getDeviceMetrics(): string;
      getProductDetails(): string;
    };
    AndroidBridge?: {
      isNativeAvailable?(): boolean;
      isNativeEnvironment?(): boolean;
      getInstalledApplications?(): string;
      getInstalledGames?(): string;
      isPackageInstalled?(packageName: string): boolean;
      launchApplication?(packageName: string): boolean;
      launchGame?(packageName: string): boolean;
      launchPlayBillingFlow?(productId: string): boolean;
      queryActivePurchases?(): string;
      restorePurchases?(): boolean;
      manageSubscription?(productId: string): boolean;
      getDeviceMemory?(): string;
      getBatteryInfo?(): string;
      showLevelPlayInterstitial?(placement: string): boolean;
      loadLevelPlayBanner?(containerId: string): boolean;
      requestNotificationPermission?(): boolean;
      openAppSettings?(): boolean;
      getProductDetails?(): string;
    };
    onPlayBillingPurchased?: (data: any) => void;
    onPlayBillingStatus?: (status: string, message: string) => void;
    onPlayCatalogUpdated?: (products: any[]) => void;
    onUpiIntentReturned?: (response: string) => void;
  }
}

export class NativeBridgeService {
  /**
   * Get active bridge object (supports GameBoostNative or AndroidBridge)
   */
  private getBridge(): any {
    if (typeof window === 'undefined') return null;
    return window.GameBoostNative || window.AndroidBridge || null;
  }

  /**
   * Checks if the app is currently running inside the native Android APK wrapper
   */
  public isNativeAvailable(): boolean {
    const bridge = this.getBridge();
    if (!bridge) return false;
    return (
      typeof bridge.isNativeEnvironment === 'function' ||
      typeof bridge.isNativeAvailable === 'function' ||
      typeof bridge.getInstalledApplications === 'function'
    );
  }

  /**
   * Discovers verified installed applications & games via native Android PackageManager
   * Strictly returns only what exists on the device.
   */
  public getInstalledApplications(): { apps: GameRecord[]; error: string | null } {
    if (!this.isNativeAvailable()) {
      return {
        apps: [],
        error:
          'Installed application discovery requires running GameBoost X inside the native Android APK. Google Play package enumeration is not available in web preview.'
      };
    }

    const bridge = this.getBridge();
    try {
      let jsonStr = '';
      if (typeof bridge.getInstalledApplications === 'function') {
        jsonStr = bridge.getInstalledApplications();
      } else if (typeof bridge.getInstalledGames === 'function') {
        jsonStr = bridge.getInstalledGames();
      }

      if (!jsonStr) {
        return { apps: [], error: 'No response from Android bridge package discovery.' };
      }

      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        const mapped: GameRecord[] = parsed.map((item: any) => ({
          id: item.id || `pkg-${item.packageName}`,
          name: item.name || item.packageName,
          packageName: item.packageName,
          category: item.isGame ? 'Action' : (item.category || 'Tools'),
          itemType: item.isGame ? 'game' : 'app',
          icon: item.isGame ? '🎮' : '📱',
          iconBase64: item.iconBase64 || null,
          accentColor: item.isGame ? '#39FF70' : '#69B7FF',
          isVerifiedInstalled: true,
          isLaunchSupported: item.isLaunchSupported !== false,
          addedAt: new Date().toISOString(),
          lastLaunchedAt: null,
          playCount: 0,
          developer: 'Verified On-Device Application'
        }));
        return { apps: mapped, error: null };
      }
      return { apps: [], error: 'Invalid data format received from package manager.' };
    } catch (e: any) {
      return { apps: [], error: `Android package discovery failed: ${e.message}` };
    }
  }

  /**
   * Verifies if a specific package is installed on the device
   */
  public isPackageInstalled(packageName: string): boolean | null {
    if (!this.isNativeAvailable()) return null;
    const bridge = this.getBridge();
    if (!bridge) return null;

    if (typeof bridge.isPackageInstalled === 'function') {
      try {
        return bridge.isPackageInstalled(packageName);
      } catch {
        return null;
      }
    }

    // Fallback: check if packageName exists in getInstalledApplications
    try {
      const res = this.getInstalledApplications();
      if (!res.error && res.apps.length > 0) {
        return res.apps.some(
          (app) => app.packageName?.toLowerCase() === packageName.toLowerCase()
        );
      }
    } catch {}

    return null;
  }

  /**
   * Dispatches launch request using real Android launch intent
   */
  public launchApplication(packageName: string): { success: boolean; message: string } {
    if (!packageName) {
      return { success: false, message: 'Invalid package identifier.' };
    }

    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge) {
      try {
        let launched = false;
        if (typeof bridge.launchApplication === 'function') {
          launched = bridge.launchApplication(packageName);
        } else if (typeof bridge.launchGame === 'function') {
          launched = bridge.launchGame(packageName);
        }

        if (launched) {
          return {
            success: true,
            message: `Dispatched Android launch intent for ${packageName}`
          };
        } else {
          return {
            success: false,
            message: `Could not launch ${packageName}. Ensure the package is installed and has a launchable MAIN activity.`
          };
        }
      } catch (e: any) {
        return { success: false, message: `Launch error: ${e.message}` };
      }
    }

    // Web Mode Fallback: Try Android Intent URI scheme
    try {
      const intentUrl = `intent://#Intent;package=${packageName};scheme=android-app;end;`;
      const link = document.createElement('a');
      link.href = intentUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return {
        success: true,
        message: `Dispatched Android Intent URI for package: ${packageName}. (Execution depends on mobile browser intent handling).`
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Web browser could not dispatch intent: ${e.message}. Native Android APK required for direct application launch.`
      };
    }
  }

  /**
   * Launch official Google Play purchase flow for Ad-Free subscription
   */
  public launchPlayBillingFlow(productId: PlaySubscriptionProductId | string): {
    success: boolean;
    message: string;
  } {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.launchPlayBillingFlow === 'function') {
      try {
        const launched = bridge.launchPlayBillingFlow(productId);
        if (launched) {
          return {
            success: true,
            message: `Google Play checkout launched for ${productId}. Complete payment in the Google Play dialog.`
          };
        }
        return {
          success: false,
          message: `Google Play Billing could not initiate for SKU '${productId}'. Ensure the subscription is active in Google Play Console.`
        };
      } catch (e: any) {
        return { success: false, message: `Google Play Billing error: ${e.message}` };
      }
    }

    return {
      success: false,
      message:
        'Google Play Billing requires running inside the signed Android APK build connected to Google Play Services. In this web preview, the official Play Store checkout cannot be invoked.'
    };
  }

  /**
   * Query active Google Play purchases
   */
  public queryActivePurchases(): { hasActiveEntitlement: boolean; purchases: any[] } {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.queryActivePurchases === 'function') {
      try {
        const res = bridge.queryActivePurchases();
        const parsed = JSON.parse(res);
        return {
          hasActiveEntitlement: Boolean(parsed.hasActiveEntitlement),
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : []
        };
      } catch {
        return { hasActiveEntitlement: false, purchases: [] };
      }
    }
    return { hasActiveEntitlement: false, purchases: [] };
  }

  /**
   * Restore previous valid purchases via Google Play Billing
   */
  public restorePurchases(): { success: boolean; message: string } {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.restorePurchases === 'function') {
      try {
        const restored = bridge.restorePurchases();
        return {
          success: restored,
          message: restored
            ? 'Checked Google Play account for previous subscriptions.'
            : 'Could not restore purchases from Google Play.'
        };
      } catch (e: any) {
        return { success: false, message: `Restore error: ${e.message}` };
      }
    }
    return {
      success: false,
      message: 'Restore via Google Play requires running inside the Android APK.'
    };
  }

  /**
   * Direct user to Google Play Subscriptions management screen
   */
  public manageSubscription(productId?: string): void {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.manageSubscription === 'function') {
      bridge.manageSubscription(productId || '');
      return;
    }
    const targetUrl = productId
      ? `https://play.google.com/store/account/subscriptions?package=com.prakashrox.gameboostx&sku=${productId}`
      : 'https://play.google.com/store/account/subscriptions?package=com.prakashrox.gameboostx';
    window.open(targetUrl, '_blank');
  }

  /**
   * Query localized Google Play product details
   */
  public getProductDetails(): Array<{
    productId: string;
    formattedPrice: string;
    title: string;
    isConfiguredInPlayConsole: boolean;
  }> {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.getProductDetails === 'function') {
      try {
        const json = bridge.getProductDetails();
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Query native hardware metrics if available
   */
  public getNativeMetrics(): any | null {
    const bridge = this.getBridge();
    if (this.isNativeAvailable() && bridge && typeof bridge.getDeviceMetrics === 'function') {
      try {
        return JSON.parse(bridge.getDeviceMetrics());
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const nativeBridge = new NativeBridgeService();
