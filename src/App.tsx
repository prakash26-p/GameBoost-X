/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScreenId,
  GameRecord,
  NetworkMeasurement,
  OptimizationSummary,
  HistoryRecord,
  AppSettings,
  SubscriptionRecord,
  LibraryItemType
} from './types';
import { useDeviceMetrics } from './hooks/useDeviceMetrics';
import { useGameLibrary } from './hooks/useGameLibrary';
import { NetworkTesterService } from './services/networkTester';
import { levelPlayManager, DEFAULT_LEVELPLAY_CONFIG } from './services/levelPlayManager';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LevelPlayBannerView } from './components/LevelPlayBannerView';
import { LevelPlayInterstitialModal } from './components/LevelPlayInterstitialModal';
import { NativeGuideModal } from './components/screens/NativeGuideModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { AddGameScreen } from './components/screens/AddGameScreen';
import { MyGamesScreen } from './components/screens/MyGamesScreen';
import { GameDetailsScreen } from './components/screens/GameDetailsScreen';
import { PhoneAnalysisScreen } from './components/screens/PhoneAnalysisScreen';
import { BatteryStatusScreen } from './components/screens/BatteryStatusScreen';
import { NetworkTestScreen } from './components/screens/NetworkTestScreen';
import { PerformanceScreen } from './components/screens/PerformanceScreen';
import { SafeBoostScreen } from './components/screens/SafeBoostScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { PermissionsScreen } from './components/screens/PermissionsScreen';
import { SubscriptionScreen } from './components/screens/SubscriptionScreen';

const DEFAULT_SETTINGS: AppSettings = {
  refreshIntervalMs: 4000,
  enableActiveMonitoring: true,
  pingEndpointUrl: '/index.html',
  pingEndpointName: 'Local App Gateway',
  pingTimeoutMs: 5000,
  reducedMotion: false,
  deviceFrameMode: 'responsive-fluid',
  showNativeBridgeSimulator: true,
  levelPlay: DEFAULT_LEVELPLAY_CONFIG
};

const HISTORY_STORAGE_KEY = 'gbx_history_v2';
const SETTINGS_STORAGE_KEY = 'gbx_settings_v2';
const SUBSCRIPTION_STORAGE_KEY = 'gbx_subscription_v2';

