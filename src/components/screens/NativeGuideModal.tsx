import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Smartphone,
  Shield,
  Code2,
  FileCode,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface NativeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeGuideModal: React.FC<NativeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'levelplay' | 'bridge' | 'manifest' | 'gradle'>('levelplay');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const levelPlayKotlin = `package com.prakashrox.gameboostx

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.widget.FrameLayout
import com.ironsource.mediationsdk.IronSource
import com.ironsource.mediationsdk.adunit.adapter.utility.AdInfo
import com.ironsource.mediationsdk.integration.IntegrationHelper
import com.ironsource.mediationsdk.logger.IronSourceError
import com.ironsource.mediationsdk.sdk.LevelPlayBannerListener
import com.ironsource.mediationsdk.sdk.LevelPlayInterstitialListener
import com.ironsource.mediationsdk.ISBannerSize

/**
 * Official Unity LevelPlay (IronSource) Android Advertising Manager
 * Package: com.prakashrox.gameboostx
 * Developer: Prakash Rox Official
 */
class LevelPlayAdController(private val activity: Activity) {

    private val APP_KEY = "1b8e495cd"
    private val BANNER_ID = "rm9wn28m9hwlk81n"       // Verified Banner Ad Unit ID
    private val INTERSTITIAL_ID = "a41guoa3mv1ridan" // Verified Interstitial Ad Unit ID
    private val NATIVE_ID = "uljl02ubr3jc5xu8"       // Verified Native Ad Unit ID

    fun initializeSdk(onReady: () => Unit) {
        // Validate integration in debug builds
        IntegrationHelper.validateIntegration(activity)

        // Initialize LevelPlay with Interstitial and Banner ad units
        IronSource.init(activity, APP_KEY, IronSource.AD_UNIT.INTERSTITIAL, IronSource.AD_UNIT.BANNER)

        setupInterstitialListeners()
        onReady()
    }

    private fun setupInterstitialListeners() {
        IronSource.setLevelPlayInterstitialListener(object : LevelPlayInterstitialListener {
            override fun onAdReady(adInfo: AdInfo) {
                Log.d("LevelPlay", "Interstitial ad is ready: \${adInfo.adUnitId}")
            }
            override fun onAdLoadFailed(error: IronSourceError) {
                Log.e("LevelPlay", "Interstitial load failed: \${error.errorMessage}")
            }
            override fun onAdOpened(adInfo: AdInfo) {}
            override fun onAdClosed(adInfo: AdInfo) {
                Log.d("LevelPlay", "Interstitial closed. Resuming application flow.")
                // Load next interstitial for subsequent eligibility
                IronSource.loadInterstitial()
            }
            override fun onAdShowFailed(error: IronSourceError, adInfo: AdInfo) {
                Log.e("LevelPlay", "Interstitial show failed: \${error.errorMessage}")
            }
            override fun onAdClicked(adInfo: AdInfo) {}
            override fun onAdShowSucceeded(adInfo: AdInfo) {}
        })

        // Preload initial interstitial
        IronSource.loadInterstitial()
    }

    fun showInterstitialIfReady(): Boolean {
        return if (IronSource.isInterstitialReady()) {
            IronSource.showInterstitial(INTERSTITIAL_ID)
            true
        } else {
            false
        }
    }

    fun loadBanner(container: FrameLayout) {
        val banner = IronSource.createBanner(activity, ISBannerSize.BANNER)
        banner.setLevelPlayBannerListener(object : LevelPlayBannerListener {
            override fun onAdLoaded(adInfo: AdInfo) {
                container.removeAllViews()
                container.addView(banner)
            }
            override fun onAdLoadFailed(error: IronSourceError) {
                Log.w("LevelPlay", "Banner load failed: \${error.errorMessage}")
            }
            override fun onAdClicked(adInfo: AdInfo) {}
            override fun onAdScreenPresented(adInfo: AdInfo) {}
            override fun onAdScreenDismissed(adInfo: AdInfo) {}
            override fun onAdLeftApplication(adInfo: AdInfo) {}
        })
        IronSource.loadBanner(banner, BANNER_ID)
    }

    fun onResume() = IronSource.onResume(activity)
    fun onPause() = IronSource.onPause(activity)
}`;

  const bridgeKotlin = `package com.prakashrox.gameboostx

import android.content.Context
import android.content.Intent
import android.app.ActivityManager
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * Hardened Android WebView Bridge for GameBoost X
 * Package: com.prakashrox.gameboostx
 * Exposes strictly authorized, narrowly scoped operations.
 */
class GameBoostBridge(
    private val context: Context,
    private val adController: LevelPlayAdController? = null
) {

    @JavascriptInterface
    fun launchGame(packageName: String): Boolean {
        return try {
            // Validate package identifier format
            if (!packageName.matches(Regex("^[a-zA-Z][a-zA-Z0-9_]*(\\\\.[a-zA-Z][a-zA-Z0-9_]*)+$"))) {
                return false
            }
            val pm = context.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    @JavascriptInterface
    fun showLevelPlayInterstitial(): Boolean {
        return adController?.showInterstitialIfReady() ?: false
    }

    @JavascriptInterface
    fun getHardwareMemory(): String {
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val json = JSONObject()
        json.put("totalMemBytes", memInfo.totalMem)
        json.put("availMemBytes", memInfo.availMem)
        json.put("lowMemory", memInfo.lowMemory)
        return json.toString()
    }
}`;

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.gameboostx.gaming">

    <!-- Essential Android Permissions for LevelPlay & Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Android 11+ Package Visibility Queries (Scoped strictly to games) -->
    <queries>
        <!-- Garena Free Fire & Free Fire MAX -->
        <package android:name="com.dts.freefireth" />
        <package android:name="com.dts.freefiremax" />
        <!-- Battlegrounds Mobile India / PUBG -->
        <package android:name="com.pubg.imobile" />
        <!-- Call of Duty: Mobile -->
        <package android:name="com.activision.callofduty.shooter" />
        <!-- Mobile Legends: Bang Bang -->
        <package android:name="com.mobile.legends" />
        <!-- Genshin Impact -->
        <package android:name="com.miHoYo.GenshinImpact" />
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="GameBoost X"
        android:theme="@style/Theme.GameBoostX">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const gradleKts = `// app/build.gradle.kts
dependencies {
    // AndroidX & Core
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")

    // Official Unity LevelPlay (IronSource) SDK
    implementation("com.ironsource.sdk:mediationsdk:8.4.0")
    implementation("com.google.android.gms:play-services-ads-identifier:18.1.0")
    implementation("com.google.android.gms:play-services-basement:18.4.0")
}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Native Android APK Architecture Guide"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="bg-[#101712] border border-[#285C38] rounded-2xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B110D] px-4 py-3.5 border-b border-[#285C38] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39FF70]/10 text-[#39FF70] border border-[#39FF70]/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Native Android & Unity LevelPlay SDK
              </h2>
              <p className="text-[10px] text-[#6B7C70]">
                Kotlin Source, IronSource Mediation, and WebView Bridge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#151F18] text-[#6B7C70] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#050806] border-b border-[#285C38] overflow-x-auto">
          <button
            onClick={() => setActiveTab('levelplay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'levelplay'
                ? 'bg-[#151F18] text-[#39FF70] border border-[#39FF70]/40'
                : 'text-[#6B7C70] hover:text-white'
            }`}
          >
            LevelPlayAdController.kt
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'bridge'
                ? 'bg-[#151F18] text-[#39FF70] border border-[#39FF70]/40'
                : 'text-[#6B7C70] hover:text-white'
            }`}
          >
            GameBoostBridge.kt
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'manifest'
                ? 'bg-[#151F18] text-[#39FF70] border border-[#39FF70]/40'
                : 'text-[#6B7C70] hover:text-white'
            }`}
          >
            AndroidManifest.xml
          </button>

          <button
            onClick={() => setActiveTab('gradle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'gradle'
                ? 'bg-[#151F18] text-[#39FF70] border border-[#39FF70]/40'
                : 'text-[#6B7C70] hover:text-white'
            }`}
          >
            build.gradle.kts
          </button>
        </div>

        {/* Code Viewport */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[#6B7C70] text-[11px]">
            <span>
              {activeTab === 'levelplay'
                ? 'Official Unity LevelPlay (IronSource) Android SDK implementation'
                : activeTab === 'bridge'
                ? 'Hardened JavascriptInterface bridge'
                : activeTab === 'manifest'
                ? 'Scoped package queries for Free Fire, BGMI, COD'
                : 'LevelPlay SDK 8.4.0+ dependencies'}
            </span>
            <button
              onClick={() => {
                const code =
                  activeTab === 'levelplay'
                    ? levelPlayKotlin
                    : activeTab === 'bridge'
                    ? bridgeKotlin
                    : activeTab === 'manifest'
                    ? manifestXml
                    : gradleKts;
                handleCopy(code, activeTab);
              }}
              className="flex items-center gap-1 text-[11px] font-mono text-[#39FF70] bg-[#0B110D] px-2.5 py-1 rounded border border-[#285C38] hover:border-[#39FF70]/40 transition-colors cursor-pointer"
            >
              {copied === activeTab ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied === activeTab ? 'Copied' : 'Copy Source'}</span>
            </button>
          </div>

          <div className="bg-[#050806] border border-[#285C38] rounded-xl p-3 overflow-x-auto text-[#B7C6BA] text-[11px] leading-relaxed">
            <pre>
              {activeTab === 'levelplay'
                ? levelPlayKotlin
                : activeTab === 'bridge'
                ? bridgeKotlin
                : activeTab === 'manifest'
                ? manifestXml
                : gradleKts}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0B110D] px-4 py-3 border-t border-[#285C38] flex items-center justify-between text-xs text-[#6B7C70]">
          <span>App Key: 1b8e495cd · Test Mode</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#39FF70] text-black font-display font-bold text-xs rounded-xl hover:bg-[#20C65A] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