const DEFAULT_SUBSCRIPTION: SubscriptionRecord = {
  isActive: false,
  planId: null,
  planTitle: null,
  activatedAt: null,
  expiresAt: null,
  transactionRef: null,
  verificationMethod: 'bank_webhook',
  merchantUpi: 'prakash26pr@axl'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [screenStack, setScreenStack] = useState<ScreenId[]>(['home']);

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionRecord>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SUBSCRIPTION, ...parsed };
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return DEFAULT_SUBSCRIPTION;
  });

  const isAdFreeActive = Boolean(
    subscription.isActive &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt).getTime() > Date.now()
  );

  const [addMode, setAddMode] = useState<LibraryItemType>('game');
  const handleOpenAddMode = (mode: LibraryItemType) => {
    setAddMode(mode);
    navigateTo('add-game');
  };

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.warn(e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // History records
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return [];
  });

  // Device metrics hook
  const { metrics, refreshMetrics } = useDeviceMetrics(
    settings.refreshIntervalMs,
    settings.enableActiveMonitoring
  );

  // Game library hook
  const {
    games,
    selectedGame,
    setSelectedGameId,
    addGamesToLibrary,
    removeGameFromLibrary,
    recordGameLaunch,
    resetToDefaultLibrary,
    isDevMode,
    toggleDevSampleMode
  } = useGameLibrary();

  // Network test states
  const [recentTest, setRecentTest] = useState<NetworkMeasurement | null>(null);
  const [isTestingNetwork, setIsTestingNetwork] = useState(false);
  const [testerService] = useState(() => new NetworkTesterService());

  // Unity LevelPlay Interstitial state
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [pendingPostAdAction, setPendingPostAdAction] = useState<(() => void) | null>(null);
  const [adTargetTitle, setAdTargetTitle] = useState('Game');
  const [adPlacementName, setAdPlacementName] = useState('DefaultInterstitial');

  // Native Kotlin Guide Modal
  const [isNativeGuideOpen, setIsNativeGuideOpen] = useState(false);

  // App-open ad check on initial mount (suppressed if VIP Ad-Free is active)
  const hasCheckedAppOpenAd = useRef(false);
  useEffect(() => {
    if (!hasCheckedAppOpenAd.current) {
      hasCheckedAppOpenAd.current = true;
      if (!isAdFreeActive && levelPlayManager.isAppOpenInterstitialEligible()) {
        const timer = setTimeout(() => {
          setAdTargetTitle('Dashboard');
          setAdPlacementName('AppOpenInterstitial');
          setIsAdOpen(true);
          levelPlayManager.markAppOpenShown();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isAdFreeActive]);

  // Sync LevelPlay configuration with manager
  useEffect(() => {
    levelPlayManager.updateConfig(settings.levelPlay);
  }, [settings.levelPlay]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyRecords));
    } catch {}
  }, [historyRecords]);

  // Persist subscription
  useEffect(() => {
    try {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    } catch {}
  }, [subscription]);

  // Safe navigation handler with stack tracking and transition ad eligibility check
  const navigateTo = useCallback((screen: ScreenId, checkAd: boolean = false) => {
    const doNavigate = () => {
      setCurrentScreen(screen);
      setScreenStack((prev) => {
        if (prev[prev.length - 1] === screen) return prev;
        return [...prev, screen];
      });
    };

    if (!isAdFreeActive && checkAd && levelPlayManager.shouldShowInterstitial(screen)) {
      setAdTargetTitle(screen === 'analysis' ? 'System Analysis' : screen);
      setAdPlacementName(`Screen_${screen}`);
      setPendingPostAdAction(() => doNavigate);
      setIsAdOpen(true);
    } else {
      doNavigate();
    }
  }, [isAdFreeActive]);

  // Back action handler
  const handleBack = useCallback(() => {
    if (isNativeGuideOpen) {
      setIsNativeGuideOpen(false);
      return;
    }

    setScreenStack((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('home');
        return ['home'];
      }
      const nextStack = prev.slice(0, -1);
      const targetScreen = nextStack[nextStack.length - 1];
      setCurrentScreen(targetScreen);
      return nextStack;
    });
  }, [isNativeGuideOpen]);

  // Add history record helper
  const addHistoryRecord = useCallback((record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    setHistoryRecords((prev) => [newRecord, ...prev.slice(0, 49)]); // keep latest 50 records
  }, []);

  // Run quick network probe
  const handleRunNetworkTest = useCallback(async () => {
    if (isTestingNetwork || !metrics.isOnline) return;
    setIsTestingNetwork(true);

    try {
      const result = await testerService.testLatency({
        endpoint: settings.pingEndpointUrl,
        sampleCount: 3,
        timeoutMs: settings.pingTimeoutMs
      });
      setRecentTest(result);

      if (result.status === 'success' && result.latencyMs !== null) {
        addHistoryRecord({
          type: 'network_test',
          title: `Latency Test (${result.quality})`,
          details: `Measured ${result.latencyMs}ms with ±${result.jitterMs}ms jitter via ${settings.pingEndpointName}.`,
          badge: `${result.latencyMs}ms`,
          badgeColor: result.quality === 'Excellent' || result.quality === 'Good' ? 'green' : 'yellow'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingNetwork(false);
    }
  }, [isTestingNetwork, metrics.isOnline, settings, testerService, addHistoryRecord]);

  // Launch Game Handler
  const handlePlayGame = useCallback((game: GameRecord) => {
    recordGameLaunch(game.id);

    addHistoryRecord({
      type: 'game_launch',
      title: `Launched ${game.name}`,
      details: `Dispatched launch intent for package '${game.packageName || 'unspecified'}' (Launch #${(game.playCount || 0) + 1}).`,
      badge: 'Intent Dispatched',
      badgeColor: 'blue'
    });

    // Check interstitial ad eligibility with frequency capping
    if (levelPlayManager.shouldShowInterstitial('GameLaunch')) {
      setAdTargetTitle(game.name);
      setAdPlacementName('GameLaunchInterstitial');
      setPendingPostAdAction(() => () => {
        executeNativeGameLaunch(game);
      });
      setIsAdOpen(true);
    } else {
      executeNativeGameLaunch(game);
    }
  }, [recordGameLaunch, addHistoryRecord]);

  // Physical Android Intent dispatch
  const executeNativeGameLaunch = (game: GameRecord) => {
    if (game.packageName) {
      // Try Android Intent URI scheme for mobile Chrome / WebView
      const intentUrl = `intent://#Intent;package=${game.packageName};scheme=android-app;end;`;
      try {
        const link = document.createElement('a');
        link.href = intentUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.warn('Browser could not trigger direct intent:', err);
      }
    }
  };

  const handleSelectGame = (game: GameRecord) => {
    setSelectedGameId(game.id);
    navigateTo('game-details');
  };

  const handleStartClicked = () => {
    if (selectedGame) {
      navigateTo('game-details');
    } else if (games.length > 0) {
      setSelectedGameId(games[0].id);
      navigateTo('game-details');
    } else {
      navigateTo('add-game');
    }
  };

  const handleOptimizationFinished = (summary: OptimizationSummary) => {
    addHistoryRecord({
      type: 'safe_boost',
      title: 'Safe System Boost',
      details: `${summary.successCount} safe operations succeeded. Reclaimed ${Math.round(summary.tempDataFreedBytes / 1024)} KB cache.`,
      badge: `${summary.successCount} Ops OK`,
      badgeColor: 'green'
    });
  };

  const handleAdDismiss = () => {
    setIsAdOpen(false);
    if (pendingPostAdAction) {
      pendingPostAdAction();
      setPendingPostAdAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050806] text-white flex flex-col items-center justify-start antialiased font-sans selection:bg-[#39FF70] selection:text-black">
      {/* Mobile Frame Container (Toggled via settings or header) */}
      <div
        className={`w-full transition-all duration-300 ${
          settings.deviceFrameMode === 'mobile-frame'
            ? 'max-w-md my-0 md:my-6 rounded-none md:rounded-[42px] border-0 md:border-[10px] md:border-[#151F18] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden relative min-h-[92vh] flex flex-col bg-[#050806]'
            : 'max-w-xl mx-auto min-h-screen flex flex-col bg-[#050806]'
        }`}
      >
        {/* Mock Android Status Bar & Camera Punch-hole (When in phone frame mode) */}
        {settings.deviceFrameMode === 'mobile-frame' && (
          <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-mono text-[#6B7C70] bg-[#050806] z-40 select-none">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {/* Center Camera Punch-hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#285C38]" />
            <div className="flex items-center gap-1.5">
              <span>{metrics.connectionType.includes('Wi-Fi') ? 'Wi-Fi' : '5G'}</span>
              <span>{metrics.batteryPercent !== null ? `${metrics.batteryPercent}%` : '100%'}</span>
            </div>
          </div>
        )}

        {/* Global App Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={(screen) => navigateTo(screen)}
          isOnline={metrics.isOnline}
          connectionType={metrics.connectionType}
          frameMode={settings.deviceFrameMode}
          onToggleFrameMode={() =>
            setSettings((prev) => ({
              ...prev,
              deviceFrameMode:
                prev.deviceFrameMode === 'mobile-frame' ? 'responsive-fluid' : 'mobile-frame'
            }))
          }
          onOpenNativeGuide={() => setIsNativeGuideOpen(true)}
          isAdFreeActive={isAdFreeActive}
        />

        {/* Screen Routing Content */}
        <main className="flex-1 px-4 pt-3 overflow-y-auto">
          {currentScreen === 'home' && (
            <HomeScreen
              metrics={metrics}
              recentTest={recentTest}
              games={games}
              selectedGame={selectedGame}
              isDevMode={isDevMode}
              isAdFreeActive={isAdFreeActive}
              onNavigate={(screen) => {
                if (screen === 'analysis') {
                  navigateTo('analysis', true); // Check LevelPlay interstitial eligibility
                } else {
                  navigateTo(screen);
                }
              }}
              onSelectGame={handleSelectGame}
              onStartClicked={handleStartClicked}
              onOpenAddMode={handleOpenAddMode}
            />
          )}

          {currentScreen === 'add-game' && (
            <AddGameScreen
              existingGames={games}
              initialMode={addMode}
              onBack={handleBack}
              onAddGames={(newGames) => {
                addGamesToLibrary(newGames);
                addHistoryRecord({
                  type: 'game_launch',
                  title: `Added ${newGames.length} ${newGames.length === 1 && newGames[0].itemType === 'app' ? 'App' : 'Item'}`,
                  details: `Added ${newGames.map((g) => g.name).join(', ')} to library.`,
                  badge: `+${newGames.length} Added`,
                  badgeColor: 'green'
                });
              }}
            />
          )}

          {currentScreen === 'my-games' && (
            <MyGamesScreen
              games={games}
              onNavigate={(screen) => navigateTo(screen)}
              onSelectGame={handleSelectGame}
              onQuickPlay={handlePlayGame}
              onRemoveGame={(id) => {
                removeGameFromLibrary(id);
                addHistoryRecord({
                  type: 'game_launch',
                  title: 'Removed Game from Library',
                  details: `Game shortcut removed from GameBoost X dashboard.`,
                  badge: 'Removed',
                  badgeColor: 'yellow'
                });
              }}
            />
          )}

          {currentScreen === 'game-details' && (
            <GameDetailsScreen
              game={selectedGame || games[0]}
              metrics={metrics}
              recentTest={recentTest}
              onBack={handleBack}
              onNavigate={(screen) => navigateTo(screen)}
              onRunNetworkTest={handleRunNetworkTest}
              isTestingNetwork={isTestingNetwork}
              onPlayGame={handlePlayGame}
            />
          )}

          {currentScreen === 'analysis' && (
            <PhoneAnalysisScreen
              metrics={metrics}
              recentTest={recentTest}
              onBack={handleBack}
              onRefreshAll={async () => {
                await refreshMetrics();
                await handleRunNetworkTest();
                addHistoryRecord({
                  type: 'system_analysis',
                  title: 'System Analysis Completed',
                  details: 'Comprehensive hardware, storage, battery and frame rate inspection verified.',
                  badge: '14/14 Checked',
                  badgeColor: 'green'
                });
              }}
              onNavigate={(screen) => navigateTo(screen)}
            />
          )}

          {currentScreen === 'battery' && (
            <BatteryStatusScreen
              metrics={metrics}
              onBack={handleBack}
              onRefreshMetrics={refreshMetrics}
            />
          )}

          {currentScreen === 'network-test' && (
            <NetworkTestScreen
              currentTest={recentTest}
              onTestComplete={(test) => {
                setRecentTest(test);
                if (test.status === 'success' && test.latencyMs !== null) {
                  addHistoryRecord({
                    type: 'network_test',
                    title: `Diagnostic Ping: ${test.latencyMs}ms (${test.quality})`,
                    details: `Jitter: ±${test.jitterMs}ms, Download: ${test.downloadMbps || 0}Mbps via ${test.endpoint}.`,
                    badge: `${test.latencyMs}ms`,
                    badgeColor: test.quality === 'Excellent' || test.quality === 'Good' ? 'green' : 'yellow'
                  });
                }
              }}
              configuredEndpoint={settings.pingEndpointUrl}
              configuredEndpointName={settings.pingEndpointName}
              isOnline={metrics.isOnline}
            />
          )}

          {currentScreen === 'performance' && (
            <PerformanceScreen
              metrics={metrics}
              recentTest={recentTest}
              onRefreshMetrics={refreshMetrics}
              isMonitoringActive={settings.enableActiveMonitoring}
              onToggleMonitoring={() =>
                setSettings((prev) => ({
                  ...prev,
                  enableActiveMonitoring: !prev.enableActiveMonitoring
                }))
              }
            />
          )}

          {currentScreen === 'safe-boost' && (
            <SafeBoostScreen
              currentPingMs={recentTest?.latencyMs ?? null}
              onNavigate={(screen) => navigateTo(screen)}
              onOptimizationFinished={handleOptimizationFinished}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              historyRecords={historyRecords}
              onClearHistory={() => setHistoryRecords([])}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={(updated) =>
                setSettings((prev) => ({ ...prev, ...updated }))
              }
              onResetLibrary={() => {
                resetToDefaultLibrary();
                addHistoryRecord({
                  type: 'game_launch',
                  title: 'Cleared Game Library',
                  details: 'Restored clean production empty library state.',
                  badge: 'Cleared',
                  badgeColor: 'yellow'
                });
              }}
              onNavigate={(screen) => navigateTo(screen)}
              onOpenNativeGuide={() => setIsNativeGuideOpen(true)}
              isDevMode={isDevMode}
              onToggleDevMode={toggleDevSampleMode}
            />
          )}

          {currentScreen === 'about' && (
            <AboutScreen
              onBack={handleBack}
              onNavigate={(screen) => navigateTo(screen)}
              onOpenNativeGuide={() => setIsNativeGuideOpen(true)}
            />
          )}

          {currentScreen === 'permissions' && (
            <PermissionsScreen onBack={handleBack} />
          )}

          {currentScreen === 'subscription' && (
            <SubscriptionScreen
              subscription={subscription}
              onBack={handleBack}
              onActivateSubscription={(record) => {
                setSubscription(record);
                addHistoryRecord({
                  type: 'safe_boost',
                  title: `Activated VIP ${record.planTitle}`,
                  details: `Subscribed via UPI ${record.merchantUpi}. Ad-Free enabled until ${new Date(record.expiresAt || '').toLocaleDateString()}.`,
                  badge: 'VIP Active',
                  badgeColor: 'green'
                });
              }}
              onRestorePurchases={async () => {
                try {
                  const saved = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
                  if (saved) {
                    const rec: SubscriptionRecord = JSON.parse(saved);
                    if (rec.isActive && rec.expiresAt && new Date(rec.expiresAt).getTime() > Date.now()) {
                      setSubscription(rec);
                      return true;
                    }
                  }
                } catch {}
                return false;
              }}
            />
          )}

          {/* Unity LevelPlay Test Banner Placement (Above bottom navigation on Dashboard/Screens) */}
          {currentScreen === 'home' && (
            <LevelPlayBannerView
              config={settings.levelPlay}
              isAdFreeActive={isAdFreeActive}
            />
          )}
        </main>

        {/* Global Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => navigateTo(screen)}
          gamesCount={games.length}
        />

        {/* Unity LevelPlay Interstitial Modal */}
        <LevelPlayInterstitialModal
          isOpen={isAdOpen}
          onDismiss={handleAdDismiss}
          destinationTitle={adTargetTitle}
          placementName={adPlacementName}
        />

        {/* Native Android Kotlin Architecture Modal */}
        <NativeGuideModal
          isOpen={isNativeGuideOpen}
          onClose={() => setIsNativeGuideOpen(false)}
        />
      </div>
    </div>
  );
}
